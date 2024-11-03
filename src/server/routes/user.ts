import { zValidator } from "@hono/zod-validator";
import { asc, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { logs, room, users } from "../../../drizzle/schema";
import type { Bindings } from "../../middleware/db";
import { generateULIDLike } from '../utils/generateUniqueID';
const app = new Hono<{ Bindings: Bindings }>();

export const route = app
	.post(
		"/",
		zValidator(
			"json",
			z.object({
				name: z.string(),
				roomName: z.string()
			}),
		),
		async (c) => {
			const { name, roomName } = c.req.valid("json");
			const roomId = generateULIDLike();
			const now = new Date().toLocaleString();

			try {

				const result = await c.var.db.insert(room).values({ roomId: roomId, name: roomName, createdAt: now, updatedAt: now }).returning();
				const result2 = await c.var.db.insert(users).values({ roomId: roomId, username: name, createdAt: now, updatedAt: now }).returning();

				return c.json({
					"user_id": result2[0].id,
					"room_id": result2[0].roomId
				});

			} catch (error) {
				// エラーハンドリング
				console.error('Database error:', error);
				return c.json({
					success: false,
					error: 'Failed to create room and user'
				}, 500);
			}
		},
	)
	.post(
		"/room",
		zValidator(
			"json",
			z.object({
				name: z.string(),
				roomId: z.string()
			}),
		),
		async (c) => {
			const { name, roomId } = c.req.valid("json");
			const now = new Date().toLocaleString();

			try {

				const response = await c.var.db.select().from(room).where(eq(room.roomId, roomId));
				console.log({ response })
				if (response.length === 0) {
					c.status(404);
					return c.json({
						status: false,
						code: "NotFoundError",
						message: "No room found for the submitted roomId."
					});
				}

				const result = await c.var.db.insert(users).values({ roomId: roomId, username: name, createdAt: now, updatedAt: now }).returning();

				return c.json({
					user_id: result[0].id,
					room_name: response[0].name
				});

			} catch (error) {
				console.error('Database error:', error);
				return c.json({
					success: false,
					error: 'Failed to create user'
				}, 500);
			}
		},
	)
	.get(
		"/:room_id",
		zValidator(
			"param",
			z.object({
				room_id: z.string(),
			}),
		),
		async (c) => {
			const { room_id } = c.req.valid("param");

			try {

				const latest_user_logs_of_the_room = await c.var.db
					.select({
						userId: users.id,
						username: users.username,
						createdAt: users.createdAt,
						sticker: logs.sticker,
						clickedAt: logs.clickedAt,
					})
					.from(users)
					.leftJoin(logs, eq(users.id, logs.userId))
					.where(eq(users.roomId, room_id))
					.groupBy(users.id)
					.orderBy(
						asc(users.createdAt),
						desc(logs.clickedAt)
					);

				console.log({ latest_user_logs_of_the_room })

				return c.json(latest_user_logs_of_the_room);

			} catch (error) {
				// エラーハンドリング
				console.error('Database error:', error);
				return c.json({
					success: false,
					error: 'Failed to find the latest user logs of the room'
				}, 500);
			}
		},
	)
