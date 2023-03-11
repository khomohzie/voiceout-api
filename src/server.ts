// Load environment variables from .env file
require("dotenv").config();

// Load express
import app from "./app";
import { connect, disconnect } from "./config/db";
import redisClient from "./utils/redis.util";

const PORT: number = process.env.PORT || 8080;

// Connect to MONGODB database
connect();

// Connect to REDIS
redisClient
	.connect()
	.then(() => {
		if (process.env.NODE_ENV !== "test") {
			console.log("🛠\tRedis - Connection open");
		}
	})
	.catch((err: any) => {
		console.log(err);
	});

app.listen(PORT, "0.0.0.0", () => {
	console.log(`SERVER LISTENING ON PORT ${PORT}`);
});
