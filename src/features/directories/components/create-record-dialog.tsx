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
import { useForm, Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TriangleAlert } from "lucide-react";
import { z } from "zod";
import { useEffect } from "react";
import { toast } from "sonner";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/ui/form";
import { DirectoryField } from "../model/types";
import { makeFormSchema } from "../model/create-record-shemas";
import { useCreateDirectoryRecord } from "../api/dictionaries-api";
import { Description } from "@radix-ui/react-dialog";

interface CreateRecordDialogProps<F extends readonly DirectoryField[]> {
	directoryId: string;
	fields: F;
	onClose: () => void;
	onRecordCreated?: () => void;
}

export function CreateRecordDialog<F extends readonly DirectoryField[]>({
	directoryId,
	fields,
	onClose,
	onRecordCreated,
}: CreateRecordDialogProps<F>) {
	const formSchema = makeFormSchema(fields);

	type FormValues = z.infer<typeof formSchema>;
	type FieldValues = string | number | boolean | Date | null | undefined;

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
	});

	const {
		createRecord,
		isLoading: isSubmitting,
		error: apiError,
	} = useCreateDirectoryRecord();

	// Обработка нажатия Escape для закрытия диалога
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};

		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [onClose]);

	const shouldSkipField = (field: DirectoryField, value: FieldValues) => {
		if (!field.isRequired) {
			if (field.type === "DATE" && value === null) {
				return true;
			}
			if (typeof value === "string" && value.trim() === "") {
				return true;
			}
			if (value === undefined) {
				return true;
			}
		}
		return false;
	};

	const onSubmit = async (values: FormValues) => {
		const validatedValues = fields
			.map((field) => ({
				fieldId: field.id,
				value: values[field.name as keyof FormValues],
			}))
			.filter(
				(item) =>
					!shouldSkipField(
						fields.find((f) => f.id === item.fieldId)!,
						item.value as FieldValues
					)
			);

		const formData = {
			directoryId,
			values: validatedValues.map((v) => ({
				fieldId: v.fieldId,
				value:
					v.value instanceof Date
						? v.value.toISOString()
						: String(v.value || ""),
			})),
		};

		try {
			await createRecord(formData);
			toast.success("Запись успешно создана");
			form.reset(); // Очищаем форму после успешной отправки
			onRecordCreated?.(); // Вызываем колбек для обновления данных
		} catch (error: unknown) {
			console.error("Ошибка при создании записи:", error);

			// Показываем toast уведомление об ошибке
			const errorMessage =
				error && typeof error === "object" && "message" in error
					? String((error as { message: unknown }).message)
					: "Произошла неизвестная ошибка";
			toast.error(`Ошибка при создании записи: ${errorMessage}`);
		}
	};

	const renderFieldInput = (field: DirectoryField) => {
		return (
			<FormField
				key={field.id}
				control={form.control}
				name={field.name as Path<FormValues>}
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
				<Description />
				<DialogHeader>
					<DialogTitle>Создать запись справочника</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						{isSubmitting && (
							<div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
								<div className="flex items-center">
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
									<span className="text-blue-800 text-sm">
										Создание записи...
									</span>
								</div>
							</div>
						)}
						<div
							className={`py-4 ${
								isSubmitting
									? "opacity-50 pointer-events-none"
									: ""
							}`}
						>
							{[...fields]
								.sort((a, b) => a.sortOrder - b.sortOrder)
								.map((field) => renderFieldInput(field))}
						</div>

						{apiError && (
							<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
								<div className="flex items-center">
									<TriangleAlert className="h-4 w-4 text-red-600 mr-2" />
									<span className="text-red-800 text-sm">
										{apiError}
									</span>
								</div>
							</div>
						)}

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={onClose}
								autoFocus={false}
								disabled={isSubmitting}
							>
								Отмена
							</Button>
							<Button
								type="submit"
								autoFocus={false}
								disabled={isSubmitting}
							>
								{isSubmitting ? "Создание..." : "Создать"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
