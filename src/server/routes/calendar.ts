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
			const tomorrow = getFormattedDate(1); // 明日の日付を取得

			try {
				if (!room_id) {
					// room_idがない場合は、ことわざのみを取得
					const proverb_data = await c.var.db
						.select({
							date: proverb.date,
							title: proverb.proverbTitle,
							message: proverb.proverbDescription,
						})
						.from(proverb)
						.where(
							and(
								gt(proverb.date, last_clicked_date ?? ''),
								lte(proverb.date, tomorrow)
							)
						)
						.orderBy(asc(proverb.date));

					return c.json(proverb_data);
				}

				// room_idがある場合は、ことわざとroomAnniversaryの両方を取得し、
				// 同じ日付の場合はroomAnniversaryを優先
				const combined_data = await c.var.db
					.select({
						date: sql<string>`COALESCE(ra.date, p.date)`.as('date'),
						source: sql<string>`CASE
															WHEN ra.date IS NOT NULL THEN 'anniversary'
															ELSE 'proverb'
													END`.as('source'),
						title: sql<string>`COALESCE(ra.name, p.proverb_title)`.as('title'),
						message: sql<string>`COALESCE(ra.message, p.proverb_description)`.as('message'),
					})
					.from(
						c.var.db
							.select({
								date: roomAnniversary.date,
								name: roomAnniversary.name,
								message: roomAnniversary.message,
							})
							.from(roomAnniversary)
							.where(
								and(
									eq(roomAnniversary.roomId, room_id),
									gt(roomAnniversary.date, last_clicked_date ?? ''),
									lte(roomAnniversary.date, tomorrow)
								)
							)
							.as('ra')
					)
					.fullJoin(
						c.var.db
							.select({
								date: proverb.date,
								proverb_title: proverb.proverbTitle,
								proverb_description: proverb.proverbDescription,
							})
							.from(proverb)
							.where(
								and(
									gt(proverb.date, last_clicked_date ?? ''),
									lte(proverb.date, tomorrow)
								)
							)
							.as('p'),
						eq(sql`ra.date`, sql`p.date`)
					)
					.orderBy(asc(sql`COALESCE(ra.date, p.date)`));

				// 同じ日付の場合はroomAnniversaryを優先して重複を除去
				const uniqueData = combined_data.reduce((acc, curr) => {
					const existingIndex = acc.findIndex(item => item.date === curr.date);
					if (existingIndex === -1) {
						// 新しい日付のデータ
						acc.push({
							date: curr.date,
							title: curr.title,
							message: curr.message
						});
					} else if (curr.source === 'anniversary') {
						// 同じ日付でroomAnniversaryのデータの場合、置き換え
						acc[existingIndex] = {
							date: curr.date,
							title: curr.title,
							message: curr.message
						};
					}
					return acc;
				}, [] as { date: string; title: string; message: string }[]);

				return c.json(uniqueData);

			} catch (error) {
				// エラーハンドリング
				console.error('Database error:', error);
				return c.json({
					success: false,
					error: 'Failed to fetch calendar data'
				}, 500);
			}
		},
	);
