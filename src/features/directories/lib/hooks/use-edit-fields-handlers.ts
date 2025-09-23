import { useCallback } from "react";
import { toast } from "sonner";
import { DirectoryField, CreateFieldDto } from "../../model/edit-fields-types";
import { initialNewFieldState } from "../../model/edit-fields-constants";
import {
	createField,
	deleteField,
	updateField,
} from "../../api/dictionaries-api";
import { validateDefaultValue } from "../edit-fields-validation";
import { createChangedFields } from "./use-edit-fields-utils";

export interface UseEditFieldsHandlersProps {
	directoryId: string;
	onRefetchFields: () => Promise<void>;
	onOpenChange: (open: boolean) => void;
}

export interface UseEditFieldsHandlersState {
	mode: "create" | "edit";
	selectedField: DirectoryField | null;
	newField: CreateFieldDto;
	editedField: DirectoryField | null;
	hasDefaultValue: boolean;
	hasDefaultValueEdit: boolean;
}

export interface UseEditFieldsHandlersActions {
	setMode: (mode: "create" | "edit") => void;
	setSelectedField: (field: DirectoryField | null) => void;
	setNewField: (field: CreateFieldDto) => void;
	setEditedField: (field: DirectoryField | null) => void;
	setHasDefaultValue: (hasDefault: boolean) => void;
	setHasDefaultValueEdit: (hasDefault: boolean) => void;
}

export interface UseEditFieldsHandlersReturn {
	handleSelectField: (field: DirectoryField) => void;
	handleDialogClose: (openState: boolean) => void;
	handleCreate: () => Promise<void>;
	handleUpdate: () => Promise<void>;
	handleDelete: (fieldId: string) => Promise<void>;
}

export function useEditFieldsHandlers(
	props: UseEditFieldsHandlersProps,
	state: UseEditFieldsHandlersState,
	actions: UseEditFieldsHandlersActions
): UseEditFieldsHandlersReturn {
	const { directoryId, onRefetchFields, onOpenChange } = props;
	const {
		selectedField,
		newField,
		editedField,
		hasDefaultValue,
		hasDefaultValueEdit,
	} = state;
	const {
		setMode,
		setSelectedField,
		setNewField,
		setEditedField,
		setHasDefaultValue,
		setHasDefaultValueEdit,
	} = actions;

	// Обработчик выбора поля для редактирования
	const handleSelectField = useCallback(
		(field: DirectoryField) => {
			setMode("edit");
			setSelectedField(field);
			setEditedField(field); // Инициализация формы редактирования данными поля
			// Установка состояния чекбокса на основе наличия значения по умолчанию
			setHasDefaultValueEdit(!!field.defaultValue);
		},
		[setMode, setSelectedField, setEditedField, setHasDefaultValueEdit]
	);

	const handleDialogClose = useCallback(
		(openState: boolean) => {
			if (!openState) {
				setNewField(initialNewFieldState); // Сброс формы при закрытии
				setMode("create"); // Сброс режима
				setSelectedField(null);
				setHasDefaultValue(false); // Сброс чекбокса
				setHasDefaultValueEdit(false); // Сброс чекбокса редактирования
				onOpenChange(false);
			}
		},
		[
			setNewField,
			setMode,
			setSelectedField,
			setHasDefaultValue,
			setHasDefaultValueEdit,
			onOpenChange,
		]
	);

	const handleCreate = useCallback(async () => {
		if (!newField.name || !newField.displayName) {
			toast.error("Системное и отображаемое имя поля обязательны.");
			return;
		}

		if (hasDefaultValue && newField.defaultValue) {
			const validationError = validateDefaultValue(
				newField.type,
				newField.defaultValue
			);
			if (validationError) {
				toast.error(
					`Ошибка валидации значения по умолчанию: ${validationError}`
				);
				return;
			}
		}

		try {
			const finalDefaultValue = hasDefaultValue
				? newField.defaultValue
				: undefined;

			const fieldData = {
				name: newField.name,
				displayName: newField.displayName,
				type: newField.type,
				isRequired: newField.isRequired,
				isUnique: newField.isUnique,
				defaultValue: finalDefaultValue,
				isSystem: newField.isSystem,
			};

			await createField(directoryId, fieldData);
			await onRefetchFields();
			toast.success("Поле успешно создано");

			setNewField(initialNewFieldState);
			setHasDefaultValue(false);
		} catch (error) {
			console.error("Error creating field:", error);
			toast.error("Ошибка при создании поля");
		}
	}, [
		newField,
		hasDefaultValue,
		directoryId,
		onRefetchFields,
		setNewField,
		setHasDefaultValue,
	]);

	const handleUpdate = useCallback(async () => {
		if (!editedField || !selectedField) return;

		if (hasDefaultValueEdit && editedField.defaultValue) {
			const validationError = validateDefaultValue(
				editedField.type,
				editedField.defaultValue
			);
			if (validationError) {
				toast.error(
					`Ошибка валидации значения по умолчанию: ${validationError}`
				);
				return;
			}
		}

		try {
			console.log("[DEBUG] handleUpdate: Creating changed fields", {
				selectedFieldDefaultValue: selectedField.defaultValue,
				editedFieldDefaultValue: editedField.defaultValue,
				hasDefaultValueEdit,
				editedFieldId: editedField.id,
			});

			const updatedField = createChangedFields(
				selectedField,
				editedField,
				hasDefaultValueEdit
			);

			console.log("[DEBUG] handleUpdate: Changed fields result", {
				updatedField,
				changesCount: Object.keys(updatedField).length,
			});

			// Проверяем, есть ли изменения
			if (Object.keys(updatedField).length === 0) {
				toast.error("Нет изменений для сохранения");
				return;
			}

			await updateField(directoryId, editedField.id, updatedField);
			await onRefetchFields();
			toast.success("Поле успешно обновлено");

			setMode("create");
			setSelectedField(null);
			setEditedField(null);
			setHasDefaultValueEdit(false);
		} catch (error) {
			console.error("Error updating field:", error);
			toast.error("Ошибка при обновлении поля");
		}
	}, [
		editedField,
		selectedField,
		hasDefaultValueEdit,
		directoryId,
		onRefetchFields,
		setMode,
		setSelectedField,
		setEditedField,
		setHasDefaultValueEdit,
	]);

	const handleDelete = useCallback(
		async (fieldId: string) => {
			try {
				await deleteField(directoryId, fieldId);
				await onRefetchFields();
				toast.success("Поле успешно удалено");
			} catch (error) {
				console.error("Error deleting field:", error);
				const errorMessage =
					error instanceof Error
						? error.message
						: "Произошла неизвестная ошибка";
				toast.error(`Не удалось удалить поле: ${errorMessage}`);
			}
		},
		[directoryId, onRefetchFields]
	);

	return {
		handleSelectField,
		handleDialogClose,
		handleCreate,
		handleUpdate,
		handleDelete,
	};
}
