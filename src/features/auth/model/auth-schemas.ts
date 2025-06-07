import { z } from "zod";

// Схема для входа
export const loginSchema = z.object({
	email: z
		.string()
		.email({ message: "Неверный формат email." })
		.max(100, { message: "email должен содержать максимум 100 символов." }),
	password: z
		.string()
		.max(50, { message: "Пароль должен содержать максимум 50 символов." }),
	recaptchaToken: z.string().optional(),
});

// Схема для регистрации
export const registerSchema = z
	.object({
		firstName: z.string().min(1, { message: "Имя обязательно." }).max(50, {
			message: "Имя должено содержать максимум 50 символов.",
		}),
		lastName: z
			.string()
			.min(1, { message: "Фамилия обязательна." })
			.max(50, {
				message: "Фамилия должна содержать максимум 50 символов.",
			}),
		email: z
			.string()
			.email({ message: "Неверный формат email." })
			.max(100, {
				message: "email должен содержать максимум 100 символов.",
			}),
		password: z
			.string()
			.min(8, { message: "Пароль должен содержать минимум 8 символов." })
			.max(50, {
				message: "Пароль должен содержать максимум 50 символов.",
			})
			.regex(/[a-z]/, {
				message:
					"Пароль должен содержать хотя бы одну строчную латинскую букву.",
			})
			.regex(/[A-Z]/, {
				message:
					"Пароль должен содержать хотя бы одну заглавную латинскую букву.",
			})
			.regex(/[0-9]/, {
				message: "Пароль должен содержать хотя бы одну цифру.",
			})
			.regex(/[^a-zA-Z0-9]/, {
				message: "Пароль должен содержать хотя бы один спецсимвол.",
			}),
		confirmPassword: z.string(),
		recaptchaToken: z
			.string()
			.min(1, { message: "Подтвердите, что вы не робот." }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Пароли не совпадают.",
		path: ["confirmPassword"], // Ошибка будет отображаться под полем confirmPassword
	});

export const forgotPasswordSchema = z.object({
	email: z.string().email({ message: "Неверный формат email." }),
	recaptchaToken: z
		.string()
		.min(1, "Пожалуйста, подтвердите, что вы не робот."),
});

export const resetPasswordSchema = z
	.object({
		password: z
			.string()
			.min(8, "Пароль должен быть не менее 8 символов.")
			.max(50, {
				message: "Пароль должен содержать максимум 50 символов.",
			})
			.regex(
				/[a-z]/,
				"Пароль должен содержать хотя бы одну строчную букву."
			)
			.regex(
				/[A-Z]/,
				"Пароль должен содержать хотя бы одну заглавную букву."
			)
			.regex(/\d/, "Пароль должен содержать хотя бы одну цифру.")
			.regex(
				/[^a-zA-Z0-9]/,
				"Пароль должен содержать хотя бы один специальный символ."
			),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Пароли не совпадают.",
		path: ["confirmPassword"],
	});

// Выводим типы из схем для удобства
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
