import { zValidator } from "@hono/zod-validator";
import { desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { logs } from "../../../drizzle/schema";
import type { Bindings } from "../../middleware/db";
import { getCurrentTimestamp } from "../utils/dateTimeConverter";

const app = new Hono<{ Bindings: Bindings }>();

export const route = app
	.post(
		"/",
		zValidator(
			"json",
			z.object({
				user_id: z.number(),
				clicked_date: z.string().nullable(),
				status: z.string().nullable()
			}),
		),
		async (c) => {
			const { user_id, clicked_date, status } = c.req.valid("json");
			const now = getCurrentTimestamp();
			try {

				const result = await c.var.db.insert(logs).values({ clickedAt: clicked_date, userId: user_id, sticker: status, createdAt: now }).returning();
				console.log({ result })

				return c.json({});

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