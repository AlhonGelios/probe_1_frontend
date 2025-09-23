import { DirectoryField, UpdateFieldDto } from "../../model/edit-fields-types";
import { UPDATABLE_FIELDS } from "../../model/edit-fields-constants";

/**
 * Универсальная функция для создания объекта с изменившимися полями
 * @param original - Исходное поле
 * @param updated - Обновленное поле
 * @param hasDefaultValue - Есть ли значение по умолчанию
 * @returns Объект с только изменившимися полями
 */
export function createChangedFields(
	original: DirectoryField,
	updated: DirectoryField,
	hasDefaultValue: boolean
): UpdateFieldDto {
	// Создаем объект только с изменившимися полями
	const changedFields = UPDATABLE_FIELDS.reduce((acc, field) => {
		if (updated[field] !== original[field]) {
			(acc as Record<string, unknown>)[field] = updated[field];
		}
		return acc;
	}, {} as UpdateFieldDto);

	// Обрабатываем defaultValue с учетом чекбокса
	const finalDefaultValue = hasDefaultValue
		? updated.defaultValue
		: undefined;

	if (finalDefaultValue !== original.defaultValue) {
		changedFields.defaultValue = finalDefaultValue;
	}

	return changedFields;
}

// Экспорт UI утилит из отдельного файла
export { renderDefaultValueInput } from "./use-edit-fields-ui-utils";
