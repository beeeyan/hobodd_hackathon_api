import { Hono } from "hono";
import type { Bindings } from "hono/types";
import { db } from "../middleware/db.js";
import { route as anniversaryRoute } from "./routes/anniversary.js";
import { route as calendarRoute } from "./routes/calendar.js";
import { route as logRoute } from "./routes/log.js";
import { route as userRoute } from "./routes/user.js";

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
		.route("/user", userRoute)
		.route("/log", logRoute)
		.route("/calendar", calendarRoute)
		.route("/anniversary", anniversaryRoute)

	return { app, route };
}
