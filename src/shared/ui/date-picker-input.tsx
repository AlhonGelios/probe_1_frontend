// src/shared/components/DatePickerInput.tsx
"use client";

import React from "react";
import { format, parse, isValid } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, XCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import {
	FormControl,
	FormDescription,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/ui/form";
import { cn } from "@/shared/lib/utils";
import { IMaskInput } from "react-imask"; // <--- Импортируем IMaskInput
import { ControllerRenderProps } from "react-hook-form";

interface DatePickerInputProps {
	field: ControllerRenderProps<any, string>; // Тип FieldRenderProps из react-hook-form
	label: string;
	placeholder: string;
	description?: string;
	fromYear?: number;
	toYear?: number;
}

export function DatePickerInput({
	field,
	label,
	placeholder,
	description,
	fromYear = new Date().getFullYear() - 100,
	toYear = new Date().getFullYear() + 10,
}: DatePickerInputProps) {
	const handleClear = () => {
		field.onChange(null);
	};

	// IMaskInput работает по-другому, он сам управляет value и маской.
	// Мы будем слушать onAccept для получения отформатированного значения
	const handleAccept = (value: string) => {
		// value уже будет отформатированной строкой или пустой строкой
		const parsedDate = parse(value, "dd.MM.yyyy", new Date(), {
			locale: ru,
		});

		if (isValid(parsedDate) && value.length === "dd.MM.yyyy".length) {
			field.onChange(parsedDate);
		} else {
			field.onChange(value); // Передаем как есть, если неполно или невалидно
		}
	};

	// Значение для IMaskInput. IMaskInput ожидает строку,
	// но он также хорошо работает с начальными значениями.
	const inputValue =
		field.value instanceof Date
			? format(field.value, "dd.MM.yyyy", { locale: ru })
			: field.value || "";

	return (
		<FormItem className="flex flex-col">
			<FormLabel>{label}</FormLabel>
			<div className="relative flex items-center">
				<FormControl>
					<IMaskInput
						mask="dd.MM.yyyy" // Маска
						blocks={{
							dd: { mask: "00" },
							MM: { mask: "00" },
							yyyy: { mask: "0000" },
						}}
						value={inputValue}
						onAccept={handleAccept} // Используем onAccept для получения значения
						placeholder={placeholder}
						className={cn(
							"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-16"
						)}
					/>
				</FormControl>

				<Popover>
					<PopoverTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="absolute right-8 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
							aria-label="Выбрать дату"
						>
							<CalendarIcon className="h-4 w-4 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0" align="start">
						<Calendar
							locale={ru}
							mode="single"
							selected={
								field.value instanceof Date
									? field.value
									: undefined
							}
							onSelect={(date) => field.onChange(date)}
							initialFocus
							captionLayout="dropdown-years"
							fromYear={fromYear}
							toYear={toYear}
						/>
					</PopoverContent>
				</Popover>

				{field.value && (
					<Button
						variant="ghost"
						size="sm"
						onClick={handleClear}
						className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full w-6 h-6 p-0 mr-1"
						aria-label="Очистить поле"
					>
						<XCircle className="h-4 w-4 text-muted-foreground" />
					</Button>
				)}
			</div>

			{description && <FormDescription>{description}</FormDescription>}
			<FormMessage />
		</FormItem>
	);
}
