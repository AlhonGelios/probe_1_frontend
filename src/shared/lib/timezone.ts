import { toZonedTime, fromZonedTime, formatInTimeZone } from "date-fns-tz";
import { ru } from "date-fns/locale";

/**
 * Конфигурация часового пояса по умолчанию для приложения
 */
export const DEFAULT_TIMEZONE = "Europe/Moscow";

/**
 * Конвертирует локальное время в время указанного часового пояса
 * @param localDate - Дата в локальном часовом поясе браузера
 * @param timezone - Целевой часовой пояс (по умолчанию Europe/Moscow)
 * @returns Дата в указанном часовом поясе (в UTC)
 */
export function convertToTimezone(
	localDate: Date,
	timezone: string = DEFAULT_TIMEZONE,
): Date {
	// toZonedTime принимает дату в UTC и часовой пояс, возвращает дату в указанном часовом поясе
	// Но нам нужно наоборот: из локального времени в UTC для указанного часового пояса
	// Поэтому используем fromZonedTime для обратного преобразования
	return fromZonedTime(localDate, timezone);
}

/**
 * Конвертирует время из указанного часового пояса в локальное время браузера
 * @param timezoneDate - Дата в указанном часовом поясе (в UTC)
 * @param timezone - Исходный часовой пояс (по умолчанию Europe/Moscow)
 * @returns Дата в локальном часовом поясе браузера
 */
export function convertFromTimezone(
	timezoneDate: Date,
	timezone: string = DEFAULT_TIMEZONE,
): Date {
	// toZonedTime принимает дату в UTC и часовой пояс, возвращает дату в указанном часовом поясе
	return toZonedTime(timezoneDate, timezone);
}

/**
 * Форматирует дату для отображения в UI с учетом часового пояса
 * @param date - Дата для форматирования (в UTC)
 * @param timezone - Часовой пояс для отображения (по умолчанию локальный браузера)
 * @param formatStr - Строка формата (по умолчанию dd.MM.yyyy)
 * @returns Отформатированная строка даты
 */
export function formatDateForDisplay(
	date: Date,
	timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone,
	formatStr: string = "dd.MM.yyyy",
): string {
	return formatInTimeZone(date, timezone, formatStr, {
		locale: ru,
	});
}

/**
 * Парсит строку даты в объект Date с учетом часового пояса
 * @param dateStr - Строка даты в формате dd.MM.yyyy
 * @param timezone - Часовой пояс, в котором интерпретировать строку (по умолчанию Europe/Moscow)
 * @param formatStr - Строка формата входных данных (по умолчанию dd.MM.yyyy)
 * @returns Объект Date в UTC времени
 */
export function parseDateFromInput(
	dateStr: string,
	timezone: string = DEFAULT_TIMEZONE,
	formatStr: string = "dd.MM.yyyy",
): Date | null {
	if (!dateStr || dateStr.length !== formatStr.length) {
		return null;
	}

	try {
		// Парсим строку как локальную дату в указанном часовом поясе
		// Сначала создаем дату из строки в локальном времени (без учета часового пояса)
		const parts = dateStr.split(".");
		if (parts.length !== 3) return null;

		const day = parseInt(parts[0], 10);
		const month = parseInt(parts[1], 10) - 1; // Месяцы в JS начинаются с 0
		const year = parseInt(parts[2], 10);

		// Создаем дату в локальном времени
		const naiveDate = new Date(year, month, day);
		// Проверяем, что дата корректна
		if (isNaN(naiveDate.getTime())) return null;

		// Конвертируем из указанного часового пояса в UTC
		return toZonedTime(naiveDate, timezone);
	} catch (error) {
		console.error("[Timezone] Error parsing date from input:", error);
		return null;
	}
}

/**
 * Форматирует дату и время для отображения в UI с учетом часового пояса
 * @param date - Дата для форматирования (в UTC)
 * @param timezone - Часовой пояс для отображения (по умолчанию локальный браузера)
 * @param formatStr - Строка формата (по умолчанию dd.MM.yyyy HH:mm)
 * @returns Отформатированная строка даты и времени
 */
export function formatDateTimeForDisplay(
	date: Date,
	timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone,
	formatStr: string = "dd.MM.yyyy HH:mm",
): string {
	return formatInTimeZone(date, timezone, formatStr, {
		locale: ru,
	});
}

/**
 * Парсит строку даты и времени в объект Date с учетом часового пояса
 * @param dateTimeStr - Строка даты и времени в формате dd.MM.yyyy HH:mm
 * @param timezone - Часовой пояс, в котором интерпретировать строку (по умолчанию Europe/Moscow)
 * @param formatStr - Строка формата входных данных (по умолчанию dd.MM.yyyy HH:mm)
 * @returns Объект Date в UTC времени
 */
export function parseDateTimeFromInput(
	dateTimeStr: string,
	timezone: string = DEFAULT_TIMEZONE,
	formatStr: string = "dd.MM.yyyy HH:mm",
): Date | null {
	if (!dateTimeStr || dateTimeStr.length !== formatStr.length) {
		return null;
	}

	try {
		// Парсим строку как локальную дату и время в указанном часовом поясе
		const [datePart, timePart] = dateTimeStr.split(" ");
		if (!datePart || !timePart) return null;

		const dateParts = datePart.split(".");
		if (dateParts.length !== 3) return null;

		const timeParts = timePart.split(":");
		if (timeParts.length < 2) return null; // Минимум часы и минуты

		const day = parseInt(dateParts[0], 10);
		const month = parseInt(dateParts[1], 10) - 1; // Месяцы в JS начинаются с 0
		const year = parseInt(dateParts[2], 10);
		const hours = parseInt(timeParts[0], 10);
		const minutes = parseInt(timeParts[1], 10);

		// Создаем дату в локальном времени
		const naiveDate = new Date(year, month, day, hours, minutes);
		// Проверяем, что дата корректна
		if (isNaN(naiveDate.getTime())) return null;

		// Конвертируем из указанного часового пояса в UTC
		return toZonedTime(naiveDate, timezone);
	} catch (error) {
		console.error("[Timezone] Error parsing date-time from input:", error);
		return null;
	}
}
