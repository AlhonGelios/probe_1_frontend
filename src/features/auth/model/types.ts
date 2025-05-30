export interface LoginCredentials {
	email: string;
	password: string;
}

// export interface RegisterCredentials extends LoginCredentials {
//   // Можно добавить другие поля, если они понадобятся для регистрации
//   // например: username: string;
// }

export type RegisterCredentials = LoginCredentials;

export interface User {
	id: string;
	email: string;
	isVerified: boolean;
	verificationToken: string;
	tokenExpiresAt: Date;
	createdAt: Date;
	updatedAt: Date;
}
