"use client";

import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import {
	EditFieldsDialogProps,
	DirectoryField,
} from "../model/edit-fields-types";
import {
	useEditFieldsState,
	useEditFieldsHandlers,
} from "../lib/hooks/use-edit-fields";
import { Separator } from "@/shared/ui/separator";
import { FieldList, CreateFieldForm, EditFieldForm } from "./edit-fields";

export function EditFieldsDialog({
	directoryId,
	fields,
	onRefetchFields,
	open,
	onOpenChange,
	onFieldsChange,
}: EditFieldsDialogProps) {
	// Локальное состояние для полей директории
	const [fieldsState, setFieldsState] = useState(fields);

	// Состояние для отслеживания операций сохранения
	const [isSaving, setIsSaving] = useState<string | null>(null);

	// Синхронизация локального состояния с пропсом fields при изменении извне
	useEffect(() => {
		setFieldsState(fields);
	}, [fields]);

	// Функция для начала операции сохранения
	const handleSaveStart = (operationId: string) => {
		setIsSaving(operationId);
	};

	// Функция для завершения операции сохранения
	const handleSaveEnd = () => {
		setIsSaving(null);
	};

	// Функция для восстановления состояния при ошибке
	const handleRestoreState = (errorFields: DirectoryField[]) => {
		setFieldsState(errorFields);

		// Уведомляем родительский компонент о восстановлении состояния
		if (onFieldsChange) {
			onFieldsChange(errorFields);
		}
	};

	// Используем кастомные хуки для управления состоянием и обработчиками
	const state = useEditFieldsState({ open });

	const handlers = useEditFieldsHandlers(
		{ directoryId, onRefetchFields, onOpenChange },
		{
			mode: state.mode,
			selectedField: state.selectedField,
			newField: state.newField,
			editedField: state.editedField,
			hasDefaultValue: state.hasDefaultValue,
			hasDefaultValueEdit: state.hasDefaultValueEdit,
		},
		{
			setMode: state.setMode,
			setSelectedField: state.setSelectedField,
			setNewField: state.setNewField,
			setEditedField: state.setEditedField,
			setHasDefaultValue: state.setHasDefaultValue,
			setHasDefaultValueEdit: state.setHasDefaultValueEdit,
			setOriginalDisplayName: state.setOriginalDisplayName,
		}
	);

	const isUniqueDisabled =
		state.mode === "edit" && state.editedField?.isSystem === true;

	return (
		<Dialog
			open={state.isDialogOpen}
			onOpenChange={handlers.handleDialogClose}
		>
			<DialogContent className="max-h-[90vh] min-w-[70vw]">
				<DialogDescription />
				<DialogHeader className="flex flex-row justify-between">
					<DialogTitle className="py-2">
						Редактирование полей
					</DialogTitle>
					<Button
						variant="secondary"
						onClick={() => {
							state.setMode("create");
							state.setSelectedField(null);
							state.setEditedField(null);
						}}
						className="mr-8"
						disabled={state.mode === "create"}
					>
						Создать новое поле
					</Button>
				</DialogHeader>
				<div className="flex flex-row w-full gap-4 py-4 space-y-6">
					<FieldList
						fields={fieldsState}
						selectedField={state.selectedField}
						onSelectField={handlers.handleSelectField}
						onDeleteField={handlers.handleDelete}
						directoryId={directoryId}
						isSaving={isSaving !== null}
						onFieldsReorder={(newFields) => {
							// Обновляем локальное состояние полей после перетаскивания
							setFieldsState(newFields);
							// Уведомляем родительский компонент об изменениях локального состояния
							if (onFieldsChange) {
								onFieldsChange(newFields);
							}
						}}
						onFieldsError={handleRestoreState}
						onSaveStart={handleSaveStart}
						onSaveEnd={handleSaveEnd}
					/>
					<Separator orientation="vertical" />
					{state.mode === "create" ? (
						<CreateFieldForm
							newField={state.newField}
							hasDefaultValue={state.hasDefaultValue}
							setNewField={state.setNewField}
							setHasDefaultValue={state.setHasDefaultValue}
							onSubmit={handlers.handleCreate}
						/>
					) : (
						<EditFieldForm
							editedField={state.editedField}
							hasDefaultValueEdit={state.hasDefaultValueEdit}
							setEditedField={state.setEditedField}
							setHasDefaultValueEdit={
								state.setHasDefaultValueEdit
							}
							originalDisplayName={state.originalDisplayName}
							setOriginalDisplayName={
								state.setOriginalDisplayName
							}
							onSubmit={handlers.handleUpdate}
							isUniqueDisabled={isUniqueDisabled}
							directoryId={directoryId}
						/>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
