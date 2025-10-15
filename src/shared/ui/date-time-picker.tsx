"use client";

import React, { useRef, useState } from "react";
import { format, parse, isValid, setHours, setMinutes } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, Clock, XCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Label } from "@/shared/ui/label";
import { cn } from "@/shared/lib/utils";
import { IMaskInput } from "react-imask";
import { DayPickerProps } from "react-day-picker";

/**
 * Конвертирует локальное время в серверное время с учетом часового пояса
 */
const convertToServerTime = (localDate: Date): Date => {
	try {
		// Если дата не валидна, возвращаем её как есть
		if (!isValid(localDate)) {
			return localDate;
		}

		// Получаем смещение для Europe/Moscow (UTC+3)
		const serverOffset = 3 * 60; // минуты

		// Создаем новую дату с серверным временем
		const serverDate = new Date(
			localDate.getTime() + serverOffset * 60 * 1000
		);

		console.log(
			`[DateTimePicker] Converted local time ${localDate.toISOString()} to server time ${serverDate.toISOString()}`
		);

		return serverDate;
	} catch (error) {
		console.error(
			"[DateTimePicker] Error converting to server time:",
			error
		);
		return localDate;
	}
};

/**
 * Конвертирует серверное время в локальное для отображения
 */
const convertFromServerTime = (serverDate: Date): Date => {
	try {
		if (!isValid(serverDate)) {
			return serverDate;
		}

		// Получаем смещение для Europe/Moscow (UTC+3)
		const serverOffset = 3 * 60; // минуты

		// Конвертируем серверное время в локальное
		const localDate = new Date(
			serverDate.getTime() - serverOffset * 60 * 1000
		);

		console.log(
			`[DateTimePicker] Converted server time ${serverDate.toISOString()} to local time ${localDate.toISOString()}`
		);

		return localDate;
	} catch (error) {
		console.error(
			"[DateTimePicker] Error converting from server time:",
			error
		);
		return serverDate;
	}
};

interface DateTimePickerProps {
	label?: string;
	value?: Date | null;
	onChange: (date: Date | null) => void;
	placeholder?: string;
	fromYear?: number;
	toYear?: number;
	disabled?: DayPickerProps["disabled"];
	showTimeSelect?: boolean;
	timeStep?: number; // Шаг в минутах для выбора времени
}

