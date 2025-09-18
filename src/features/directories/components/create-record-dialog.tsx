import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { SimpleDatePicker } from "@/shared/ui/simple-date-picker";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { ToggleableInput } from "@/shared/ui/toggleable-input";
import { Label } from "@/shared/ui/label";
import { useState } from "react";
import { TriangleAlert } from "lucide-react";

interface Field {
	id: string;
	displayName: string;
	name: string;
	type: string;
	isRequired: boolean;
}

interface CreateRecordDialogProps {
	directoryId: string;
	fields: Field[];
	onClose: () => void;
}

export const CreateRecordDialog = ({
	directoryId,
	fields,
	onClose,
}: CreateRecordDialogProps) => {
	const [fieldValues, setFieldValues] = useState<
		Record<string, string | number | boolean | Date | null>
	>({});

	const handleFieldChange = (
		fieldId: string,
		value: string | number | boolean | Date | null
	) => {
		setFieldValues((prev) => ({
			...prev,
			[fieldId]: value,
		}));
	};

	const handleSubmit = () => {
		// Проверка валидности дат
		const dateFieldErrors: string[] = [];
		const validatedValues = fields.map((field) => {
			const value = fieldValues[field.id];

			if (field.type === "DATE" && value && !(value instanceof Date)) {
				dateFieldErrors.push(
					`Поле ${
						field.name
					}: ожидался тип Date, получено ${typeof value}`
				);
			}

			return {
				fieldId: field.id,
				value: value || null,
			};
		});

		if (dateFieldErrors.length > 0) {
			console.error("Ошибки валидации дат:", dateFieldErrors);
			// В реальном приложении здесь должно быть отображение ошибок
			return;
		}

		const formData = {
			directoryId,
			values: validatedValues,
		};

		console.log("Отправка данных:", {
			...formData,
			values: formData.values.map((v) => ({
				...v,
				value:
					v.value instanceof Date ? v.value.toISOString() : v.value,
			})),
		});
		// Здесь будет логика отправки на сервер
		onClose();
	};

	const renderFieldInput = (field: Field) => {
		switch (field.type) {
			case "STRING":
				return (
					<div className="mb-4">
						<Label
							htmlFor={field.id}
							className="m-2 flex justify-between"
						>
							{field.displayName}
							{field.isRequired && (
								<div className="flex justify-between">
									<TriangleAlert
										color="Chocolate"
										className="h-4"
									/>
									<span className="text-gray-400">
										{" "}
										обязательное
									</span>
								</div>
							)}
						</Label>
						<ToggleableInput
							id={field.id}
							value={
								typeof fieldValues[field.id] === "string"
									? (fieldValues[field.id] as string)
									: ""
							}
							onChange={(value) =>
								handleFieldChange(field.id, value)
							}
						/>
					</div>
				);

			case "NUMBER":
				return (
					<div className="mb-4">
						<Label htmlFor={field.id} className="m-2">
							{field.displayName}
							{field.isRequired && (
								<span className="text-red-500">
									{" "}
									(обязательное)
								</span>
							)}
						</Label>
						<Input
							id={field.id}
							type="number"
							value={
								typeof fieldValues[field.id] === "number"
									? (fieldValues[field.id] as number)
									: ""
							}
							onChange={(
								e: React.ChangeEvent<HTMLInputElement>
							) =>
								handleFieldChange(
									field.id,
									Number(e.target.value)
								)
							}
						/>
					</div>
				);

			case "DATE":
				return (
					<div className="mb-4">
						<Label className="m-2">
							{field.displayName}
							{field.isRequired && (
								<span className="text-red-500">
									{" "}
									(обязательное)
								</span>
							)}
						</Label>
						<SimpleDatePicker
							value={
								fieldValues[field.id] instanceof Date
									? (fieldValues[field.id] as Date)
									: null
							}
							onChange={(date) =>
								handleFieldChange(field.id, date)
							}
							placeholder="Выберите дату"
						/>
					</div>
				);

			case "BOOLEAN":
				return (
					<div className="mb-4 flex items-center">
						<Checkbox
							id={field.id}
							checked={!!fieldValues[field.id]}
							onCheckedChange={(checked: boolean) =>
								handleFieldChange(field.id, checked)
							}
						/>
						<Label htmlFor={field.id} className="ml-2">
							{field.displayName}
							{field.isRequired && (
								<span className="text-red-500">
									{" "}
									(обязательное)
								</span>
							)}
						</Label>
					</div>
				);

			default:
				return (
					<div className="mb-4">
						<Label htmlFor={field.id}>
							{field.displayName}
							{field.isRequired && (
								<span className="text-red-500">
									{" "}
									(обязательное)
								</span>
							)}
						</Label>
						<ToggleableInput
							id={field.id}
							value={
								typeof fieldValues[field.id] === "string"
									? (fieldValues[field.id] as string)
									: ""
							}
							onChange={(value) =>
								handleFieldChange(field.id, value)
							}
						/>
					</div>
				);
		}
	};

	return (
		<Dialog open onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Создать запись справочника</DialogTitle>
				</DialogHeader>

				<div className="py-4">
					{fields.map((field) => (
						<div key={field.id}>{renderFieldInput(field)}</div>
					))}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Отмена
					</Button>
					<Button onClick={handleSubmit}>Создать</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
