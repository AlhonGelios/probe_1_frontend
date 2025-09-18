"use client";

import React, { useRef, useState } from "react";
import { format, parse, isValid } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, XCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Label } from "@/shared/ui/label";
import { cn } from "@/shared/lib/utils";
import { IMaskInput } from "react-imask";
import { DayPickerProps } from "react-day-picker";

const isDateInstance = (value: unknown): value is Date => value instanceof Date;

interface SimpleDatePickerProps {
	label?: string; // Make label optional
	value?: Date | null;
	onChange: (date: Date | null) => void;
	placeholder?: string;
	fromYear?: number;
	toYear?: number;
	disabled?: DayPickerProps["disabled"];
}

export function SimpleDatePicker({
	label,
	value,
	onChange,
	placeholder = "Выберите дату",
	fromYear = new Date().getFullYear(),
	toYear = new Date().getFullYear() + 5,
	disabled,
}: SimpleDatePickerProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);

	const handleClear = () => {
		onChange(null);
		if (inputRef.current) {
			inputRef.current.focus();
		}
	};

	const handleAccept = (textValue: string) => {
		const parsedDate = parse(textValue, "dd.MM.yyyy", new Date(), {
			locale: ru,
		});

		if (isValid(parsedDate) && textValue.length === "dd.MM.yyyy".length) {
			console.log(
				`[SimpleDatePicker] Valid date selected: ${parsedDate.toISOString()}`
			);
			onChange(parsedDate);
		} else if (textValue) {
			console.error(
				`[SimpleDatePicker] Invalid date format: ${textValue}`
			);
		}
	};

	const inputValue = isDateInstance(value)
		? format(value, "dd.MM.yyyy", { locale: ru })
		: "";

	const startMonth = new Date(fromYear, 0, 1);
	const endMonth = new Date(toYear, 11, 31);

	return (
		<div className="flex flex-col">
			{label && <Label>{label}</Label>}
			<div className="relative flex items-center">
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
					inputRef={inputRef}
					className={cn(
						"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-16"
					)}
				/>

				{value && (
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
							selected={isDateInstance(value) ? value : undefined}
							onSelect={(date) => {
								if (!date) return;
								console.log(
									`[SimpleDatePicker] Date selected from calendar: ${date.toISOString()}`
								);
								onChange(date);
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
		</div>
	);
}
