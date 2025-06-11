export interface EditProfileFormProps {
	initialData: {
		firstName: string;
		lastName: string;
	};
}

export interface EditProfileResponse {
	success: boolean;
	statusCode: number;
	message: string;
	user?: { firstName: string; lastName: string };
}
