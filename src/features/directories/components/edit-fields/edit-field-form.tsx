"use client";

import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { Pencil, TriangleAlert } from "lucide-react";
import { CreateFieldDto, DirectoryField } from "../../model/edit-fields-types";
import { FIELD_TYPES } from "../../model/edit-fields-constants";
import { renderDefaultValueInput } from "../../lib/hooks/use-edit-fields-utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

interface EditFieldFormProps {
	editedField: DirectoryField | null;
	hasDefaultValueEdit: boolean;
	setEditedField: (field: DirectoryField | null) => void;
	setHasDefaultValueEdit: (hasDefault: boolean) => void;
	onSubmit: () => void;
	isUniqueDisabled: boolean;
}

export function EditFieldForm({
	editedField,
	hasDefaultValueEdit,
	setEditedField,
	setHasDefaultValueEdit,
	onSubmit,
	isUniqueDisabled,
}: EditFieldFormProps) {
	if (!editedField) {
		return null;
	}

	// Используем общую функцию для рендеринга полей ввода

	return (
		<div className="flex flex-col space-y-4 flex-1">
			<div className=" space-y-4 flex-1">
				<h3 className="font-semibold">
					{`Редактирование поля: ${editedField.displayName}`}
				</h3>
				<div className="grid gap-2">
					<Label htmlFor="edit-field-displayName">
						Отображаемое имя
					</Label>
					<Input
						id="edit-field-displayName"
						value={editedField.displayName}
						onChange={(e) =>
							setEditedField({
								...editedField,
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
							value={editedField.name}
							onChange={(e) => {
								const filtered = e.target.value.replace(
									/[^a-zA-Z0-9_]/g,
									""
								);
								setEditedField({
									...editedField,
									name: filtered,
								});
							}}
							placeholder="Например, 'region_code'"
							className="pr-8"
						/>
						<Tooltip>
							<TooltipTrigger asChild>
								<TriangleAlert className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-500 w-4 h-4" />
							</TooltipTrigger>
							<TooltipContent className="max-w-70">
								<p>
									Изменяйте поле осторожно — его значение
									может использоваться в логике приложения.
									Перед изменением проверяйте документацию.
								</p>
							</TooltipContent>
						</Tooltip>
					</div>
				</div>
				<div className="grid gap-2">
					<Label htmlFor="edit-field-type">Тип поля</Label>
					<Select
						value={editedField.type}
						onValueChange={(value) =>
							setEditedField({
								...editedField,
								type: value as CreateFieldDto["type"],
							})
						}
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
						checked={editedField.isRequired}
						onCheckedChange={(checked) =>
							setEditedField({
								...editedField,
								isRequired: !!checked,
							})
						}
						disabled={editedField.isUnique || isUniqueDisabled}
					/>
					<Label htmlFor="edit-is-required">Обязательное</Label>
				</div>
				<div className="flex items-center space-x-2">
					<Checkbox
						id="edit-is-unique"
						checked={editedField.isUnique}
						onCheckedChange={(checked) => {
							const isUniqueChecked = !!checked;
							setEditedField({
								...editedField,
								isUnique: isUniqueChecked,
								isRequired: isUniqueChecked
									? true
									: !!editedField.isRequired,
							});
						}}
						disabled={isUniqueDisabled}
					/>
					<Label htmlFor="edit-is-unique">Уникальное</Label>
				</div>
				<div className="flex items-center space-x-2">
					<Checkbox
						id="edit-has-default-value"
						checked={hasDefaultValueEdit}
						onCheckedChange={(checked) => {
							const hasDefault = !!checked;
							setHasDefaultValueEdit(hasDefault);
							if (!hasDefault) {
								setEditedField({
									...editedField,
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
							Значение по умолчанию ({editedField.type})
						</Label>
						{renderDefaultValueInput(
							editedField.type || "STRING",
							editedField.defaultValue || "",
							(value) =>
								setEditedField({
									...editedField,
									defaultValue: value,
								}),
							editedField.isSystem || false
						)}
					</div>
				)}
			</div>

			<Button onClick={onSubmit} className="w-full">
				<Pencil className="mr-2 h-4 w-4" />
				Сохранить изменения
			</Button>
		</div>
	);
}
