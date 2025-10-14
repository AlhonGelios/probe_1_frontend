"use client";

import { Button } from "@/shared/ui/button";
import { Trash2, GripVertical } from "lucide-react";
import {
	DirectoryField,
	ReorderFieldsDto,
} from "../../model/edit-fields-types";
import { reorderFields } from "../../api/dictionaries-api";
import React, { useState, useCallback, useRef, useEffect } from "react";
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

// Улучшенная функция валидации данных перед переупорядочиванием
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

	// Проверяем корректность sortOrder значений
	const invalidSortOrders = fields.filter(
		(field) => typeof field.sortOrder !== "number" || field.sortOrder < 0
	);
	if (invalidSortOrders.length > 0) {
		return `Найдены поля с некорректными значениями sortOrder: ${invalidSortOrders
			.map((f) => f.displayName || f.name)
			.join(", ")}`;
	}

	return null; // Валидация прошла успешно
}

// Хук для дебаунсинга операций сортировки
function useDebounce<T extends (...args: never[]) => void>(
	callback: T,
	delay: number
): T {
	const callbackRef = useRef(callback);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	return useCallback(
		((...args: Parameters<T>) => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			timeoutRef.current = setTimeout(() => {
				callbackRef.current(...args);
			}, delay);
		}) as T,
		[delay]
	);
}

