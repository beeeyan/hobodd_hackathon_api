import { Hono } from "hono";
import type { Bindings } from "hono/types";
import { db } from "../middleware/db.js";
import { route as greetingRoute } from "./routes/greeting.js";
import { route as helloRoute } from "./routes/hello.js";

type Input = {
	basePath: string;
};

export function createApp({ basePath }: Input) {
	let app = new Hono<{ Bindings: Bindings }>();

	app = app.basePath(basePath);

	// グローバルミドルウェアとしてwithDBを追加
	app.use("*", db);

	// prettier-ignore
	const route = app
		.route("/hello", helloRoute)
		.route("/greeting", greetingRoute);

	return { app, route };
}
