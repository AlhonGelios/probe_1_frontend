"use client";

import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { Switch } from "@/shared/ui/switch";
import { Plus, Trash2, Pencil, TriangleAlert } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DirectoryField } from "../types";
import { createField, deleteField, updateField } from "../api/dictionaries-api";
import { Separator } from "@/shared/ui/separator";
import { ToggleableInput } from "@/shared/ui/toggleable-input";
import { SimpleDatePicker } from "@/shared/ui/simple-date-picker";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

const FIELD_TYPES = ["STRING", "NUMBER", "DATE", "BOOLEAN"] as const;

export type CreateFieldDto = {
	name: string;
	displayName: string;
	type: (typeof FIELD_TYPES)[number];
	isRequired?: boolean;
	isUnique?: boolean;
	defaultValue?: string;
	isSystem: boolean;
};

export type UpdateFieldDto = {
	name?: string;
	displayName?: string;
	type?: (typeof FIELD_TYPES)[number];
	isRequired?: boolean;
	isUnique?: boolean;
	defaultValue?: string;
};

const UPDATABLE_FIELDS = [
	"name",
	"displayName",
	"type",
	"isRequired",
	"isUnique",
] as const;

const initialNewFieldState: CreateFieldDto = {
	name: "",
	displayName: "",
	type: "STRING",
	isRequired: false,
	isUnique: false,
	defaultValue: undefined,
	isSystem: false,
};

interface EditFieldsDialogProps {
	directoryId: string;
	fields: DirectoryField[];
	onRefetchFields: () => Promise<void>;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditFieldsDialog({
	directoryId,
	fields,
	onRefetchFields,
	open,
	onOpenChange,
}: EditFieldsDialogProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(open);
	const [mode, setMode] = useState<"create" | "edit">("create");
	const [selectedField, setSelectedField] = useState<DirectoryField | null>(
		null
	);

	const [newField, setNewField] =
		useState<CreateFieldDto>(initialNewFieldState);
	const [editedField, setEditedField] = useState<DirectoryField | null>(null);

	// Состояние для управления чекбоксом значения по умолчанию
	const [hasDefaultValue, setHasDefaultValue] = useState(false);
	const [hasDefaultValueEdit, setHasDefaultValueEdit] = useState(false);

	// Синхронизация с пропсом open
	useEffect(() => {
		setIsDialogOpen(open);
		// Сброс состояния при открытии/закрытии
		if (!open) {
			setMode("create");
			setSelectedField(null);
			setNewField(initialNewFieldState);
			setEditedField(null);
			setHasDefaultValue(false);
			setHasDefaultValueEdit(false);
		}
	}, [open]);

	// Обработчик выбора поля для редактирования
	const handleSelectField = (field: DirectoryField) => {
		setMode("edit");
		setSelectedField(field);
		setEditedField(field); // Инициализация формы редактирования данными поля
		// Установка состояния чекбокса на основе наличия значения по умолчанию
		setHasDefaultValueEdit(!!field.defaultValue);
	};

	const handleDialogClose = (openState: boolean) => {
		if (!openState) {
			setNewField(initialNewFieldState); // Сброс формы при закрытии
			setMode("create"); // Сброс режима
			setSelectedField(null);
			setHasDefaultValue(false); // Сброс чекбокса
			setHasDefaultValueEdit(false); // Сброс чекбокса редактирования
			onOpenChange(false);
		}
		setIsDialogOpen(openState);
	};

	const handleCreate = async () => {
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
			onRefetchFields();
			toast.success("Поле успешно создано");

			setNewField(initialNewFieldState);
			setHasDefaultValue(false);
		} catch (error) {
			console.error("Error creating field:", error);
			toast.error("Ошибка при создании поля");
		}
	};

	// Универсальная функция для создания объекта с изменившимися полями
	const createChangedFields = (
		original: DirectoryField,
		updated: DirectoryField,
		hasDefaultValue: boolean
	): UpdateFieldDto => {
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
	};

