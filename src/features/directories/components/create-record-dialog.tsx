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

interface CreateRecordDialogProps<F extends readonly DirectoryField[]> {
	directoryId: string;
	fields: F;
	onClose: () => void;
}

export function CreateRecordDialog<F extends readonly DirectoryField[]>({
	directoryId,
	fields,
	onClose,
}: CreateRecordDialogProps<F>) {
	const formSchema = makeFormSchema(fields);

	type FormValues = z.infer<typeof formSchema>;
	type FieldValues = string | number | boolean | Date | null | undefined;

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
	});

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

	const onSubmit = (values: FormValues) => {
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
				...v,
				value:
					v.value instanceof Date ? v.value.toISOString() : v.value,
			})),
		};

		console.log("Отправка данных:", formData);
		// Здесь будет логика отправки на сервер
		onClose();
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
}
