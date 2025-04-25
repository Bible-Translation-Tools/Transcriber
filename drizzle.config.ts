import { defineConfig } from "drizzle-kit";
import { globSync } from "fast-glob";

// This is config for generating migrations and for using drizzle studio if you want a viewer of data
export default defineConfig({
	schema: "./src/api/persistence/schema.ts",
	dialect: "sqlite",
	out: "./drizzle",

	dbCredentials: {
		// Grab the url of the latest sqlite file. ONly one in our project, so saves having to use an env var for this local file
		url: globSync(".wrangler/**/*.sqlite", { stats: true }).sort(
			(a, b) => (b.stats?.ctimeMs ?? 0) - (a.stats?.ctimeMs ?? 0),
		)[0].path,
	},
});
