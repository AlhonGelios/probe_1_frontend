"use client";

import { useCallback, useEffect, useState, useContext } from "react";
import {
	getDirectoryById,
	deleteDirectory,
	useGetDirectoryFields,
} from "../api/dictionaries-api";
import { Directory } from "../model/types";
import { Loader2, MoreVertical, SquarePen, Trash, Plus } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
} from "@/shared/ui/dropdown-menu";
import { toast } from "sonner";
import { EditFieldsDialog } from "./edit-fields-dialog";
import { useRouter } from "next/navigation";
import { DeleteDirectoryDialog } from "./delete-directory-dialog";
import { DirectoriesContext } from "@/app/(core)/directories/layout";
import { CreateRecordDialog } from "./create-record-dialog";
import { Checkbox } from "@/shared/ui/checkbox";

interface DirectoryContentProps {
	directoryId: string;
}

// Функция для рендеринга значений полей в зависимости от типа
const renderFieldValue = (value: string | undefined, fieldType: string) => {
	if (!value) return "";

	switch (fieldType) {
		case "BOOLEAN":
			return (
				<Checkbox
					checked={value.toLowerCase() === "true"}
					disabled
					className="pointer-events-none"
				/>
			);
		case "DATE":
			try {
				const date = new Date(value);
				return isNaN(date.getTime())
					? value
					: date.toLocaleDateString("ru-RU");
			} catch {
				return value;
			}
		case "DATETIME":
			try {
				const dateTime = new Date(value);
				return isNaN(dateTime.getTime())
					? value
					: dateTime.toLocaleString("ru-RU", {
							year: "numeric",
							month: "2-digit",
							day: "2-digit",
							hour: "2-digit",
							minute: "2-digit",
					  });
			} catch {
				return value;
			}
		case "NUMBER":
			// Для чисел оставляем как есть, но можно добавить дополнительную обработку если нужно
			return value;
		case "STRING":
		default:
			return value;
	}
};

export default function DirectoryContent({
	directoryId,
}: DirectoryContentProps) {
	const [directory, setDirectory] = useState<Directory | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isFieldsDialogOpen, setIsFieldsDialogOpen] = useState(false);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const router = useRouter();
	const { setDictList } = useContext(DirectoriesContext);
	const {
		data: fields = [],
		isLoading: isFieldsLoading,
		refetch: refetchFields,
	} = useGetDirectoryFields(directoryId);

	// Локальное состояние для полей для отслеживания изменений порядка
	const [localFields, setLocalFields] = useState(fields);

	// Синхронизация локального состояния с серверными данными
	useEffect(() => {
		setLocalFields(fields);
	}, [fields]);

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

	const handleDeleteDirectory = async () => {
		if (!directory) return;
		setIsDeleting(true);
		try {
			await deleteDirectory(directory.id);
			toast.success("Справочник успешно удален");

			// Обновляем состояние справочников
			if (setDictList) {
				setDictList((prev) => {
					const newList = prev.filter((d) => d.id !== directory.id);
					return newList;
				});
			}

			router.push("/directories");
		} catch (error) {
			console.error("Error deleting directory:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Произошла неизвестная ошибка";
			toast.error(`Не удалось удалить справочник: ${errorMessage}`);
		} finally {
			setIsDeleting(false);
			setIsDeleteDialogOpen(false);
		}
	};

	if (isLoading) {
		return <Loader2 className="mx-auto my-10 h-16 w-16 animate-spin" />;
	}

	if (!directory) {
		return <p>Выберите справочник для просмотра содержимого.</p>;
	}

	return (
		<div className="bg-card -mx-4 p-6 border rounded-lg shadow-sm justify-self-stretch grow">
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
					<Button
						onClick={() => setIsCreateDialogOpen(true)}
						disabled={isFieldsLoading}
					>
						<Plus className="h-4 w-4 mr-2" />
						Добавить запись
					</Button>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="data-[state=open]:bg-accent"
							>
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem
								onSelect={() => setIsFieldsDialogOpen(true)}
							>
								<SquarePen className="h-8 w-8" />
								Редактировать поля
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-destructive"
								onSelect={() => setIsDeleteDialogOpen(true)}
							>
								<Trash className="h-8 w-8" color="red" />
								Удалить справочник
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<EditFieldsDialog
						directoryId={directoryId}
						open={isFieldsDialogOpen}
						onOpenChange={setIsFieldsDialogOpen}
						fields={fields}
						onRefetchFields={refetchFields}
						onFieldsChange={(updatedFields) => {
							// Обновляем локальное состояние полей при изменении порядка
							setLocalFields(updatedFields);
						}}
					/>
					<DeleteDirectoryDialog
						open={isDeleteDialogOpen}
						onOpenChange={setIsDeleteDialogOpen}
						onConfirm={handleDeleteDirectory}
						isDeleting={isDeleting}
					/>
					{isCreateDialogOpen && (
						<CreateRecordDialog
							directoryId={directoryId}
							fields={localFields}
							onClose={() => setIsCreateDialogOpen(false)}
							onRecordCreated={fetchDirectory}
						/>
					)}
				</div>
			</div>
			{/* Здесь используем localFields для отображения актуального порядка полей */}
			<Table>
				<TableHeader>
					<TableRow>
						{localFields.map((field) => (
							<TableHead key={field.id}>
								{field.displayName}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{directory.records.map((record, index) => (
						<TableRow key={record.id || `row-${index}`}>
							{localFields.map((field) => (
								<TableCell key={field.id}>
									{renderFieldValue(
										record.recordValue.find(
											(i) => i.fieldId === field.id
										)?.value,
										field.type
									)}
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
