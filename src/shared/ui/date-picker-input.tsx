"use client";

import React, { useRef, useState } from "react";
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
import { IMaskInput } from "react-imask";
import { ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";
import { DayPickerProps } from "react-day-picker";

const isDateInstance = (value: unknown): value is Date => value instanceof Date;

interface DatePickerInputProps<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>
> {
	field: ControllerRenderProps<TFieldValues, TName>;
	label: string;
	placeholder: string;
	description?: string;
	fromYear?: number;
	toYear?: number;
	disabled?: DayPickerProps["disabled"];
}

export function DatePickerInput<
	TFieldValues extends FieldValues,
	TName extends FieldPath<TFieldValues>
>({
	field,
	label,
	placeholder,
	description,
	fromYear = new Date().getFullYear(),
	toYear = new Date().getFullYear() + 5,
	disabled,
}: DatePickerInputProps<TFieldValues, TName>) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);

	const handleClear = () => {
		field.onChange(null);

		if (inputRef.current) {
			inputRef.current.focus();
		}
	};

	const handleAccept = (value: string) => {
		const parsedDate = parse(value, "dd.MM.yyyy", new Date(), {
			locale: ru,
		});

		if (isValid(parsedDate) && value.length === "dd.MM.yyyy".length) {
			field.onChange(parsedDate);
		} else {
			field.onChange(value);
		}
	};

	const inputValue = isDateInstance(field.value)
		? format(field.value, "dd.MM.yyyy", { locale: ru })
		: field.value || "";

	const startMonth = new Date(fromYear, 0, 1);
	const endMonth = new Date(toYear, 11, 31);

	return (
		<FormItem className="flex flex-col">
			<FormLabel>{label}</FormLabel>
			<div className="relative flex items-center">
				<FormControl>
					<IMaskInput
						mask="dd.MM.yyyy"
						blocks={{
							dd: { mask: "00" },
							MM: { mask: "00" },
							yyyy: { mask: "0000" },
						}}
						value={inputValue}
						onAccept={handleAccept}
						placeholder={placeholder}
						inputRef={(el: HTMLInputElement) => {
							if (typeof field.ref === "function") {
								field.ref(el);
							} else if (field.ref) {
								(
									field.ref as React.RefObject<HTMLInputElement | null>
								).current = el;
							}
							inputRef.current = el;
						}}
						className={cn(
							"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-16"
						)}
					/>
				</FormControl>

				{field.value && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={handleClear}
						className="absolute right-8 top-1/2 -translate-y-1/2 rounded-full w-6 h-6 p-0"
						aria-label="Очистить поле"
						tabIndex={-1}
					>
						<XCircle className="h-4 w-4 text-muted-foreground" />
					</Button>
				)}

				<Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
					<PopoverTrigger asChild>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
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
								isDateInstance(field.value)
									? field.value
									: undefined
							}
							onSelect={(date) => {
								if (!date) return;
								const hours = isDateInstance(field.value)
									? field.value.getHours()
									: 0;
								const minutes = isDateInstance(field.value)
									? field.value.getMinutes()
									: 0;
								const updatedDate = new Date(date);
								updatedDate.setHours(hours);
								updatedDate.setMinutes(minutes);
								field.onChange(updatedDate);
								setIsCalendarOpen(false);
							}}
							disabled={disabled}
							autoFocus
							captionLayout="dropdown"
							startMonth={startMonth}
							endMonth={endMonth}
						/>
					</PopoverContent>
				</Popover>
			</div>

			{description && <FormDescription>{description}</FormDescription>}
			<FormMessage />
		</FormItem>
	);
}