	const handleUpdate = async () => {
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
			const updatedField = createChangedFields(
				selectedField,
				editedField,
				hasDefaultValueEdit
			);

			// Проверяем, есть ли изменения
			if (Object.keys(updatedField).length === 0) {
				toast.error("Нет изменений для сохранения");
				return;
			}

			await updateField(directoryId, editedField.id, updatedField);
			onRefetchFields();
			toast.success("Поле успешно обновлено");

			setMode("create");
			setSelectedField(null);
			setEditedField(null);
			setHasDefaultValueEdit(false);
		} catch (error) {
			console.error("Error updating field:", error);
			toast.error("Ошибка при обновлении поля");
		}
	};

	const handleDelete = async (fieldId: string) => {
		try {
			await deleteField(directoryId, fieldId);
			onRefetchFields();
			toast.success("Поле успешно удалено");
		} catch (error) {
			console.error("Error deleting field:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Произошла неизвестная ошибка";
			toast.error(`Не удалось удалить поле: ${errorMessage}`);
		}
	};

	const isUniqueDisabled = mode === "edit" && editedField?.isSystem;

	const validateDefaultValue = (
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

	const renderDefaultValueInput = (
		fieldType: string,
		value: string,
		onChange: (value: string) => void,
		disabled: boolean = false
	) => {
		if (
			(!hasDefaultValue && mode === "create") ||
			(!hasDefaultValueEdit && mode === "edit")
		) {
			return null;
		}

		switch (fieldType) {
			case "STRING":
				return (
					<ToggleableInput
						value={value}
						onChange={onChange}
						placeholder="Введите значение по умолчанию"
						disabled={disabled}
					/>
				);
			case "NUMBER":
				return (
					<Input
						type="number"
						value={value}
						onChange={(e) => onChange(e.target.value)}
						placeholder="Введите числовое значение по умолчанию"
						disabled={disabled}
					/>
				);
			case "BOOLEAN":
				return (
					<div className="flex items-center space-x-2">
						<Switch
							checked={value === "true"}
							onCheckedChange={(checked) =>
								onChange(checked ? "true" : "false")
							}
							disabled={disabled}
						/>
						<Label className="text-sm text-muted-foreground">
							{value === "true" ? "Да" : "Нет"}
						</Label>
					</div>
				);
			case "DATE":
				const dateValue = value ? new Date(value) : null;
				return (
					<SimpleDatePicker
						value={dateValue}
						onChange={(date) =>
							onChange(date ? date.toISOString() : "")
						}
						placeholder="Выберите дату по умолчанию"
					/>
				);
			default:
				return (
					<Input
						value={value}
						onChange={(e) => onChange(e.target.value)}
						placeholder="Введите значение по умолчанию"
						disabled={disabled}
					/>
				);
		}
	};

	return (
		<Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
			<DialogContent className="max-h-[90vh] min-w-[50vw]">
				<DialogHeader className="flex flex-row justify-between">
					<DialogTitle className="py-2">
						Редактирование полей
					</DialogTitle>
					<Button
						variant="secondary"
						onClick={() => {
							setMode("create");
							setSelectedField(null);
							setEditedField(null);
						}}
						className="mr-8"
						disabled={mode === "create"}
					>
						Создать новое поле
					</Button>
				</DialogHeader>
				<div className="flex flex-row w-full gap-4 py-4 space-y-6">
					<div className="w-1/3 flex-shrink-0 h-[60vh] flex flex-col">
						<h3 className="font-semibold mb-2">
							Существующие поля
						</h3>
						<ul className="space-y-2 overflow-y-auto flex-1">
							{fields.map((field) => (
								<li
									key={field.id}
									className={`${
										field.id === selectedField?.id
											? "bg-orange-100"
											: ""
									} flex items-center justify-between p-2 border rounded-md hover:bg-gray-100 hover:cursor-pointer mr-4`}
									onClick={() => handleSelectField(field)}
								>
									<div className="flex flex-col">
										<span
											className="truncate font-medium"
											title={field.displayName}
										>
											{field.displayName}
										</span>
										<span className="text-xs text-muted-foreground">
											{field.name} (
											{[
												field.type,
												field.isRequired && "Required",
												field.isUnique && "Unique",
												field.defaultValue &&
													"DefaultValue",
											]
												.filter(Boolean)
												.join(", ")}
											)
										</span>
									</div>
									<Button
										variant="ghost"
										size="icon"
										onClick={(e) => {
											e.stopPropagation();
											handleDelete(field.id);
										}}
										disabled={field.isSystem}
										className="hover:bg-gray-300"
										title={
											field.isSystem
												? "Системное поле нельзя удалить"
												: "Удалить поле"
										}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</li>
							))}
						</ul>
					</div>
					<Separator orientation="vertical" />
					{mode === "create" ? (
						<div className="flex flex-col space-y-4 flex-1">
							<div className="space-y-4 flex-1">
								<h3 className="font-semibold">
									Добавить новое поле
								</h3>
								<div className="grid gap-2">
									<Label htmlFor="new-field-displayName">
										Отображаемое имя
									</Label>
									<Input
										id="new-field-displayName"
										value={newField.displayName}
										onChange={(e) =>
											setNewField({
												...newField,
												displayName: e.target.value,
											})
										}
										placeholder="Например, 'Код региона'"
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="new-field-name">
										Системное имя (латиницей)
									</Label>
									<Input
										id="new-field-name"
										value={newField.name}
										onChange={(e) =>
											setNewField({
												...newField,
												name: e.target.value.replace(
													/[^a-zA-Z0-9_]/g,
													""
												),
											})
										}
										placeholder="Например, 'region_code'"
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="new-field-type">
										Тип поля
									</Label>
									<Select
										value={newField.type}
										onValueChange={(value) =>
											setNewField({
												...newField,
												type: value as CreateFieldDto["type"],
											})
										}
									>
										<SelectTrigger id="new-field-type">
											<SelectValue placeholder="Выберите тип" />
										</SelectTrigger>
										<SelectContent>
											{FIELD_TYPES.map((type) => (
												<SelectItem
													key={type}
													value={type}
												>
													{type}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="is-required"
										checked={newField.isRequired}
										onCheckedChange={(checked) =>
											setNewField({
												...newField,
												isRequired: !!checked,
											})
										}
										disabled={newField.isUnique}
									/>
									<Label htmlFor="is-required">
										Обязательное
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="is-unique"
										checked={newField.isUnique}
										onCheckedChange={(checked) => {
											const isUniqueChecked = !!checked;
											setNewField({
												...newField,
												isUnique: isUniqueChecked,
												isRequired: isUniqueChecked
													? true
													: newField.isRequired,
											});
										}}
									/>
									<Label htmlFor="is-unique">
										Уникальное
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="has-default-value"
										checked={hasDefaultValue}
										onCheckedChange={(checked) => {
											const hasDefault = !!checked;
											setHasDefaultValue(hasDefault);
											if (!hasDefault) {
												setNewField({
													...newField,
													defaultValue: undefined,
												});
											}
										}}
									/>
									<Label htmlFor="has-default-value">
										Значение по умолчанию
									</Label>
								</div>
								{hasDefaultValue && (
									<div className="grid gap-2">
										<Label htmlFor="default-value">
											Значение по умолчанию (
											{newField.type})
										</Label>
										{renderDefaultValueInput(
											newField.type,
											newField.defaultValue || "",
											(value) =>
												setNewField({
													...newField,
													defaultValue: value,
												})
										)}
									</div>
								)}
							</div>

							<Button onClick={handleCreate} className="w-full">
								<Plus className="mr-2 h-4 w-4" />
								Добавить поле
							</Button>
						</div>
					) : (
						<div className="flex flex-col space-y-4 flex-1">
							<div className=" space-y-4 flex-1">
								<h3 className="font-semibold">
									{`Редактирование поля: ${selectedField?.displayName}`}
								</h3>
								<div className="grid gap-2">
									<Label htmlFor="edit-field-displayName">
										Отображаемое имя
									</Label>
									<Input
										id="edit-field-displayName"
										value={editedField?.displayName}
										onChange={(e) =>
											setEditedField({
												...editedField!,
												displayName: e.target.value,
											})
										}
										placeholder="Например, 'Код региона'"
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="edit-field-name">
										Системное имя (латиницей)
									</Label>
									<div className="relative">
										<Input
											id="edit-field-name"
											value={editedField?.name}
											onChange={(e) => {
												const filtered =
													e.target.value.replace(
														/[^a-zA-Z0-9_]/g,
														""
													);
												setEditedField({
													...editedField!,
													name: filtered,
												});
											}}
											placeholder="Например, 'region_code'"
											className="pr-8" // добавляем отступ справа под иконку
										/>
										<Tooltip>
											<TooltipTrigger asChild>
												<TriangleAlert className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-500 w-4 h-4" />
											</TooltipTrigger>
											<TooltipContent className="max-w-70">
												<p>
													Изменяйте поле осторожно —
													его значения используются в
													логике приложения. Перед
													изменением проверяйте
													документацию.
												</p>
											</TooltipContent>
										</Tooltip>
									</div>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="edit-field-type">
										Тип поля
									</Label>
									<Select
										value={editedField?.type}
										onValueChange={(value) =>
											setEditedField({
												...editedField!,
												type: value as CreateFieldDto["type"],
											})
										}
									>
										<SelectTrigger id="edit-field-type">
											<SelectValue placeholder="Выберите тип" />
										</SelectTrigger>
										<SelectContent>
											{FIELD_TYPES.map((type) => (
												<SelectItem
													key={type}
													value={type}
												>
													{type}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="edit-is-required"
										checked={editedField?.isRequired}
										onCheckedChange={(checked) =>
											setEditedField({
												...editedField!,
												isRequired: !!checked,
											})
										}
										disabled={
											editedField?.isUnique ||
											isUniqueDisabled
										}
									/>
									<Label htmlFor="edit-is-required">
										Обязательное
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="edit-is-unique"
										checked={editedField?.isUnique}
										onCheckedChange={(checked) => {
											const isUniqueChecked = !!checked;
											setEditedField({
												...editedField!,
												isUnique: isUniqueChecked,
												isRequired: isUniqueChecked
													? true
													: !!editedField?.isRequired,
											});
										}}
										disabled={isUniqueDisabled}
									/>
									<Label htmlFor="edit-is-unique">
										Уникальное
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="edit-has-default-value"
										checked={hasDefaultValueEdit}
										onCheckedChange={(checked) => {
											const hasDefault = !!checked;
											setHasDefaultValueEdit(hasDefault);
											// Очищаем значение по умолчанию при выключении чекбокса
											if (!hasDefault) {
												setEditedField({
													...editedField!,
													defaultValue: undefined,
												});
											}
										}}
									/>
									<Label htmlFor="edit-has-default-value">
										Значение по умолчанию
									</Label>
								</div>
								{hasDefaultValueEdit && (
									<div className="grid gap-2">
										<Label htmlFor="edit-default-value">
											Значение по умолчанию (
											{editedField?.type})
										</Label>
										{renderDefaultValueInput(
											editedField?.type || "STRING",
											editedField?.defaultValue || "",
											(value) =>
												setEditedField({
													...editedField!,
													defaultValue: value,
												}),
											editedField?.isSystem || false
										)}
									</div>
								)}
							</div>

							<Button onClick={handleUpdate} className="w-full">
								<Pencil className="mr-2 h-4 w-4" />
								Сохранить изменения
							</Button>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
