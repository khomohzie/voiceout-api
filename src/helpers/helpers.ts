// import bcrypt from "bcrypt";
// import dayjs from "dayjs";
// import Cryptr from "cryptr";
import redisClient from "@utils/redis.util";
import moment from "moment";

// const cryptr = new Cryptr(`${process.env.CRYPTR_CODE}`);

// export async function hash(param) {
// 	return await bcrypt.hash(param, 12);
// }

// export async function verifyHash(param, hashedPram) {
// 	return await bcrypt.compare(param, hashedPram);
// }

// get total time spent or duration
export async function convertTotalTime({
	time,
}: {
	time: number;
}): Promise<string> {
	const formattedSeconds = moment()
		.startOf("day")
		.seconds(time)
		.format("HH:mm:ss");

	return formattedSeconds;
}

interface IDuration extends moment.Duration {
	_milliseconds?: any;
}

// calculate the daily total time
export async function calculateDailyTotalTime({
	lastTotalTime,
	currentTotalTime,
}: {
	lastTotalTime: string;
	currentTotalTime: string;
}): Promise<{ unformatted?: string; formatted?: string; error?: undefined }> {
	if (!lastTotalTime || !currentTotalTime) {
		console.log("Error calculating the daily total time");
		return { error: undefined };
	}

	const durations = [lastTotalTime, currentTotalTime];

	const totalDurations: IDuration = durations
		.slice(1)
		.reduce(
			(prev, cur) => moment.duration(cur).add(prev),
			moment.duration(durations[0])
		);

	const ms = totalDurations._milliseconds;

	const ticks = ms / 1000;

	const hh = Math.floor(ticks / 3600);
	const mm = Math.floor((ticks % 3600) / 60);
	const ss = ticks % 60;

	const unformattedDailyTotal = `${hh}:${mm}:${ss}`;
	const dailyTotalTime = `${hh}h:${mm}m:${ss}s`;

	return { unformatted: unformattedDailyTotal, formatted: dailyTotalTime };
}

// //get current timestamp
// export function getCurrentTimestamp(day = 0) {
// 	let oldDate = new Date();

// 	let date = new Date(oldDate.setDate(oldDate.getDate() + day));

// 	return dayjs(date, "YYYY-MM-DD HH:mm:ss.SSS").toDate();
// }

// export function monthDiff(from, to) {
// 	let months =
// 		to.getMonth() -
// 		from.getMonth() +
// 		12 * (to.getFullYear() - from.getFullYear());

// 	if (to.getDate() < from.getDate()) {
// 		months--;
// 	}
// 	return months;
// }

// export function daysDiff(from, to) {
// 	const diff = to.getTime() - from.getTime();
// 	return diff / (1000 * 3600 * 24);
// }

// export function addDays(date, days) {
// 	let result = new Date(date);
// 	result.setDate(result.getDate() + days);
// 	return result;
// }

// export function addMonths(date, month) {
// 	date.setMonth(date.getMonth() + month);
// 	return date;
// }

// export function addMinutes(date, minutes) {
// 	return new Date(date.getTime() + minutes * 60000);
// }

// export function subMonths(date, month) {
// 	date.setMonth(date.getMonth() - month);
// 	return date;
// }

// //cryptr encrypt
// export async function encrypt(data) {
// 	data = JSON.stringify(data);
// 	return await cryptr.encrypt(data);
// }

// //cryptr encrypt
// export function decrypt(data) {
// 	const decryptedData = cryptr.decrypt(data);
// 	return JSON.parse(decryptedData);
// }
