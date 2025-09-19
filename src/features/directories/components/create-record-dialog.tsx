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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TriangleAlert } from "lucide-react";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/ui/form";

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
	// Упрощенная схема валидации - только базовые проверки типов
	const formSchema = z.object(
		fields.reduce((acc: Record<string, z.ZodTypeAny>, field) => {
			switch (field.type) {
				case "STRING":
					acc[field.id] = z.string().optional().nullable();
					break;
				case "NUMBER":
					acc[field.id] = z.number().optional().nullable();
					break;
				case "DATE":
					acc[field.id] = z.union([z.date(), z.null()]).optional();
					break;
				case "BOOLEAN":
					acc[field.id] = z.boolean().optional().nullable();
					break;
				default:
					acc[field.id] = z.string().optional().nullable();
			}
			return acc;
		}, {})
	);

	type FormValues = z.infer<typeof formSchema>;

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: fields.reduce(
			(acc: Record<string, string | number | boolean | null>, field) => {
				acc[field.id] =
					field.type === "BOOLEAN"
						? false
						: field.type === "NUMBER"
						? 0
						: "";
				return acc;
			},
			{}
		),
	});

	const shouldSkipField = (
		field: Field,
		value: string | number | boolean | Date | null | undefined
	) => {
		// Для необязательных полей пропускаем пустые значения
		if (!field.isRequired) {
			// Для полей типа DATE пропускаем null
			if (field.type === "DATE" && value === null) {
				return true;
			}
			// Проверяем строки на пустоту или пробелы
			if (typeof value === "string" && value.trim() === "") {
				return true;
			}
			// Проверяем на undefined
			if (value === undefined) {
				return true;
			}
		}
		return false;
	};

	const onSubmit = (values: FormValues) => {
		// Проверка обязательных полей
		const errors: string[] = [];
		fields.forEach((field) => {
			if (field.isRequired) {
				const value = values[field.id];
				let isEmpty = false;

				if (field.type === "DATE") {
					// Для дат проверяем только null/undefined
					isEmpty = value === null || value === undefined;
				} else if (typeof value === "string") {
					// Для строк проверяем пустоту и пробелы
					isEmpty = value.trim() === "";
				} else {
					// Для остальных типов проверяем на пустоту
					isEmpty =
						value === null || value === undefined || value === "";
				}

				if (isEmpty) {
					errors.push(
						`Поле "${field.displayName}" обязательно для заполнения`
					);
					form.setError(field.id, {
						type: "required",
						message: "Обязательное поле",
					});
				}
			}
		});

		if (errors.length > 0) {
			console.error("Ошибки валидации:", errors);
			return;
		}

		const validatedValues = fields
			.map((field) => ({
				fieldId: field.id,
				value: values[field.id],
			}))
			.filter(
				(item) =>
					!shouldSkipField(
						fields.find((f) => f.id === item.fieldId)!,
						item.value
					)
			);

		const formData = {
			directoryId,
			values: validatedValues.map((v) => ({
				...v,
				value:
					v.value instanceof Date ? v.value.toISOString() : v.value,
			})),
		};

		console.log("Отправка данных:", formData);
		// Здесь будет логика отправки на сервер
		onClose();
	};

	const renderFieldInput = (field: Field) => {
		return (
			<FormField
				key={field.id}
				control={form.control}
				name={field.id}
				render={({ field: formField }) => (
					<FormItem className="mb-4">
						{field.type !== "BOOLEAN" && (
							<FormLabel className="flex justify-between m-2">
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
							</FormLabel>
						)}
						<FormControl>
							{field.type === "STRING" ? (
								<ToggleableInput
									id={field.id}
									value={String(formField.value || "")}
									onChange={formField.onChange}
								/>
							) : field.type === "NUMBER" ? (
								<Input
									id={field.id}
									type="number"
									value={Number(formField.value || 0)}
									onChange={(e) =>
										formField.onChange(
											Number(e.target.value)
										)
									}
								/>
							) : field.type === "DATE" ? (
								<SimpleDatePicker
									value={formField.value as Date | null}
									onChange={formField.onChange}
									placeholder="Выберите дату"
								/>
							) : field.type === "BOOLEAN" ? (
								<div className="flex items-center">
									<Checkbox
										id={field.id}
										checked={Boolean(formField.value)}
										onCheckedChange={formField.onChange}
									/>
									<FormLabel
										htmlFor={field.id}
										className="ml-2"
									>
										{field.displayName}
										{field.isRequired && (
											<span className="text-red-500">
												{" "}
												(обязательное)
											</span>
										)}
									</FormLabel>
								</div>
							) : (
								<ToggleableInput
									id={field.id}
									value={String(formField.value || "")}
									onChange={formField.onChange}
								/>
							)}
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		);
	};

	return (
		<Dialog open onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Создать запись справочника</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<div className="py-4">
							{fields.map((field) => renderFieldInput(field))}
						</div>

						<DialogFooter>
							<Button variant="outline" onClick={onClose}>
								Отмена
							</Button>
							<Button type="submit">Создать</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
