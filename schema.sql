CREATE TABLE "users" (
  "id" integer PRIMARY KEY AUTOINCREMENT,
  "username" varchar,
  "room_id" text,
  "created_at" timestamp,
  "updated_at" timestamp,
  "deleted_at" timestamp DEFAULT null
);

CREATE TABLE "logs" (
  "id" integer PRIMARY KEY AUTOINCREMENT,
  "clicked_at" text,
  "user_id" integer,
  "sticker" varchar,
  "body" text DEFAULT null,
  "created_at" timestamp
);

CREATE TABLE "room" (
  "room_id" text PRIMARY KEY,
  "name" text,
  "created_at" timestamp,
  "updated_at" timestamp,
  "deleted_at" timestamp DEFAULT null
);

CREATE TABLE "room_anniversary" (
  "id" integer PRIMARY KEY AUTOINCREMENT,
  "room_id" text,
  "name" text,
  "message" text,
  "date" date,
  "created_at" timestamp,
  "updated_at" timestamp,
  "deleted_at" timestamp DEFAULT null
);

CREATE TABLE "proverb" (
  "id" integer PRIMARY KEY AUTOINCREMENT,
  "proverb_title" text,
  "proverb_description" text,
  "date" date
);