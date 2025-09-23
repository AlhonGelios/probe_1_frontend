/**
 * Валидирует значение по умолчанию для указанного типа поля
 * @param fieldType Тип поля (из FIELD_TYPES)
 * @param value Значение для валидации
 * @returns Сообщение об ошибке или null, если валидация прошла успешно
 */
export const validateDefaultValue = (
	fieldType: string,
	value: string
): string | null => {
	if (!value.trim()) {
		return null;
	}

	switch (fieldType) {
		case "STRING":
			return null;
		case "NUMBER":
			const numValue = Number(value);
			if (isNaN(numValue)) {
				return "Значение должно быть числом";
			}
			return null;
		case "BOOLEAN":
			if (!["true", "false"].includes(value.toLowerCase())) {
				return "Значение должно быть true или false";
			}
			return null;
		case "DATE":
			const dateValue = new Date(value);
			if (isNaN(dateValue.getTime())) {
				return "Некорректная дата";
			}
			return null;
		default:
			return null;
	}
};

/**
 * Валидирует системное имя поля
 * @param name Системное имя для валидации
 * @returns Сообщение об ошибке или null, если валидация прошла успешно
 */
export const validateFieldName = (name: string): string | null => {
	if (!name.trim()) {
		return "Системное имя обязательно";
	}

	if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) {
		return "Системное имя должно начинаться с буквы и содержать только буквы, цифры и подчеркивания";
	}

	if (name.length < 2) {
		return "Системное имя должно содержать минимум 2 символа";
	}

	return null;
};

/**
 * Валидирует отображаемое имя поля
 * @param displayName Отображаемое имя для валидации
 * @returns Сообщение об ошибке или null, если валидация прошла успешно
 */
export const validateDisplayName = (displayName: string): string | null => {
	if (!displayName.trim()) {
		return "Отображаемое имя обязательно";
	}

	if (displayName.trim().length < 2) {
		return "Отображаемое имя должно содержать минимум 2 символа";
	}

	return null;
};
