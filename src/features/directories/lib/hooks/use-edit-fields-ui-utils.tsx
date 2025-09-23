import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { ToggleableInput } from "@/shared/ui/toggleable-input";
import { SimpleDatePicker } from "@/shared/ui/simple-date-picker";
import React from "react";

/**
 * Универсальная функция для рендеринга поля ввода значения по умолчанию
 * @param fieldType Тип поля
 * @param value Текущее значение
 * @param onChange Обработчик изменения
 * @param disabled Заблокировано ли поле
 * @returns JSX элемент поля ввода
 */
export function renderDefaultValueInput(
	fieldType: string,
	value: string,
	onChange: (value: string) => void,
	disabled: boolean = false
): React.ReactNode {
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
}
