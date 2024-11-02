import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { proverb } from "../../../drizzle/schema";
import type { Bindings } from "../../middleware/db";

const app = new Hono<{ Bindings: Bindings }>();

export const route = app
	.get("/", async (c) => {
		try {
			// c.var.db
			// const db = drizzle(c.env.DB);
			const allUsers = await c.var.db.select().from(proverb); // クエリの実行
			return c.json(allUsers);
			// return c.json({ message: "greeting" });
		} catch (e) {
			return c.json({ err: e }, 500);
		}
		// return c.json({ message: 'greeting' });
	})
	.post(
		"/",
		zValidator(
			"json",
			z.object({
				name: z.string(),
				age: z.number(),
			}),
		),
		async (c) => {
			const { name, age } = c.req.valid("json");
			return c.json({ message: `hello ${name}, you are ${age} years old` });
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
