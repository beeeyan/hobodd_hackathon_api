import { defineConfig } from "drizzle-kit";
export default defineConfig({
	dialect: "sqlite",
	schema: "./drizzle/schema.ts",
	out: "./drizzle",
	driver: "d1-http",
	dbCredentials: {
		accountId: "708669cf9502350cda7690153b924a87",
		databaseId: "e05e7327-bd0e-44ad-8789-fff3426440a8",
		token: "PqvQ-cKuNTHqMYvAjtbEg4w6V_4V1zL5vprRQVAM",
	},
});
