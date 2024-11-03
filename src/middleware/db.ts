import { drizzle } from "drizzle-orm/d1";
import type { MiddlewareHandler } from "hono";

export type Bindings = {
	DB: D1Database;
};

// DrizzleのDBインスタンスの型を拡張
declare module "hono" {
	interface ContextVariableMap {
		db: ReturnType<typeof drizzle>;
	}
}

export const db: MiddlewareHandler<{ Bindings: Bindings }> = async (
	c,
	next,
) => {
	const db = drizzle(c.env.DB, { logger: true });
	c.set("db", db);
	await next();
};
