"use client";

import { Button } from "@/shared/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import { EditFieldsDialogProps } from "../model/edit-fields-types";
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
}: EditFieldsDialogProps) {
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
		}
	);

	const isUniqueDisabled =
		state.mode === "edit" && state.editedField?.isSystem === true;

	return (
		<Dialog
			open={state.isDialogOpen}
			onOpenChange={handlers.handleDialogClose}
		>
			<DialogContent className="max-h-[90vh] min-w-[50vw]">
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
						fields={fields}
						selectedField={state.selectedField}
						onSelectField={handlers.handleSelectField}
						onDeleteField={handlers.handleDelete}
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
							onSubmit={handlers.handleUpdate}
							isUniqueDisabled={isUniqueDisabled}
						/>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
