export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterCredentials extends LoginCredentials {
	firstName: string;
	lastName: string;
	recaptchaToken: string;
}

export interface User {
	id: string;
	email: string;
	lastName: string;
	firstName: string;
	isVerified: boolean;
	verificationToken: string;
	tokenExpiresAt: Date;
	createdAt: Date;
	updatedAt: Date;
}
