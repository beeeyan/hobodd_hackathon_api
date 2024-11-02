import { zValidator } from "@hono/zod-validator";
import { asc, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { logs, users } from "../../../drizzle/schema";
import type { Bindings } from "../../middleware/db";

const app = new Hono<{ Bindings: Bindings }>();

export const route = app
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
					error: 'Failed to find logs for the room'
				}, 500);
			}
		},
	);
