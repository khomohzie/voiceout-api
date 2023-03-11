import nodemailer from "nodemailer";
import template from "../utils/mail-template.util";

const nm = nodemailer.createTransport({
	service: "gmail",
	auth: {
		type: "OAuth2",
		user: process.env.MAIL_USERNAME,
		pass: process.env.MAIL_PASSWORD,
		clientId: process.env.OAUTH_CLIENTID,
		clientSecret: process.env.OAUTH_CLIENT_SECRET,
		refreshToken: process.env.OAUTH_REFRESH_TOKEN,
	},
});

const transporter = (
	email: string,
	subject: string,
	content: string,
	signature?: string
) => {
	const htmlTemplate = template.default(subject, content, signature);

	return new Promise((resolve, reject) => {
		nm.sendMail({
			from: process.env.MAIL_USERNAME,
			to: email,
			subject: subject,
			text: content,
			html: htmlTemplate,
		})
			.then((msg: any) => {
				console.log(msg);
				resolve(msg);
			}) // logs response data
			.catch((err: any) => {
				console.error(err);
				reject(err);
			}); // logs any error
	});
};

export default transporter;
