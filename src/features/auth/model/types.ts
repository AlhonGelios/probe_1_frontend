export interface LoginCredentials {
	email: string;
	password: string;
	recaptchaToken?: string;
}

export interface LoginResponse {
	user?: User;
	requiresCaptcha?: boolean;
	message?: string;
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

export interface VerifyStatusResponse {
	userId: string;
	email: string;
	isVerified: boolean;
}

export interface ResetPasswordCredentials {
	token: string;
	newPassword: string;
}

export interface RequestPasswordResetCredentials {
	email: string;
	recaptchaToken: string;
}
