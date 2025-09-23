import { z } from "zod";
import { DirectoryField, FieldType } from "./types";

const emptyToNull = (val: unknown) => {
	if (typeof val === "string" && val.trim() === "") {
		return null;
	}
	return val;
};

const typeMap: Record<FieldType, z.ZodTypeAny> = {
	STRING: z.string({ error: "Значение должно быть строкой" }),
	NUMBER: z.coerce.number({ error: "Значение должно быть числом" }),
	BOOLEAN: z.coerce.boolean(),
	DATE: z.coerce.date({ error: "Значение должно быть датой" }),
};

export const makeFormSchema = <T extends readonly DirectoryField[]>(
	fields: T
) => {
	const shape = fields.reduce<Record<string, z.ZodTypeAny>>((acc, field) => {
		let baseSchema = typeMap[field.type];

		if (!field.isRequired) {
			baseSchema = baseSchema.nullable().optional();
		}

		const finalSchema = z.preprocess(emptyToNull, baseSchema);

		acc[field.name] = finalSchema;
		return acc;
	}, {});
	return z.object(shape);
};
