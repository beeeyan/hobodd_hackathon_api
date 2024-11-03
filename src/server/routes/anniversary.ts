import { zValidator } from "@hono/zod-validator";
import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { roomAnniversary } from "../../../drizzle/schema";
import type { Bindings } from "../../middleware/db";
import { getCurrentTimestamp } from "../utils/dateTimeConverter";

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
				const group_anniversaries = await c.var.db
					.select()
					.from(roomAnniversary)
					.where(eq(roomAnniversary.roomId, room_id))
					.orderBy(
						desc(roomAnniversary.date)
					);

				return c.json(group_anniversaries);

			} catch (error) {
				console.error('Database error:', error);
				return c.json({
					success: false,
					error: 'Failed to find group_anniversaries for the groupId'
				}, 500);
			}
		},
	)
	.post(
		"/",
		zValidator(
			"json",
			z.object({
				room_id: z.string(),
				date: z.string(), // 記念日
				name: z.string(), // 記念日名
				message: z.string().optional()
			}),
		),
		async (c) => {
			const { room_id, date, name, message } = c.req.valid("json");
			const now = getCurrentTimestamp();

			try {

				const result = await c.var.db.insert(roomAnniversary).values({ roomId: room_id, date: date, name: name, message: message, createdAt: now, updatedAt: now }).returning();

				return c.json(result);

			} catch (error) {
				// エラーハンドリング
				console.error('Database error:', error);
				return c.json({
					success: false,
					error: 'Failed to insert a roomAnniversary'
				}, 500);
			}
		},
	)
	.put(
		"/",
		zValidator(
			"json",
			z.object({
				room_id: z.string(),
				date: z.string(), // 記念日
				name: z.string(), // 記念日名
				message: z.string().optional()
			}),
		),
		async (c) => {
			const { room_id, date, name, message } = c.req.valid("json");
			const now = getCurrentTimestamp();

			try {

				const result = await c.var.db.update(roomAnniversary).set({ name: name, message: message, createdAt: now, updatedAt: now })
					.where(
						and(
							eq(roomAnniversary.roomId, room_id),
							eq(roomAnniversary.date, date)
						)
					)
					.returning();

				return c.json(result);

			} catch (error) {
				// エラーハンドリング
				console.error('Database error:', error);
				return c.json({
					success: false,
					error: 'Failed to update an roomAnniversary'
				}, 500);
			}
		},
	)
	.delete(
		"/",
		zValidator(
			"json",
			z.object({
				room_id: z.string(),
				date: z.string(), // 記念日
			}),
		),
		async (c) => {
			const { room_id, date } = c.req.valid("json");

			try {

				const result = await c.var.db.delete(roomAnniversary)
					.where(
						and(
							eq(roomAnniversary.roomId, room_id),
							eq(roomAnniversary.date, date)
						)
					)
					.returning();

				return c.json(result);

			} catch (error) {
				// エラーハンドリング
				console.error('Database error:', error);
				return c.json({
					success: false,
					error: 'Failed to delete an roomAnniversary'
				}, 500);
			}
		},
	)
