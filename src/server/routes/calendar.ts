import { zValidator } from "@hono/zod-validator";
import { and, asc, eq, gt, lte, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { proverb, roomAnniversary } from "../../../drizzle/schema";
import type { Bindings } from "../../middleware/db";
import { getFormattedDate } from "../utils/dateTimeConverter";

const app = new Hono<{ Bindings: Bindings }>();

export const route = app
	.get(
		"/",
		zValidator(
			"query",
			z.object({
				room_id: z.string().optional(),
				last_clicked_date: z.string()
			}),
		),
		async (c) => {
			const room_id = c.req.query("room_id");
			const last_clicked_date = c.req.query("last_clicked_date");
			const today = getFormattedDate();

			try {
				const calendar_data = await c.var.db
					.select({
						date: sql<string>`COALESCE(${roomAnniversary.date}, ${proverb.date})`,
						title: sql<string>`COALESCE(${roomAnniversary.name}, ${proverb.proverbTitle})`,
						message: sql<string>`COALESCE(${roomAnniversary.message}, ${proverb.proverbDescription})`,
					})
					.from(roomAnniversary)
					.fullJoin(
						proverb,
						eq(roomAnniversary.date, proverb.date)
					)
					.where(
						and(
							// room_idがある場合のみ条件に追加
							...(room_id
								? [eq(roomAnniversary.roomId, room_id)]
								: []),
							gt(sql`COALESCE(${roomAnniversary.date}, ${proverb.date})`, last_clicked_date),
							lte(sql`COALESCE(${roomAnniversary.date}, ${proverb.date})`, today)
						)
					)
					.orderBy(asc(sql`COALESCE(${roomAnniversary.date}, ${proverb.date})`));

				console.log({ calendar_data })

				return c.json(calendar_data);

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
