import { z } from "zod";

// Схема для входа
export const loginSchema = z.object({
	email: z
		.string()
		.email({ error: "Неверный формат email." })
		.max(100, { error: "email должен содержать максимум 100 символов." }),
	password: z
		.string()
		.max(50, { error: "Пароль должен содержать максимум 50 символов." }),
	recaptchaToken: z.string().optional(),
});

// Схема для регистрации
export const registerSchema = z
	.object({
		firstName: z.string().min(1, { error: "Имя обязательно." }).max(50, {
			error: "Имя должено содержать максимум 50 символов.",
		}),
		lastName: z.string().min(1, { error: "Фамилия обязательна." }).max(50, {
			error: "Фамилия должна содержать максимум 50 символов.",
		}),
		email: z.string().email({ error: "Неверный формат email." }).max(100, {
			error: "email должен содержать максимум 100 символов.",
		}),
		password: z
			.string()
			.min(8, { error: "Пароль должен содержать минимум 8 символов." })
			.max(50, {
				error: "Пароль должен содержать максимум 50 символов.",
			})
			.regex(/[a-z]/, {
				error: "Пароль должен содержать хотя бы одну строчную латинскую букву.",
			})
			.regex(/[A-Z]/, {
				error: "Пароль должен содержать хотя бы одну заглавную латинскую букву.",
			})
			.regex(/[0-9]/, {
				error: "Пароль должен содержать хотя бы одну цифру.",
			})
			.regex(/[^a-zA-Z0-9]/, {
				error: "Пароль должен содержать хотя бы один спецсимвол.",
			}),
		confirmPassword: z.string(),
		recaptchaToken: z
			.string()
			.min(1, { error: "Подтвердите, что вы не робот." }),
	})
	.refine((data) => data.password === data.confirmPassword, {
		error: "Пароли не совпадают.",
		path: ["confirmPassword"], // Ошибка будет отображаться под полем confirmPassword
	});

export const forgotPasswordSchema = z.object({
	email: z.string().email({ error: "Неверный формат email." }),
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
				error: "Пароль должен содержать максимум 50 символов.",
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
		error: "Пароли не совпадают.",
		path: ["confirmPassword"],
	});

// Выводим типы из схем для удобства
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
