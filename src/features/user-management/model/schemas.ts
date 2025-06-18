import { isValid, parseISO, startOfDay } from "date-fns";
import { z } from "zod";

export const userEditSchema = z.object({
	userId: z.string().min(1, "ID пользователя обязателен"),
	firstName: z.string().min(1, "Имя не может быть пустым").max(50),
	lastName: z.string().min(1, "Фамилия не может быть пустой").max(50),
	role: z.string().min(1, "Роль обязательна"),
	roleExpiration: z.union([
		z.date().refine(
			(val) => {
				if (val < startOfDay(new Date())) {
					return false;
				}
				return true;
			},
			{ message: "Дата должна быть не менее текушей" }
		),
		z.string().refine(
			(val) => {
				const parsed = parseISO(val);
				return isValid(parsed);
			},
			{ message: "Неверный формат даты" }
		),
		z.literal("").transform(() => null),
		z.null(),
		z.undefined(),
	]),
});

export type UserEditFormValues = z.infer<typeof userEditSchema>;
