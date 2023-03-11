import signup from "./handlers/register.handler";
import login from "./handlers/login.handler";
import { sendEmail, verifyEmail } from "./handlers/verify.handler";
import refresh from "./handlers/refresh.handler";
import logout from "./handlers/logout.handler";
import { forgot, reset } from "./reset.controller";
import googlefacebooklogin from "./handlers/googlefacebooklogin.handler";

export {
	signup,
	login,
	sendEmail,
	verifyEmail,
	refresh,
	logout,
	forgot,
	reset,
	googlefacebooklogin,
};
