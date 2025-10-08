import { useState, useEffect } from "react";
import { DirectoryField, CreateFieldDto } from "../../model/edit-fields-types";
import { initialNewFieldState } from "../../model/edit-fields-constants";

export interface UseEditFieldsStateProps {
	open: boolean;
}

export interface UseEditFieldsStateReturn {
	// Состояние диалога
	isDialogOpen: boolean;
	mode: "create" | "edit";
	selectedField: DirectoryField | null;

	// Состояние полей
	newField: CreateFieldDto;
	editedField: DirectoryField | null;

	// Состояние чекбоксов значения по умолчанию
	hasDefaultValue: boolean;
	hasDefaultValueEdit: boolean;

	// Состояние original display name для редактируемого поля
	originalDisplayName: string;
	setOriginalDisplayName: (name: string) => void;

	// Действия
	setIsDialogOpen: (open: boolean) => void;
	setMode: (mode: "create" | "edit") => void;
	setSelectedField: (field: DirectoryField | null) => void;
	setNewField: (field: CreateFieldDto) => void;
	setEditedField: (field: DirectoryField | null) => void;
	setHasDefaultValue: (hasDefault: boolean) => void;
	setHasDefaultValueEdit: (hasDefault: boolean) => void;

	// Сброс состояния
	resetState: () => void;
}

export function useEditFieldsState({
	open,
}: UseEditFieldsStateProps): UseEditFieldsStateReturn {
	const [isDialogOpen, setIsDialogOpen] = useState(open);
	const [mode, setMode] = useState<"create" | "edit">("create");
	const [selectedField, setSelectedField] = useState<DirectoryField | null>(
		null
	);
	const [newField, setNewField] =
		useState<CreateFieldDto>(initialNewFieldState);
	const [editedField, setEditedField] = useState<DirectoryField | null>(null);
	const [hasDefaultValue, setHasDefaultValue] = useState(false);
	const [hasDefaultValueEdit, setHasDefaultValueEdit] = useState(false);
	const [originalDisplayName, setOriginalDisplayName] = useState<string>("");

	// Синхронизация с пропсом open
	useEffect(() => {
		setIsDialogOpen(open);
		// Сброс состояния при открытии/закрытии
		if (!open) {
			resetState();
		}
	}, [open]);

	// Функция сброса состояния
	const resetState = () => {
		setMode("create");
		setSelectedField(null);
		setNewField(initialNewFieldState);
		setEditedField(null);
		setHasDefaultValue(false);
		setHasDefaultValueEdit(false);
		setOriginalDisplayName("");
	};

	return {
		// Состояние диалога
		isDialogOpen,
		mode,
		selectedField,

		// Состояние полей
		newField,
		editedField,

		// Состояние чекбоксов
		hasDefaultValue,
		hasDefaultValueEdit,

		// Состояние original display name
		originalDisplayName,
		setOriginalDisplayName,

		// Действия
		setIsDialogOpen,
		setMode,
		setSelectedField,
		setNewField,
		setEditedField,
		setHasDefaultValue,
		setHasDefaultValueEdit,

		// Сброс состояния
		resetState,
	};
}
