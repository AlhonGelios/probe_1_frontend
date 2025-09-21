import { z } from "zod";

export const passwordChangeSchema = z
	.object({
		currentPassword: z
			.string()
			.min(1, { error: "Текущий пароль обязателен." }),
		newPassword: z
			.string()
			.min(8, {
				error: "Новый пароль должен содержать не менее 8 символов.",
			})
			.max(50, {
				error: "Новый пароль не должен превышать 50 символов.",
			})
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;<>,.?/~\\-]).{8,}$/,
				{
					error: "Пароль должен содержать хотя бы одну заглавную букву, одну строчную букву, одну цифру и один специальный символ.",
				}
			),
		confirmNewPassword: z
			.string()
			.min(1, { error: "Подтверждение нового пароля обязательно." }),
	})
	.refine((data) => data.newPassword === data.confirmNewPassword, {
		error: "Новый пароль и подтверждение не совпадают.",
		path: ["confirmNewPassword"],
	});

export const profileEditSchema = z.object({
	firstName: z
		.string()
		.min(1, { error: "Имя обязательно." })
		.max(50, { error: "Имя не должно превышать 50 символов." }),
	lastName: z
		.string()
		.min(1, { error: "Фамилия обязательна." })
		.max(50, { error: "Фамилия не должна превышать 50 символов." }),
});

export type ProfileEditFormValues = z.infer<typeof profileEditSchema>;
export type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;
