import { sql } from "drizzle-orm";
import { integer, numeric, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const users = sqliteTable("users", {
	id: integer().primaryKey({ autoIncrement: true }),
	username: text(),
	roomId: text("room_id"),
	createdAt: numeric("created_at"),
	updatedAt: numeric("updated_at"),
	deletedAt: numeric("deleted_at").default(sql`(null)`),
});

export const logs = sqliteTable("logs", {
	id: integer().primaryKey({ autoIncrement: true }),
	clickedAt: numeric("clicked_at"),
	userId: integer("user_id"),
	sticker: text(),
	body: text().default("sql`(null)`"),
	createdAt: numeric("created_at"),
});

export const room = sqliteTable("room", {
	roomId: text("room_id").primaryKey(),
	name: text(),
	createdAt: numeric("created_at"),
	updatedAt: numeric("updated_at"),
	deletedAt: numeric("deleted_at").default(sql`(null)`),
});

export const roomAnniversary = sqliteTable("room_anniversary", {
	id: integer().primaryKey({ autoIncrement: true }),
	roomId: text("room_id"),
	name: text(),
	message: text(),
	date: numeric(),
	createdAt: numeric("created_at"),
	updatedAt: numeric("updated_at"),
	deletedAt: numeric("deleted_at").default(sql`(null)`),
});

export const proverb = sqliteTable("proverb", {
	id: integer().primaryKey({ autoIncrement: true }),
	proverbTitle: text("proverb_title"),
	proverbDescription: text("proverb_description"),
	date: numeric(),
});

export const cfKv = sqliteTable("_cf_KV", {
});
