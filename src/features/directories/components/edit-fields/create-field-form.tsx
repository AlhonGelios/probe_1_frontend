"use client";

import { useEffect } from "react";
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
import { Plus } from "lucide-react";
import { CreateFieldDto } from "../../model/edit-fields-types";
import { FIELD_TYPES } from "../../model/edit-fields-constants";
import { renderDefaultValueInput } from "../../lib/hooks/use-edit-fields-utils";

interface CreateFieldFormProps {
	newField: CreateFieldDto;
	hasDefaultValue: boolean;
	setNewField: (field: CreateFieldDto) => void;
	setHasDefaultValue: (hasDefault: boolean) => void;
	onSubmit: () => void;
}

export function CreateFieldForm({
	newField,
	hasDefaultValue,
	setNewField,
	setHasDefaultValue,
	onSubmit,
}: CreateFieldFormProps) {
	// Эффект для синхронизации состояния BOOLEAN полей
	useEffect(() => {
		const isBooleanField = newField.type === "BOOLEAN";

		if (isBooleanField) {
			// Для BOOLEAN полей принудительно устанавливаем обязательность, значение по умолчанию и отключаем уникальность
			setNewField({
				...newField,
				isRequired: true,
				isUnique: false,
			});
			setHasDefaultValue(true);
		}
	}, [newField.type, setNewField, setHasDefaultValue]);

	// Используем общую функцию для рендеринга полей ввода

	return (
		<div className="flex flex-col space-y-4 flex-1">
			<div className="space-y-4 flex-1">
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
					<Label htmlFor="new-field-type">Тип поля</Label>
					<Select
						value={newField.type}
						onValueChange={(value) => {
							const newType = value as CreateFieldDto["type"];

							// Сначала сбрасываем все чекбоксы в исходное состояние
							const resetField = {
								...newField,
								type: newType,
								isRequired: false,
								isUnique: false,
							};

							setNewField(resetField);
							setHasDefaultValue(false);

							// Затем применяем специфичную логику для нового типа поля
							if (newType === "BOOLEAN") {
								setNewField({
									...resetField,
									isRequired: true,
									isUnique: false,
								});
								setHasDefaultValue(true);
							}
						}}
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
						disabled={
							newField.isUnique || newField.type === "BOOLEAN"
						}
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
						disabled={newField.type === "BOOLEAN"}
					/>
					<Label htmlFor="is-unique">Уникальное</Label>
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
						disabled={newField.type === "BOOLEAN"}
					/>
					<Label htmlFor="has-default-value">
						Значение по умолчанию
					</Label>
				</div>
				{hasDefaultValue && (
					<div className="grid gap-2">
						<Label htmlFor="default-value">
							Значение по умолчанию ({newField.type})
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

			<Button onClick={onSubmit} className="w-full">
				<Plus className="mr-2 h-4 w-4" />
				Добавить поле
			</Button>
		</div>
	);
}
