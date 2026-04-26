"use client";

import React, { useState, useEffect } from "react";
import { DatePicker } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import ruRU from "antd/locale/ru_RU";
import { ConfigProvider } from "antd";
import { IMaskInput } from "react-imask";
import { X } from "lucide-react";

// Инициализация плагинов dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

const DEFAULT_TIMEZONE = "Europe/Moscow";

// Тип для функции отключения дат
type DisabledDateFunc = (current: Dayjs) => boolean;

interface AntdDatePickerProps {
	label?: string;
	value?: Date | null;
	onChange: (date: Date | null) => void;
	placeholder?: string;
	disabled?: boolean;
	showTime?: boolean;
	format?: string;
	disabledDate?: DisabledDateFunc;
}

/**
 * Универсальный компонент выбора даты/времени на базе Ant Design с маской ввода.
 * Поддерживает таймзоны (по умолчанию Europe/Moscow).
 * Формат: dd.MM.yyyy HH:mm (с маской).
 */
export function AntdDatePicker({
	label,
	value,
	onChange,
	placeholder = "Выберите дату",
	disabled = false,
	showTime = false,
	format = showTime ? "DD.MM.YYYY HH:mm" : "DD.MM.YYYY",
	disabledDate,
}: AntdDatePickerProps) {
	const [inputValue, setInputValue] = useState<string>("");
	const [isPickerOpen, setIsPickerOpen] = useState(false);

	// Конвертируем Date (UTC) в dayjs с учётом таймзоны для отображения
	const dayjsValue = value ? dayjs(value).tz(DEFAULT_TIMEZONE) : null;

	// Обновляем значение инпута при изменении value извне
	useEffect(() => {
		if (dayjsValue && dayjsValue.isValid()) {
			setInputValue(
				dayjsValue.format(showTime ? "DD.MM.YYYY HH:mm" : "DD.MM.YYYY"),
			);
		} else {
			setInputValue("");
		}
	}, [value, showTime, dayjsValue]);

	const handleMaskAccept = (maskedValue: string) => {
		setInputValue(maskedValue);

		// Парсим значение маски
		const parseFormat = showTime ? "DD.MM.YYYY HH:mm" : "DD.MM.YYYY";
		const parsedDate = dayjs(maskedValue, parseFormat, true); // true для strict парсинга

		if (parsedDate.isValid()) {
			// Конвертируем выбранное локальное время обратно в UTC Date
			const utcDate = parsedDate.tz(DEFAULT_TIMEZONE).utc().toDate();
			onChange(utcDate);
		} else if (!maskedValue) {
			onChange(null);
		}
	};

	const handlePickerChange = (
		date: Dayjs | null,
		_dateString: string | null,
	) => {
		if (!date) {
			onChange(null);
			setInputValue("");
			return;
		}
		// Обновляем инпут и вызываем onChange
		const formatted = date.format(
			showTime ? "DD.MM.YYYY HH:mm" : "DD.MM.YYYY",
		);
		setInputValue(formatted);
		const utcDate = date.tz(DEFAULT_TIMEZONE).utc().toDate();
		onChange(utcDate);
		setIsPickerOpen(false);
	};

	const handleFocus = () => {
		if (!disabled) {
			setIsPickerOpen(true);
		}
	};

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation();
		onChange(null);
		setInputValue("");
		setIsPickerOpen(false);
	};

	// Маска для формата dd.MM.yyyy HH:mm (00.00.0000 00:00)
	const maskPattern = showTime ? "00.00.0000 00:00" : "00.00.0000";

	return (
		<ConfigProvider locale={ruRU}>
			<div className="flex flex-col gap-1">
				{label && (
					<label className="text-sm font-medium text-gray-700">
						{label}
					</label>
				)}
				<div className="relative">
					<IMaskInput
						mask={maskPattern}
						value={inputValue}
						onAccept={handleMaskAccept}
						onFocus={handleFocus}
						placeholder={placeholder}
						disabled={disabled}
						className="ant-picker ant-picker-input w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
						style={{ width: "100%" }}
					/>
					{inputValue && !disabled && (
						<button
							type="button"
							onClick={handleClear}
							style={{
								position: "absolute",
								right: "0.5rem",
								top: "50%",
								transform: "translateY(-50%)",
								zIndex: 10,
								background: "none",
								border: "none",
								cursor: "pointer",
								padding: 0,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
							aria-label="Очистить"
						>
							<X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
						</button>
					)}
					<DatePicker
						open={isPickerOpen}
						onOpenChange={setIsPickerOpen}
						value={dayjsValue}
						onChange={handlePickerChange}
						disabledDate={disabledDate}
						showTime={showTime ? { format: "HH:mm" } : undefined}
						format={format}
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							opacity: 0,
							width: 0,
							height: 0,
							overflow: "hidden",
							pointerEvents: "none",
						}}
						getPopupContainer={(trigger) => trigger.parentElement!}
					/>
				</div>
			</div>
		</ConfigProvider>
	);
}

/**
 * Компонент для react-hook-form (Controller)
 */
interface AntdDatePickerFieldProps extends AntdDatePickerProps {
	field: {
		value: Date | null;
		onChange: (date: Date | null) => void;
		onBlur: () => void;
	};
	description?: string;
}

export function AntdDatePickerField({
	field,
	label,
	placeholder,
	disabled,
	showTime,
	format,
	description,
	disabledDate,
}: AntdDatePickerFieldProps) {
	return (
		<div className="flex flex-col gap-1">
			{label && (
				<label className="text-sm font-medium text-gray-700">
					{label}
				</label>
			)}
			<AntdDatePicker
				value={field.value}
				onChange={field.onChange}
				placeholder={placeholder}
				disabled={disabled}
				showTime={showTime}
				format={format}
				disabledDate={disabledDate}
			/>
			{description && (
				<p className="text-xs text-gray-500">{description}</p>
			)}
		</div>
	);
}
