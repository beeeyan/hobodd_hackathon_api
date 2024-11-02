import { zValidator } from "@hono/zod-validator";
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