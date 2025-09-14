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
import { Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Directory } from "../types";

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
	directory: Directory;
	onFieldCreate: (newField: CreateFieldDto) => Promise<void>;
	onFieldDelete: (fieldId: string) => Promise<void>;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function EditFieldsDialog({
	directory,
	onFieldCreate,
	onFieldDelete,
	open,
	onOpenChange,
}: EditFieldsDialogProps) {
	const [isDialogOpen, setIsDialogOpen] = useState(open);
	const [newField, setNewField] =
		useState<CreateFieldDto>(initialNewFieldState);

	// Синхронизация с пропсом open
	useEffect(() => {
		setIsDialogOpen(open);
	}, [open]);

	const handleDialogClose = (openState: boolean) => {
		if (!openState) {
			setNewField(initialNewFieldState); // Сброс формы при закрытии
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

	return (
		<Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
			<DialogContent className="max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Редактирование полей</DialogTitle>
				</DialogHeader>
				<div className="py-4 space-y-6">
					<div>
						<h3 className="font-semibold mb-2">
							Существующие поля
						</h3>
						<div className="space-y-2 max-h-40 overflow-y-auto pr-2">
							{directory.fields.map((field) => (
								<div
									key={field.id}
									className="flex items-center justify-between p-2 border rounded-md"
								>
									<div className="flex flex-col">
										<span
											className="truncate font-medium"
											title={field.displayName}
										>
											{field.displayName}
										</span>
										<span className="text-xs text-muted-foreground">
											{field.name} ({field.type})
										</span>
									</div>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => onFieldDelete(field.id)}
										disabled={field.isSystem}
										title={
											field.isSystem
												? "Системное поле нельзя удалить"
												: "Удалить поле"
										}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							))}
						</div>
					</div>
					<div className="space-y-4 border-t pt-4">
						<h3 className="font-semibold">Добавить новое поле</h3>
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
							<Label htmlFor="is-required">Обязательное</Label>
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
				</div>
			</DialogContent>
		</Dialog>
	);
}
