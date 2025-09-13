"use client";

import { useCallback, useEffect, useState } from "react";
import {
	createField,
	deleteField,
	getDirectoryById,
	upsertFieldValues,
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
	const [isEditing, setIsEditing] = useState(false);
	const [editedValues, setEditedValues] = useState<DirectoryValue[]>([]);
	const [editedNewRow, setEditedNewRow] = useState<Record<string, string>>(
		{}
	);
	const [isSaving, setIsSaving] = useState(false);

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

	const handleEdit = () => {
		setEditedValues([...values]);
		setEditedNewRow({ ...newRowValues });
		setIsEditing(true);
	};

	const handleCancel = () => {
		setIsEditing(false);
		setEditedValues([]);
		setEditedNewRow({});
	};

	const handleSave = async () => {
		if (!directory) return;

		try {
			setIsSaving(true);
			// Собираем все значения для сохранения
			const valuesToSave = [...editedValues];

			// Добавляем новую строку как новые значения
			for (const [fieldId, value] of Object.entries(editedNewRow)) {
				if (value.trim() !== "") {
					valuesToSave.push({
						fieldId,
						value,
					});
				}
			}

			await upsertFieldValues(valuesToSave);

			// Обновляем состояние
			setValues(valuesToSave);
			const emptyNewRow: Record<string, string> = {};
			directory.fields.forEach((field) => {
				emptyNewRow[field.id] = "";
			});
			setNewRowValues(emptyNewRow);

			toast.success("Изменения успешно сохранены");
			setIsEditing(false);
		} catch (error) {
			console.error("Ошибка при сохранении:", error);
			toast.error("Не удалось сохранить изменения");
		} finally {
			setIsSaving(false);
		}
	};

	const handleValueChange = (
		valueId: string | undefined,
		fieldId: string,
		newValue: string
	) => {
		if (!isEditing) return;

		const updatedValues = editedValues.map((v) => {
			// Для существующих значений (с ID) сравниваем по ID и fieldId
			if (valueId && v.id === valueId && v.fieldId === fieldId) {
				return { ...v, value: newValue };
			}
			// Для новых значений (без ID) сравниваем только по fieldId
			if (!valueId && !v.id && v.fieldId === fieldId) {
				return { ...v, value: newValue };
			}
			return v;
		});
		setEditedValues(updatedValues);
	};

	const handleNewRowChange = (fieldId: string, value: string) => {
		if (!isEditing) return;
		setEditedNewRow((prev) => ({ ...prev, [fieldId]: value }));
	};

	if (isLoading) {
		return <Loader2 className="mx-auto my-10 h-16 w-16 animate-spin" />;
	}

	if (!directory) {
		return <p>Выберите справочник для просмотра содержимого.</p>;
	}

	const currentValues = isEditing ? editedValues : values;
	const currentNewRow = isEditing ? editedNewRow : newRowValues;

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
				<div className="flex space-x-2">
					{!isEditing ? (
						<Button onClick={handleEdit}>Редактировать</Button>
					) : (
						<>
							<Button onClick={handleSave} disabled={isSaving}>
								{isSaving ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : null}
								Сохранить
							</Button>
							<Button
								variant="outline"
								onClick={handleCancel}
								disabled={isSaving}
							>
								Отмена
							</Button>
						</>
					)}
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
					{currentValues.map((value, index) => (
						<TableRow key={value.id || `row-${index}`}>
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
												disabled={!isEditing}
											/>
										</div>
									) : (
										""
									)}
								</TableCell>
							))}
						</TableRow>
					))}
					{isEditing && (
						<TableRow>
							{directory.fields.map((field) => (
								<TableCell key={field.id}>
									<div className="flex items-center">
										<Input
											type="text"
											value={
												currentNewRow[field.id] || ""
											}
											onChange={(e) =>
												handleNewRowChange(
													field.id,
													e.target.value
												)
											}
											placeholder="Новое значение"
										/>
									</div>
								</TableCell>
							))}
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
}
