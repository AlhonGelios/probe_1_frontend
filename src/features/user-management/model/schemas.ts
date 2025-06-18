import { isValid, parseISO } from "date-fns";
import { z } from "zod";

export const userEditSchemaInput = z.object({
	userId: z.string().min(1, "ID пользователя обязателен"),
	firstName: z
		.string()
		.min(1, "Имя не может быть пустым")
		.max(50, "Имя слишком длинное"),
	lastName: z
		.string()
		.min(1, "Фамилия не может быть пустой")
		.max(50, "Фамилия слишком длинная"),
	role: z.string().min(1, "Роль обязательна"),
	roleExpiration: z
		.union([
			z.date().nullable(), // Может быть Date
			z.string().nullable(), // Или строка
		])
		.optional(),
});

export const userEditSchema = userEditSchemaInput.extend({
	roleExpiration: userEditSchemaInput.shape.roleExpiration.transform(
		(val) => {
			if (val === null || val === undefined || val === "") {
				return null;
			}
			if (val instanceof Date) {
				return val;
			}
			const parsedDate = parseISO(val);
			return isValid(parsedDate) ? parsedDate : null;
		}
	),
});

export type UserEditFormValues = z.infer<typeof userEditSchemaInput>;
