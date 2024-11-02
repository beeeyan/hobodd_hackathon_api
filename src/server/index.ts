import { Hono } from "hono";
import type { Bindings } from "hono/types";
import { db } from "../middleware/db.js";
import { route as calendarRoute } from "./routes/calendar.js";
import { route as greetingRoute } from "./routes/greeting.js";
import { route as helloRoute } from "./routes/hello.js";
import { route as logRoute } from "./routes/log.js";
import { route as roomRoute } from "./routes/room.js";
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
		.route("/hello", helloRoute)
		.route("/greeting", greetingRoute)
		.route("/user", userRoute)
		.route("/room", roomRoute)
		.route("/log", logRoute)
		.route("/calendar", calendarRoute);

	return { app, route };
}
