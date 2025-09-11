"use client";

import { useCallback, useEffect, useState } from "react";
import {
	createField,
	deleteField,
	getDirectoryById,
} from "../api/dictionaries-api";
import { Directory, DirectoryValue } from "../types";
import { Loader2 } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/ui/table";
import { toast } from "sonner";
import { CreateFieldDto, EditFieldsDialog } from "./edit-fields-dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { upsertFieldValue } from "../api/dictionaries-api";

interface DirectoryContentProps {
	directoryId: string;
}

export default function DirectoryContent({
	directoryId,
}: DirectoryContentProps) {
	const [directory, setDirectory] = useState<Directory | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isFieldsDialogOpen, setIsFieldsDialogOpen] = useState(false);
	const [values, setValues] = useState<DirectoryValue[]>([]);
	const [newRowValues, setNewRowValues] = useState<Record<string, string>>(
		{}
	);
	const [savingStates, setSavingStates] = useState<Record<string, boolean>>(
		{}
	);

	const fetchDirectory = useCallback(async () => {
		try {
			const fetchedDirectory = await getDirectoryById(directoryId);
			setDirectory(fetchedDirectory);
			setValues([...fetchedDirectory.values]);
			const newRow: Record<string, string> = {};
			fetchedDirectory.fields.forEach((field) => {
				newRow[field.id] = "";
			});
			setNewRowValues(newRow);
		} catch (error) {
			console.error("Error fetching directory:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Произошла неизвестная ошибка";
			toast.error(
				`Не удалось загрузить содержимое справочника: ${errorMessage}`
			);
		} finally {
			setIsLoading(false);
		}
	}, [directoryId]);

	useEffect(() => {
		if (directoryId) {
			fetchDirectory();
		}
	}, [directoryId, fetchDirectory]);

	const handleCreateField = async (newField: CreateFieldDto) => {
		if (!directory) return;
		try {
			await createField(directory.id, newField);
			toast.success("Поле успешно создано");
			fetchDirectory();
			setIsFieldsDialogOpen(false);
		} catch (error) {
			console.error("Error creating field:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Произошла неизвестная ошибка";
			toast.error(`Не удалось создать поле: ${errorMessage}`);
		}
	};

	const handleDeleteField = async (fieldId: string) => {
		if (!directory) return;
		try {
			await deleteField(directory.id, fieldId);
			toast.success("Поле успешно удалено");
			fetchDirectory();
		} catch (error) {
			console.error("Error deleting field:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Произошла неизвестная ошибка";
			toast.error(`Не удалось удалить поле: ${errorMessage}`);
		}
	};

	const handleValueChange = async (
		valueId: string,
		fieldId: string,
		newValue: string
	) => {
		// Обновляем локальное состояние
		const updatedValues = values.map((v) =>
			v.id === valueId && v.fieldId === fieldId
				? { ...v, value: newValue }
				: v
		);
		setValues(updatedValues);

		// Сохраняем значение через upsert
		try {
			setSavingStates((prev) => ({ ...prev, [valueId]: true }));
			await upsertFieldValue(fieldId, newValue);
			toast.success(`Значение для поля сохранено`);
		} catch (error) {
			console.error("Ошибка при сохранении значения:", error);
			toast.error(`Не удалось сохранить значение`);
		} finally {
			setSavingStates((prev) => ({ ...prev, [valueId]: false }));
		}
	};

	const handleNewRowChange = async (fieldId: string, value: string) => {
		setNewRowValues((prev) => ({ ...prev, [fieldId]: value }));

		if (value.trim() !== "" && directory) {
			try {
				const key = `new_${fieldId}`;
				setSavingStates((prev) => ({ ...prev, [key]: true }));

				// Сохраняем новое значение
				const result = await upsertFieldValue(fieldId, value);

				// Обновляем состояние
				setValues((prev) => [
					...prev,
					{
						id: result.id,
						directoryId: directory.id,
						fieldId: fieldId,
						value: value,
					},
				]);

				// Сбрасываем поле в новой строке
				setNewRowValues((prev) => ({ ...prev, [fieldId]: "" }));
				toast.success(`Новое значение добавлено`);
			} catch (error) {
				console.error("Ошибка при добавлении значения:", error);
				toast.error(`Не удалось добавить значение`);
			} finally {
				setSavingStates((prev) => ({
					...prev,
					[`new_${fieldId}`]: false,
				}));
			}
		}
	};

	if (isLoading) {
		return <Loader2 className="mx-auto my-10 h-16 w-16 animate-spin" />;
	}

	if (!directory) {
		return <p>Выберите справочник для просмотра содержимого.</p>;
	}

	return (
		<div className="bg-card p-6 border rounded-lg shadow-sm justify-self-stretch">
			<div className="flex justify-between items-center mb-4">
				<div>
					<h2 className="text-2xl font-bold">
						{directory.displayName}
					</h2>
					<p className="text-muted-foreground mt-1">
						{directory.description}
					</p>
				</div>
				<div>
					<EditFieldsDialog
						open={isFieldsDialogOpen}
						onOpenChange={setIsFieldsDialogOpen}
						directory={directory}
						onFieldCreate={handleCreateField}
						onFieldDelete={handleDeleteField}
					/>
				</div>
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						{directory.fields.map((field) => (
							<TableHead key={field.id}>
								{field.displayName}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{values.map((value) => (
						<TableRow key={value.id}>
							{directory.fields.map((field) => (
								<TableCell key={field.id}>
									{value.fieldId === field.id ? (
										<div className="flex items-center">
											<Input
												type="text"
												value={
													(value.value as string) ||
													""
												}
												onChange={(e) =>
													handleValueChange(
														value.id,
														field.id,
														e.target.value
													)
												}
												disabled={
													savingStates[value.id]
												}
											/>
											{savingStates[value.id] && (
												<Loader2 className="ml-2 h-4 w-4 animate-spin" />
											)}
										</div>
									) : (
										""
									)}
								</TableCell>
							))}
						</TableRow>
					))}
					<TableRow>
						{directory.fields.map((field) => (
							<TableCell key={field.id}>
								<div className="flex items-center">
									<Input
										type="text"
										value={newRowValues[field.id] || ""}
										onChange={(e) =>
											handleNewRowChange(
												field.id,
												e.target.value
											)
										}
										placeholder="Новое значение"
										disabled={
											savingStates[`new_${field.id}`]
										}
									/>
									{savingStates[`new_${field.id}`] && (
										<Loader2 className="ml-2 h-4 w-4 animate-spin" />
									)}
								</div>
							</TableCell>
						))}
					</TableRow>
				</TableBody>
			</Table>
		</div>
	);
}
