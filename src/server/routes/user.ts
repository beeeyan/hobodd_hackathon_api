import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { room, users } from "../../../drizzle/schema";
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
				// // トランザクションの開始
				// const result = await c.var.db.transaction(async (tx) => {
				// 	// まずroomを登録
				// 	await tx.insert(room).values({
				// 		roomId: roomId,
				// 		name: roomName,
				// 		createdAt: now,
				// 		updatedAt: now
				// 	});

				// 	// 次にユーザーを登録
				// 	const userResult = await tx.insert(users).values({
				// 		roomId: roomId,
				// 		username: name,
				// 		createdAt: now,
				// 		updatedAt: now
				// 	}).returning();

				// 	return userResult;
				// });


				const result = await c.var.db.insert(room).values({ roomId: roomId, name: roomName, createdAt: now, updatedAt: now }).returning();
				const result2 = await c.var.db.insert(users).values({ roomId: roomId, username: name, createdAt: now, updatedAt: now }).returning();

				return c.json({
					"status": "success",
					"message": "Resource created successfully."
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
	.get(
		"/:name",
		zValidator(
			"param",
			z.object({
				name: z.string(),
			}),
		),
		async (c) => {
			const { name } = c.req.valid("param");
			return c.json({ message: `hello ${name}` });
		},
	);
