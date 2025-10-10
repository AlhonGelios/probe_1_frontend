"use client";

import { Button } from "@/shared/ui/button";
import { Trash2, GripVertical } from "lucide-react";
import {
	DirectoryField,
	ReorderFieldsDto,
} from "../../model/edit-fields-types";
import { reorderFields } from "../../api/dictionaries-api";
import React, { useState, useCallback } from "react";

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
}

export function FieldList({
	fields,
	selectedField,
	onSelectField,
	onDeleteField,
	directoryId,
	onFieldsReorder,
}: FieldListProps) {
	const [draggedFieldId, setDraggedFieldId] = useState<string | null>(null);
	const [isReordering, setIsReordering] = useState(false);
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

	const handleDragStart = useCallback(
		(e: React.DragEvent<HTMLLIElement>, fieldId: string) => {
			setDraggedFieldId(fieldId);
			e.dataTransfer.effectAllowed = "move";
			e.dataTransfer.setData("text/html", e.currentTarget.outerHTML);
			e.currentTarget.style.opacity = "0.5";
		},
		[]
	);

	const handleDragEnd = useCallback((e: React.DragEvent<HTMLLIElement>) => {
		setDraggedFieldId(null);
		setDragOverIndex(null);
		e.currentTarget.style.opacity = "1";
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent<HTMLLIElement>) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	}, []);

	const handleDragLeave = useCallback(() => {
		setDragOverIndex(null);
	}, []);

	const handleDragEnter = useCallback(
		(e: React.DragEvent<HTMLLIElement>, index: number) => {
			// Получаем элемент, над которым происходит перетаскивание
			const rect = e.currentTarget.getBoundingClientRect();
			const midPoint = rect.top + rect.height / 2;

			// Определяем, будет ли вставка выше или ниже элемента
			const dropPosition = e.clientY < midPoint ? index : index + 1;
			setDragOverIndex(dropPosition);
		},
		[]
	);

	const handleDrop = useCallback(
		async (
			e: React.DragEvent<HTMLLIElement>,
			dropTargetFieldId?: string
		) => {
			e.preventDefault();
			e.stopPropagation();

			if (!draggedFieldId) {
				return;
			}

			// Используем dragOverIndex если он установлен, иначе используем целевой элемент
			let targetIndex = dragOverIndex;
			if (targetIndex === null && dropTargetFieldId) {
				targetIndex = fields.findIndex(
					(field) => field.id === dropTargetFieldId
				);
			}

			const draggedIndex = fields.findIndex(
				(field) => field.id === draggedFieldId
			);

			if (
				draggedIndex === -1 ||
				targetIndex === null ||
				targetIndex === -1
			) {
				return;
			}

			// Проверяем что перетаскивание не на тот же элемент или соседнюю позицию
			if (Math.abs(draggedIndex - targetIndex) <= 0) {
				return;
			}

			// Создаем новый порядок полей
			const newFields = [...fields];
			const [draggedField] = newFields.splice(draggedIndex, 1);
			newFields.splice(targetIndex, 0, draggedField);

			// Обновляем локальное состояние
			if (onFieldsReorder) {
				onFieldsReorder(newFields);
			}

			// Валидация данных перед отправкой на сервер
			const validationError = validateReorderData(newFields, directoryId);
			if (validationError) {
				console.error("Reorder validation failed:", validationError);
				alert(`Ошибка валидации данных: ${validationError}`);
				return;
			}

			// Сохраняем порядок на сервере
			setIsReordering(true);
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

				alert(errorMessage);
				console.error("Reorder error details:", error);

				// Восстанавливаем оригинальный порядок при ошибке
				if (onFieldsReorder) {
					onFieldsReorder(fields);
				}
			} finally {
				setIsReordering(false);
			}
		},
		[draggedFieldId, dragOverIndex, fields, onFieldsReorder, directoryId]
	);
	return (
		<div className="w-1/3 flex-shrink-0 h-[60vh] flex flex-col">
			<div className="flex items-center justify-between mb-2">
				<h3 className="font-semibold">Существующие поля</h3>
				{isReordering && (
					<div className="flex items-center text-sm text-blue-600">
						<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
						<span>Сохранение...</span>
					</div>
				)}
			</div>
			<ul className="space-y-2 overflow-y-auto flex-1">
				{/* Визуальный индикатор вставки в начало списка */}
				{dragOverIndex === 0 && (
					<div className="h-1 bg-blue-500 rounded mx-4 my-1 animate-pulse"></div>
				)}
				{[...fields]
					.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
					.map((field, index) => (
						<div key={field.id}>
							<li
								className={`${
									field.id === selectedField?.id
										? "bg-orange-100"
										: ""
								} ${
									draggedFieldId === field.id
										? "opacity-50 rotate-2 scale-105"
										: ""
								} flex items-center justify-between p-2 border rounded-md hover:bg-gray-100 mr-4 transition-all duration-200`}
								style={{
									transform:
										dragOverIndex !== null &&
										draggedFieldId !== field.id
											? `translateY(${
													// Элементы выше места вставки сдвигаются вверх
													index < dragOverIndex
														? "-16px"
														: // Элементы ниже места вставки сдвигаются вниз
														index >= dragOverIndex
														? "16px"
														: "0px"
											  })`
											: "translateY(0px)",
									cursor:
										field.isSystem || isReordering
											? "pointer"
											: "grab",
								}}
								onClick={() => onSelectField(field)}
								draggable={!field.isSystem && !isReordering}
								onDragStart={(e) =>
									handleDragStart(e, field.id)
								}
								onDragEnd={handleDragEnd}
								onDragOver={handleDragOver}
								onDragLeave={handleDragLeave}
								onDragEnter={(e) => handleDragEnter(e, index)}
								onDrop={(e) => handleDrop(e, field.id)}
							>
								<div className="flex items-center flex-1">
									{!field.isSystem && !isReordering && (
										<div title="Перетащить поле">
											<GripVertical className="h-4 w-4 text-gray-400 mr-2 cursor-grab active:cursor-grabbing" />
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
												field.isRequired && "Required",
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
									disabled={field.isSystem || isReordering}
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
							{/* Визуальный индикатор вставки между элементами */}
							{dragOverIndex === index + 1 && (
								<div className="h-1 bg-blue-500 rounded mx-4 my-1 animate-pulse"></div>
							)}
						</div>
					))}
				{/* Визуальный индикатор вставки для последней позиции */}
				{dragOverIndex === fields.length && (
					<div className="h-1 bg-blue-500 rounded mx-4 my-1 animate-pulse"></div>
				)}
			</ul>
		</div>
	);
}
