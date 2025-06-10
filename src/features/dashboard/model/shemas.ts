import { z } from "zod";

export const passwordChangeSchema = z
	.object({
		currentPassword: z
			.string()
			.min(1, { message: "Текущий пароль обязателен." }),
		newPassword: z
			.string()
			.min(8, {
				message: "Новый пароль должен содержать не менее 8 символов.",
			})
			.max(50, {
				message: "Новый пароль не должен превышать 50 символов.",
			})
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;<>,.?/~\\-]).{8,}$/,
				{
					message:
						"Пароль должен содержать хотя бы одну заглавную букву, одну строчную букву, одну цифру и один специальный символ.",
				}
			),
		confirmNewPassword: z
			.string()
			.min(1, { message: "Подтверждение нового пароля обязательно." }),
	})
	.refine((data) => data.newPassword === data.confirmNewPassword, {
		message: "Новый пароль и подтверждение не совпадают.",
		path: ["confirmNewPassword"],
	});

export const profileEditSchema = z.object({
	firstName: z
		.string()
		.min(1, { message: "Имя обязательно." })
		.max(50, { message: "Имя не должно превышать 50 символов." }),
	lastName: z
		.string()
		.min(1, { message: "Фамилия обязательна." })
		.max(50, { message: "Фамилия не должна превышать 50 символов." }),
});

export type ProfileEditFormValues = z.infer<typeof profileEditSchema>;
export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;
