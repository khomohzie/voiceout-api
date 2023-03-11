import mongoose from "mongoose";

const MONGO_URI: string = process.env.MONGO_URI || "mongodb://localhost:27020";

const uri: string =
	process.env.NODE_ENV === "production"
		? process.env.MONGO_URI_CLOUD!
		: MONGO_URI!;

export async function connect(): Promise<void> {
	await mongoose
		.connect(uri)
		.then(() => {
			console.log("Connected to MongoDB");
		})
		.catch((e: any) => {
			console.log(e);
		});
}

export async function disconnect(): Promise<void> {
	await mongoose.disconnect().then(() => {
		console.log("Disconnected from MongoDB");
	});
}
