import { zValidator } from "@hono/zod-validator";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { logs, roomAnniversary } from "../../../drizzle/schema";
import type { Bindings } from "../../middleware/db";
import { getCurrentTimestamp } from "../utils/dateTimeConverter";

const app = new Hono<{ Bindings: Bindings }>();

export const route = app
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
					error: 'Failed to insert a log'
				}, 500);
			}
		},
	)
	.get(
		"/:user_id",
		zValidator(
			"param",
			z.object({
				user_id: z.string(),
			}),
		),
		async (c) => {
			const { user_id } = c.req.valid("param");

			try {
				const user_logs = await c.var.db
					.select()
					.from(logs)
					.where(eq(logs.userId, Number(user_id)))
					.orderBy(
						desc(logs.createdAt)
					);

				return c.json(user_logs);

			} catch (error) {
				console.error('Database error:', error);
				return c.json({
					success: false,
					error: 'Failed to find logs for the userId'
				}, 500);
			}
		},
	);