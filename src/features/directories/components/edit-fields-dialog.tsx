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
import { Plus, Trash2, Pencil } from "lucide-react"; // Добавил Pencil для редактирования
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { DirectoryField } from "../types";
import { Separator } from "@/shared/ui/separator";

const FIELD_TYPES = ["STRING", "NUMBER", "DATE", "BOOLEAN"] as const;

export type CreateFieldDto = {
	name: string;
	displayName: string;
	type: (typeof FIELD_TYPES)[number];
	isRequired?: boolean;
	isUnique?: boolean;
	defaultValue?: object;
	isSystem: boolean;
};

// Новый тип для DTO редактирования поля
export type UpdateFieldDto = Omit<CreateFieldDto, "isSystem"> & {
	id: string;
};

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
	fields: DirectoryField[];
	onFieldCreate: (newField: CreateFieldDto) => Promise<void>;
	onFieldDelete: (fieldId: string) => Promise<void>;
	onFieldUpdate: (
		fieldId: string,
		updatedField: UpdateFieldDto
	) => Promise<void>; // Новое свойство для обновления
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditFieldsDialog({
	fields,
	onFieldCreate,
	onFieldDelete,
	onFieldUpdate, // Получаем новую функцию
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

	// Синхронизация с пропсом open
	useEffect(() => {
		setIsDialogOpen(open);
		// Сброс состояния при открытии/закрытии
		if (!open) {
			setMode("create");
			setSelectedField(null);
			setNewField(initialNewFieldState);
			setEditedField(null);
		}
	}, [open]);

	// Обработчик выбора поля для редактирования
	const handleSelectField = (field: DirectoryField) => {
		setMode("edit");
		setSelectedField(field);
		setEditedField(field); // Инициализация формы редактирования данными поля
	};

	const handleDialogClose = (openState: boolean) => {
		if (!openState) {
			setNewField(initialNewFieldState); // Сброс формы при закрытии
			setMode("create"); // Сброс режима
			setSelectedField(null);
			onOpenChange(false);
		}
		setIsDialogOpen(openState);
	};

	const handleCreate = async () => {
		if (!newField.name || !newField.displayName) {
			toast.error("Системное и отображаемое имя поля обязательны.");
			return;
		}

		let defaultValue: object | undefined;

		await onFieldCreate({ ...newField, defaultValue });
		setNewField(initialNewFieldState); // Сброс формы после создания
	};

	const handleUpdate = async () => {
		if (!editedField) return;

		// Здесь можно добавить валидацию
		if (!editedField.name || !editedField.displayName) {
			toast.error("Системное и отображаемое имя поля обязательны.");
			return;
		}

		const { id, ...updateData } = editedField; // Исключаем id и isSystem из данных для API
		await onFieldUpdate(id, updateData as UpdateFieldDto);
		setMode("create");
		setSelectedField(null);
		setEditedField(null);
	};

	const isUniqueDisabled = mode === "edit" && editedField?.isSystem;

	return (
		<Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
			<DialogContent className="max-h-[90vh] min-w-[50vw] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Редактирование полей</DialogTitle>
				</DialogHeader>
				<div className="flex flex-row w-full gap-4 py-4 space-y-6">
					<div className="grow w-1/6">
						<h3 className="font-semibold mb-2">
							Существующие поля
						</h3>
						<ul className="space-y-2 overflow-y-auto ">
							{fields.map((field) => (
								<li
									key={field.id}
									className="flex items-center justify-between p-2 border rounded-md hover:bg-gray-100 hover:cursor-pointer"
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
											e.stopPropagation(); // Останавливаем событие, чтобы не сработал onClick на li
											onFieldDelete(field.id);
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
					{/* Условный рендеринг формы */}
					{mode === "create" ? (
						<div className="space-y-4 grow ">
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
											name: e.target.value,
										})
									}
									placeholder="Например, 'region_code'"
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="new-field-type">Тип поля</Label>
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
											<SelectItem key={type} value={type}>
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
								<Label htmlFor="is-unique">Уникальное</Label>
							</div>
							<Button onClick={handleCreate} className="w-full">
								<Plus className="mr-2 h-4 w-4" />
								Добавить поле
							</Button>
						</div>
					) : (
						<div className="space-y-4 grow ">
							<h3 className="font-semibold">
								Редактирование поля
							</h3>
							<p className="text-sm text-muted-foreground">
								{`Редактирование поля: ${selectedField?.displayName}`}
							</p>
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
								<Input
									id="edit-field-name"
									value={editedField?.name}
									onChange={(e) =>
										setEditedField({
											...editedField!,
											name: e.target.value,
										})
									}
									placeholder="Например, 'region_code'"
									disabled // Системное имя нельзя изменять после создания
								/>
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
									disabled // Тип поля нельзя изменять
								>
									<SelectTrigger id="edit-field-type">
										<SelectValue placeholder="Выберите тип" />
									</SelectTrigger>
									<SelectContent>
										{FIELD_TYPES.map((type) => (
											<SelectItem key={type} value={type}>
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
												: editedField?.isRequired,
										});
									}}
									disabled={isUniqueDisabled}
								/>
								<Label htmlFor="edit-is-unique">
									Уникальное
								</Label>
							</div>
							<Button onClick={handleUpdate} className="w-full">
								<Pencil className="mr-2 h-4 w-4" />
								Сохранить изменения
							</Button>
							<Button
								variant="outline"
								onClick={() => {
									setMode("create");
									setSelectedField(null);
									setEditedField(null);
								}}
								className="w-full"
							>
								<Plus className="mr-2 h-4 w-4" />
								Добавить новое поле
							</Button>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