// Хук для управления состоянием сортировки с защитой от race conditions
function useReorderState() {
	const [isReordering, setIsReordering] = useState(false);
	const [operationId, setOperationId] = useState<string | null>(null);
	const operationRef = useRef<string | null>(null);

	const startOperation = useCallback(() => {
		// Проверяем, не выполняется ли уже операция
		if (isReordering && operationRef.current) {
			console.warn(
				"Reorder already in progress, ignoring duplicate request"
			);
			return null;
		}

		const newOperationId = `reorder-${Date.now()}-${Math.random()
			.toString(36)
			.substr(2, 9)}`;

		setIsReordering(true);
		setOperationId(newOperationId);
		operationRef.current = newOperationId;

		return newOperationId;
	}, [isReordering]);

	const endOperation = useCallback((targetOperationId: string) => {
		// Проверяем, что завершаем актуальную операцию
		if (operationRef.current === targetOperationId) {
			setIsReordering(false);
			setOperationId(null);
			operationRef.current = null;
		}
	}, []);

	const isCurrentOperation = useCallback((targetOperationId: string) => {
		return operationRef.current === targetOperationId;
	}, []);

	return {
		isReordering,
		operationId,
		startOperation,
		endOperation,
		isCurrentOperation,
	};
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
	const reorderState = useReorderState();

	// Дебаунсинг для предотвращения множественных быстрых операций сортировки
	const debouncedReorder = useDebounce(
		useCallback(
			async (operationId: string, newFields: DirectoryField[]) => {
				if (!reorderState.isCurrentOperation(operationId)) {
					console.warn("Operation was superseded by newer reorder");
					return;
				}

				try {
					const reorderData: ReorderFieldsDto[] = newFields.map(
						(field) => ({
							id: field.id,
							sortOrder: field.sortOrder, // Используем сохраненные sortOrder значения
						})
					);

					const updatedFields = await reorderFields(
						directoryId,
						reorderData
					);

					// Проверяем актуальность операции
					if (!reorderState.isCurrentOperation(operationId)) {
						console.warn(
							"Operation was superseded by newer reorder, ignoring response"
						);
						return;
					}

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

					// Восстанавливаем оригинальный порядок только для актуальной операции
					if (reorderState.isCurrentOperation(operationId)) {
						const originalFields = fields;
						if (onFieldsReorder) {
							onFieldsReorder(originalFields);
						}
						if (onFieldsError) {
							onFieldsError(originalFields);
						}
					}
				} finally {
					reorderState.endOperation(operationId);
					if (onSaveEnd) {
						onSaveEnd(operationId);
					}
				}
			},
			[
				fields,
				directoryId,
				onFieldsReorder,
				onFieldsError,
				onSaveEnd,
				reorderState,
			]
		),
		300 // 500ms дебаунсинг
	);

	// Функция пересчета sortOrder для корректной сортировки
	const recalculateSortOrders = useCallback((fields: DirectoryField[]) => {
		return fields.map((field, index) => ({
			...field,
			sortOrder: index, // Используем индекс как sortOrder для корректного порядка
		}));
	}, []);

	const handleSortEnd = useCallback(
		async (oldIndex: number, newIndex: number) => {
			// Предотвращаем повторные операции во время активной сортировки
			if (reorderState.isReordering) {
				console.warn(
					"Reorder already in progress, ignoring duplicate request"
				);
				return;
			}

			// Проверяем, действительно ли произошли изменения
			if (oldIndex === newIndex) {
				return;
			}

			// Создаем новый порядок полей оптимистично с пересчетом sortOrder
			const newFields = [...fields];
			const [movedField] = newFields.splice(oldIndex, 1);
			newFields.splice(newIndex, 0, movedField);

			// Пересчитываем sortOrder для всех полей
			const fieldsWithNewSortOrder = recalculateSortOrders(newFields);

			// Валидация данных перед отправкой на сервер
			const validationError = validateReorderData(
				fieldsWithNewSortOrder,
				directoryId
			);
			if (validationError) {
				console.error("Reorder validation failed:", validationError);
				toast.error(`Ошибка валидации данных: ${validationError}`);
				return;
			}

			// Обновляем локальное состояние сразу для лучшего UX
			if (onFieldsReorder) {
				onFieldsReorder(fieldsWithNewSortOrder);
			}

			// Запускаем дебаунсированную операцию сохранения
			const currentOperationId = reorderState.startOperation();
			if (!currentOperationId) {
				return; // Операция уже выполняется
			}

			if (onSaveStart) {
				onSaveStart(currentOperationId);
			}

			// Вызываем дебаунсированную функцию сохранения
			await debouncedReorder(currentOperationId, fieldsWithNewSortOrder);
		},
		[
			fields,
			directoryId,
			onFieldsReorder,
			onSaveStart,
			reorderState,
			debouncedReorder,
			recalculateSortOrders,
		]
	);
	return (
		<div className="w-1/3 flex-shrink-0 h-[60vh] flex flex-col">
			<style>{sortStyles}</style>
			<div className="flex items-center justify-between mb-2">
				<h3 className="font-semibold">Существующие поля</h3>
				{reorderState.isReordering && (
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
				{fields.map((field) => (
					<SortableItem key={`field-${field.id}`}>
						<div className="relative group">
							<li
								className={`${
									field.id === selectedField?.id
										? "bg-orange-100"
										: ""
								} flex items-center justify-between p-3 border rounded-md hover:bg-gray-100 mr-4 transition-all duration-200 relative`}
								style={{
									cursor: field.isSystem
										? "pointer"
										: reorderState.isReordering
										? "not-allowed"
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
									if (
										field.isSystem ||
										reorderState.isReordering
									) {
										e.preventDefault();
										return false;
									}
								}}
							>
								<div className="flex items-center flex-1">
									{!field.isSystem && (
										<div
											title={
												reorderState.isReordering
													? "Перетаскивание заблокировано во время сохранения"
													: "Перетащить поле"
											}
											className={`p-1 rounded transition-colors select-none mr-2 ${
												reorderState.isReordering
													? "opacity-50 cursor-not-allowed"
													: "hover:bg-gray-200 cursor-grab active:cursor-grabbing"
											}`}
											style={{
												userSelect: "none",
												WebkitUserSelect: "none",
											}}
											onClick={(e) => e.stopPropagation()}
										>
											<GripVertical
												className={`h-5 w-5 ${
													reorderState.isReordering
														? "text-gray-300"
														: "text-gray-400"
												}`}
											/>
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
									disabled={
										field.isSystem ||
										reorderState.isReordering
									}
									className="hover:bg-gray-300"
									title={
										field.isSystem
											? "Системное поле нельзя удалить"
											: reorderState.isReordering
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
