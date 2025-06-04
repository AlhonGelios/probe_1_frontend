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
});

// Схема для регистрации
export const registerSchema = z.object({
	firstName: z
		.string()
		.min(1, { message: "Имя обязательно." })
		.max(50, { message: "Имя должено содержать максимум 50 символов." }),
	lastName: z.string().min(1, { message: "Фамилия обязательна." }).max(50, {
		message: "Фамилия должна содержать максимум 50 символов.",
	}),
	email: z
		.string()
		.email({ message: "Неверный формат email." })
		.max(100, { message: "email должен содержать максимум 100 символов." }),
	password: z
		.string()
		.min(8, { message: "Пароль должен содержать минимум 8 символов." })
		.max(50, { message: "Пароль должен содержать максимум 50 символов." })
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

	recaptchaToken: z
		.string()
		.min(1, { message: "Подтвердите, что вы не робот." }),
});

// Выводим типы из схем для удобства
export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
