import * as fs from "fs";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
	secure: true,
});

const cloudinaryUpload = (
	file: string,
	cloudinaryFolder: string
): Promise<string> => {
	return new Promise(async (resolve, reject) => {
		const BYTES_PER_MB = 1024 ** 2;

		const fileStats = await fs.promises.stat(file);

		const fileSizeInMb = fileStats.size / BYTES_PER_MB;

		if (fileSizeInMb > 1.0) reject("File is larger than 1 MB");

		cloudinary.uploader
			.upload(file, { use_filename: true, folder: cloudinaryFolder })
			.then((result) => {
				resolve(result.secure_url);
			})
			.catch((error) => {
				reject(error);
			});
	});
};

export default cloudinaryUpload;
