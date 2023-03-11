export default {
	constants: {
		ACCESS_TOKENS: "wwewee",
		REFRESH_TOKENS: "wwewee",
		REG_DEVICES: "BlacklistedRegDevices",
	},

	prefix: {
		resetToken: (token: string): string => {
			return token;
		},
		refreshToken: (token: string): string => {
			return token;
		},
		verifyToken: (token: string): string => {
			return token;
		},
		resetUser: (email: string): string => {
			return email;
		},
	},
};
