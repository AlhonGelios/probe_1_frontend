"use client";

import { Button } from "@/shared/ui/button";
import { Trash2, GripVertical } from "lucide-react";
import {
	DirectoryField,
	ReorderFieldsDto,
} from "../../model/edit-fields-types";
import { reorderFields } from "../../api/dictionaries-api";
import React, { useState, useCallback } from "react";
import SortableList, { SortableItem } from "react-easy-sort";
import { toast } from "sonner";

// Стили для корректной работы перетаскивания
const sortStyles = `
.react-easy-sort-item {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.react-easy-sort-item.dragged {
  z-index: 9999 !important;
  pointer-events: none;
  transform: rotate(2deg) scale(1.05) !important;
  opacity: 0.8 !important;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
}

.react-easy-sort-ghost {
  opacity: 0.4 !important;
  transform: rotate(2deg) !important;
}
`;

// Функция валидации данных перед переупорядочиванием
function validateReorderData(
	fields: DirectoryField[],
	directoryId: string
): string | null {
	// Проверяем что массив полей не пустой
	if (!fields || fields.length === 0) {
		return "Массив полей пуст";
	}

	// Проверяем что directoryId корректный
	if (!directoryId || typeof directoryId !== "string") {
		return "Некорректный ID справочника";
	}

	// Проверяем что все поля имеют корректные ID
	const invalidFields = fields.filter(
		(field) => !field.id || typeof field.id !== "string"
	);
	if (invalidFields.length > 0) {
		return `Найдены поля с некорректными ID: ${invalidFields
			.map((f) => f.displayName || f.name)
			.join(", ")}`;
	}

	// Проверяем на дублирование ID
	const ids = fields.map((field) => field.id);
	const uniqueIds = new Set(ids);
	if (uniqueIds.size !== ids.length) {
		return "Обнаружены дублирующиеся ID полей";
	}

	// Проверяем что все поля принадлежат одному справочнику
	const fieldDirectories = new Set(fields.map((field) => field.directoryId));
	if (fieldDirectories.size > 1) {
		return "Поля принадлежат разным справочникам";
	}

	// Проверяем что поля принадлежат текущему справочнику
	const currentDirectoryId = fields[0]?.directoryId;
	if (currentDirectoryId !== directoryId) {
		return `Поля не принадлежат справочнику ${directoryId}`;
	}

	return null; // Валидация прошла успешно
}

interface FieldListProps {
	fields: DirectoryField[];
	selectedField: DirectoryField | null;
	onSelectField: (field: DirectoryField) => void;
	onDeleteField: (fieldId: string) => void;
	directoryId: string;
	onFieldsReorder?: (fields: DirectoryField[]) => void;
	onFieldsError?: (fields: DirectoryField[]) => void;
	isSaving?: boolean;
	onSaveStart?: (operationId: string) => void;
	onSaveEnd?: (operationId: string) => void;
}

