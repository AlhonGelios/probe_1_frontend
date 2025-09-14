"use client";

import { useCallback, useEffect, useState } from "react";
import {
	createField,
	deleteField,
	getDirectoryById,
} from "../api/dictionaries-api";
import { Directory } from "../types";
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

interface DirectoryContentProps {
	directoryId: string;
}

export default function DirectoryContent({
	directoryId,
}: DirectoryContentProps) {
	const [directory, setDirectory] = useState<Directory | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isFieldsDialogOpen, setIsFieldsDialogOpen] = useState(false);

	const fetchDirectory = useCallback(async () => {
		try {
			const fetchedDirectory = await getDirectoryById(directoryId);
			setDirectory(fetchedDirectory);
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
				<div className="flex space-x-2">
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
					{directory.records.map((record, index) => (
						<TableRow key={record.id || `row-${index}`}>
							{directory.fields.map((field) => (
								<TableCell key={field.id}>
									{
										record.recordValue.find(
											(i) => i.fieldId === field.id
										)?.value
									}
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