export function DateTimePicker({
	label,
	value,
	onChange,
	placeholder = "Выберите дату и время",
	fromYear = new Date().getFullYear(),
	toYear = new Date().getFullYear() + 5,
	disabled,
	showTimeSelect = true,
	timeStep = 15,
}: DateTimePickerProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);
	const [isTimeOpen, setIsTimeOpen] = useState(false);
	const [selectedTime, setSelectedTime] = useState<{
		hours: number;
		minutes: number;
	}>({
		hours: value ? value.getHours() : 0,
		minutes: value
			? Math.floor(value.getMinutes() / timeStep) * timeStep
			: 0,
	});

	// Отображаемое значение - конвертируем серверное время в локальное для отображения
	const displayValue = value ? convertFromServerTime(value) : null;

	const handleClear = () => {
		onChange(null);
		setSelectedTime({ hours: 0, minutes: 0 });
		if (inputRef.current) {
			inputRef.current.focus();
		}
	};

	const handleDateSelect = (date: Date | undefined) => {
		if (!date) return;

		console.log(
			`[DateTimePicker] Date selected from calendar: ${date.toISOString()}`
		);

		// Создаем новую дату с выбранной датой и текущим выбранным временем
		const dateTimeWithSelectedTime = setMinutes(
			setHours(date, selectedTime.hours),
			selectedTime.minutes
		);

		// Конвертируем в серверное время перед сохранением
		const serverDateTime = convertToServerTime(dateTimeWithSelectedTime);
		onChange(serverDateTime);
		setIsCalendarOpen(false);
	};

	const handleTimeSelect = (hours: number, minutes: number) => {
		setSelectedTime({ hours, minutes });

		if (displayValue) {
			// Создаем новую дату с текущей датой и новым временем
			const newDateTime = setMinutes(
				setHours(displayValue, hours),
				minutes
			);

			// Конвертируем в серверное время перед сохранением
			const serverDateTime = convertToServerTime(newDateTime);
			onChange(serverDateTime);
		}

		setIsTimeOpen(false);
	};

	const formatDateTimeForInput = (date: Date): string => {
		try {
			return format(date, "dd.MM.yyyy HH:mm", { locale: ru });
		} catch (error) {
			console.error(
				"[DateTimePicker] Error formatting date for input:",
				error
			);
			return "";
		}
	};

	const handleAccept = (textValue: string) => {
		// Парсим дату и время из маски dd.MM.yyyy HH:mm
		const parsedDate = parse(textValue, "dd.MM.yyyy HH:mm", new Date(), {
			locale: ru,
		});

		if (
			isValid(parsedDate) &&
			textValue.length === "dd.MM.yyyy HH:mm".length
		) {
			console.log(
				`[DateTimePicker] Valid datetime selected: ${parsedDate.toISOString()}`
			);

			// Конвертируем в серверное время перед сохранением
			const serverDateTime = convertToServerTime(parsedDate);
			onChange(serverDateTime);
			setSelectedTime({
				hours: parsedDate.getHours(),
				minutes: parsedDate.getMinutes(),
			});
		} else if (textValue) {
			console.error(
				`[DateTimePicker] Invalid datetime format: ${textValue}`
			);
		}
	};

	const inputValue = displayValue ? formatDateTimeForInput(displayValue) : "";

	const startMonth = new Date(fromYear, 0, 1);
	const endMonth = new Date(toYear, 11, 31);

	// Генерируем доступные часы (0-23)
	const availableHours = Array.from({ length: 24 }, (_, i) => i);

	// Генерируем доступные минуты на основе шага
	const availableMinutes = Array.from(
		{ length: 60 / timeStep },
		(_, i) => i * timeStep
	);

	return (
		<div className="flex flex-col">
			{label && <Label>{label}</Label>}
			<div className="relative flex items-center">
				<IMaskInput
					mask="dd.MM.yyyy HH:mm"
					blocks={{
						dd: { mask: "00" },
						MM: { mask: "00" },
						yyyy: { mask: "0000" },
						HH: { mask: "00" },
						mm: { mask: "00" },
					}}
					value={inputValue}
					onAccept={handleAccept}
					placeholder={placeholder}
					inputRef={inputRef}
					className={cn(
						"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-24"
					)}
				/>

				{displayValue && (
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={handleClear}
						className="absolute right-16 top-1/2 -translate-y-1/2 rounded-full w-6 h-6 p-0"
						aria-label="Очистить поле"
						tabIndex={-1}
					>
						<XCircle className="h-4 w-4 text-muted-foreground" />
					</Button>
				)}

				{showTimeSelect && (
					<Popover open={isTimeOpen} onOpenChange={setIsTimeOpen}>
						<PopoverTrigger asChild>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="absolute right-8 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
								aria-label="Выбрать время"
							>
								<Clock className="h-4 w-4 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-auto p-4" align="start">
							<div className="space-y-4">
								<div>
									<Label className="text-sm font-medium">
										Часы
									</Label>
									<div className="grid grid-cols-6 gap-2 mt-2">
										{availableHours.map((hour) => (
											<Button
												key={hour}
												type="button"
												variant={
													selectedTime.hours === hour
														? "default"
														: "outline"
												}
												size="sm"
												className="w-10 h-10 p-0"
												onClick={() =>
													handleTimeSelect(
														hour,
														selectedTime.minutes
													)
												}
											>
												{hour
													.toString()
													.padStart(2, "0")}
											</Button>
										))}
									</div>
								</div>
								<div>
									<Label className="text-sm font-medium">
										Минуты
									</Label>
									<div className="grid grid-cols-4 gap-2 mt-2">
										{availableMinutes.map((minute) => (
											<Button
												key={minute}
												type="button"
												variant={
													selectedTime.minutes ===
													minute
														? "default"
														: "outline"
												}
												size="sm"
												className="w-8 h-8 p-0"
												onClick={() =>
													handleTimeSelect(
														selectedTime.hours,
														minute
													)
												}
											>
												{minute
													.toString()
													.padStart(2, "0")}
											</Button>
										))}
									</div>
								</div>
							</div>
						</PopoverContent>
					</Popover>
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
							selected={displayValue ? displayValue : undefined}
							onSelect={handleDateSelect}
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