export function FieldList({
	fields,
	selectedField,
	onSelectField,
	onDeleteField,
	directoryId,
	onFieldsReorder,
	onFieldsError,
	onSaveStart,
	onSaveEnd,
}: FieldListProps) {
	const [isReordering, setIsReordering] = useState(false);

	const handleSortEnd = useCallback(
		async (oldIndex: number, newIndex: number) => {
			// Сохраняем оригинальный порядок для возможного восстановления
			const originalFields = [...fields];

			// Создаем новый порядок полей оптимистично
			const newFields = [...fields];
			const [movedField] = newFields.splice(oldIndex, 1);
			newFields.splice(newIndex, 0, movedField);

			// Обновляем локальное состояние сразу для лучшего UX
			if (onFieldsReorder) {
				onFieldsReorder(newFields);
			}

			// Валидация данных перед отправкой на сервер
			const validationError = validateReorderData(newFields, directoryId);
			if (validationError) {
				console.error("Reorder validation failed:", validationError);
				toast.error(`Ошибка валидации данных: ${validationError}`);
				// Восстанавливаем оригинальный порядок при ошибке валидации
				if (onFieldsReorder) {
					onFieldsReorder(originalFields);
				}
				if (onFieldsError) {
					onFieldsError(originalFields);
				}
				return;
			}

			// Сохраняем порядок на сервере
			setIsReordering(true);
			const operationId = `reorder-${Date.now()}`;
			if (onSaveStart) {
				onSaveStart(operationId);
			}

			try {
				const reorderData: ReorderFieldsDto[] = newFields.map(
					(field, index) => ({
						id: field.id,
						sortOrder: index,
					})
				);

				const updatedFields = await reorderFields(
					directoryId,
					reorderData
				);

				// Показываем успешное сообщение только при успешном сохранении
				toast.success("Порядок полей успешно сохранен");

				// Обновляем локальное состояние с данными от сервера
				if (onFieldsReorder && updatedFields) {
					onFieldsReorder(updatedFields);
				}
			} catch (error) {
				console.error("Failed to reorder fields:", error);

				// Определяем тип ошибки и показываем соответствующее сообщение
				let errorMessage = "Не удалось сохранить порядок полей";

				if (error instanceof Error) {
					if (error.message.includes("Invalid fields data")) {
						errorMessage =
							"Некорректные данные полей для переупорядочивания";
					} else if (error.message.includes("not found")) {
						errorMessage =
							"Некоторые поля не найдены в базе данных";
					} else if (error.message.includes("Field with ID")) {
						errorMessage =
							"Ошибка валидации полей. Попробуйте обновить страницу";
					} else if (error.message) {
						errorMessage = `Ошибка сервера: ${error.message}`;
					}
				}

				toast.error(errorMessage);
				console.error("Reorder error details:", error);

				// Восстанавливаем оригинальный порядок при ошибке
				if (onFieldsReorder) {
					onFieldsReorder(originalFields);
				}
				// Уведомляем о восстановлении состояния при ошибке
				if (onFieldsError) {
					onFieldsError(originalFields);
				}
			} finally {
				setIsReordering(false);
				if (onSaveEnd) {
					onSaveEnd(operationId);
				}
			}
		},
		[
			fields,
			onFieldsReorder,
			onFieldsError,
			onSaveEnd,
			onSaveStart,
			directoryId,
		]
	);
	return (
		<div className="w-1/3 flex-shrink-0 h-[60vh] flex flex-col">
			<style>{sortStyles}</style>
			<div className="flex items-center justify-between mb-2">
				<h3 className="font-semibold">Существующие поля</h3>
				{isReordering && (
					<div className="flex items-center text-sm text-blue-600">
						<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
						<span>Сохранение...</span>
					</div>
				)}
			</div>
			<SortableList
				onSortEnd={handleSortEnd}
				className="list space-y-2 overflow-y-auto flex-1"
				draggedItemClassName="opacity-80 rotate-2 scale-105 z-50 shadow-lg"
			>
				{[...fields]
					.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
					.map((field, _index) => (
						<SortableItem key={field.id}>
							<div className="relative group">
								<li
									className={`${
										field.id === selectedField?.id
											? "bg-orange-100"
											: ""
									} flex items-center justify-between p-3 border rounded-md hover:bg-gray-100 mr-4 transition-all duration-200 relative`}
									style={{
										cursor:
											field.isSystem || isReordering
												? "pointer"
												: "grab",
										userSelect: "none",
										WebkitUserSelect: "none",
									}}
									onClick={(e) => {
										// Предотвращаем клик по кнопке удаления
										if (
											(e.target as HTMLElement).closest(
												"button"
											)
										) {
											return;
										}
										onSelectField(field);
									}}
									onDragStart={(e) => {
										// Блокируем перетаскивание во время сохранения или для системных полей
										if (field.isSystem || isReordering) {
											e.preventDefault();
											return false;
										}
									}}
								>
									<div className="flex items-center flex-1">
										{!field.isSystem && !isReordering && (
											<div
												title="Перетащить поле"
												className="p-1 hover:bg-gray-200 rounded cursor-grab active:cursor-grabbing transition-colors select-none"
												style={{
													userSelect: "none",
													WebkitUserSelect: "none",
												}}
												onClick={(e) =>
													e.stopPropagation()
												}
											>
												<GripVertical className="h-5 w-5 text-gray-400" />
											</div>
										)}
										<div className="flex flex-col flex-1">
											<span
												className="truncate font-medium"
												title={field.displayName}
											>
												{field.displayName}
											</span>
											<span className="text-xs text-muted-foreground">
												{field.name} (
												{[
													field.type,
													field.isRequired &&
														"Required",
													field.isUnique && "Unique",
													field.defaultValue &&
														"DefaultValue",
												]
													.filter(Boolean)
													.join(", ")}
												)
											</span>
										</div>
									</div>
									<Button
										variant="ghost"
										size="icon"
										onClick={(e) => {
											e.stopPropagation();
											onDeleteField(field.id);
										}}
										disabled={
											field.isSystem || isReordering
										}
										className="hover:bg-gray-300"
										title={
											field.isSystem
												? "Системное поле нельзя удалить"
												: isReordering
												? "Нельзя удалить во время сохранения"
												: "Удалить поле"
										}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</li>
							</div>
						</SortableItem>
					))}
			</SortableList>
		</div>
	);
}
