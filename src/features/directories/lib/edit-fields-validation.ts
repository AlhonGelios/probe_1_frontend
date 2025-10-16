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
 * Преобразует строковое значение по умолчанию в соответствующий тип данных
 * @param fieldType Тип поля (из FieldType)
 * @param value Строковое значение для преобразования
 * @returns Значение в соответствующем типе данных или null для пустых значений
 */
export const convertDefaultValueToType = (
	fieldType: string,
	value: string | null | undefined
): string | number | boolean | Date | null => {
	console.log(`[convertDefaultValueToType] Преобразование значения:`, {
		fieldType,
		value,
		valueType: typeof value,
	});

	// Если значение пустое, возвращаем null
	if (!value || !value.trim()) {
		console.log(
			`[convertDefaultValueToType] Пустое значение, возвращаем null`
		);
		return null;
	}

	const trimmedValue = value.trim();
	console.log(
		`[convertDefaultValueToType] Обрезанное значение: "${trimmedValue}"`
	);

	switch (fieldType) {
		case "STRING":
			console.log(
				`[convertDefaultValueToType] Тип STRING, возвращаем строку`
			);
			return trimmedValue;

		case "NUMBER":
			console.log(`[convertDefaultValueToType] Преобразование в число`);
			const numValue = Number(trimmedValue);
			console.log(
				`[convertDefaultValueToType] Результат преобразования в число:`,
				{
					originalValue: trimmedValue,
					convertedValue: numValue,
					isNaN: isNaN(numValue),
				}
			);
			if (isNaN(numValue)) {
				console.error(
					`[convertDefaultValueToType] Невозможно преобразовать "${value}" в число`
				);
				throw new Error(`Невозможно преобразовать "${value}" в число`);
			}
			return numValue;

		case "BOOLEAN":
			console.log(
				`[convertDefaultValueToType] Преобразование в логическое значение`
			);
			const lowerValue = trimmedValue.toLowerCase();
			console.log(
				`[convertDefaultValueToType] Сравнение с "true"/"false":`,
				{
					originalValue: trimmedValue,
					lowerValue,
					isTrue: lowerValue === "true",
					isFalse: lowerValue === "false",
				}
			);
			if (lowerValue === "true") {
				console.log(`[convertDefaultValueToType] Возвращаем true`);
				return true;
			} else if (lowerValue === "false") {
				console.log(`[convertDefaultValueToType] Возвращаем false`);
				return false;
			} else {
				console.error(
					`[convertDefaultValueToType] Невозможно преобразовать "${value}" в логическое значение`
				);
				throw new Error(
					`Невозможно преобразовать "${value}" в логическое значение. Используйте "true" или "false"`
				);
			}

		case "DATE":
			console.log(`[convertDefaultValueToType] Преобразование в дату`);
			const dateValue = new Date(trimmedValue);
			console.log(
				`[convertDefaultValueToType] Результат преобразования в дату:`,
				{
					originalValue: trimmedValue,
					convertedValue: dateValue,
					isValid: !isNaN(dateValue.getTime()),
					timestamp: dateValue.getTime(),
				}
			);
			if (isNaN(dateValue.getTime())) {
				console.error(
					`[convertDefaultValueToType] Некорректная дата: "${value}"`
				);
				throw new Error(`Некорректная дата: "${value}"`);
			}
			// Для типа DATE возвращаем только дату без времени
			const normalizedDate = new Date(
				dateValue.getFullYear(),
				dateValue.getMonth(),
				dateValue.getDate()
			);
			console.log(
				`[convertDefaultValueToType] Нормализованная дата:`,
				normalizedDate
			);
			return normalizedDate;

		case "DATETIME":
			console.log(
				`[convertDefaultValueToType] Преобразование в дату/время`
			);
			const dateTimeValue = new Date(trimmedValue);
			console.log(
				`[convertDefaultValueToType] Результат преобразования в дату/время:`,
				{
					originalValue: trimmedValue,
					convertedValue: dateTimeValue,
					isValid: !isNaN(dateTimeValue.getTime()),
					timestamp: dateTimeValue.getTime(),
				}
			);
			if (isNaN(dateTimeValue.getTime())) {
				console.error(
					`[convertDefaultValueToType] Некорректная дата/время: "${value}"`
				);
				throw new Error(`Некорректная дата/время: "${value}"`);
			}
			console.log(
				`[convertDefaultValueToType] Возвращаем дату/время:`,
				dateTimeValue
			);
			return dateTimeValue;

		default:
			console.error(
				`[convertDefaultValueToType] Неизвестный тип поля: "${fieldType}"`
			);
			throw new Error(`Неизвестный тип поля: "${fieldType}"`);
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
