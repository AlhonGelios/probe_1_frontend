/**
 * Примеры использования функции convertDefaultValueToType
 *
 * Эта функция преобразует строковые значения по умолчанию в соответствующие типы данных
 * в зависимости от типа поля директории.
 */

import { convertDefaultValueToType } from "./edit-fields-validation";

// Примеры преобразования различных типов данных:

// STRING - возвращает строку как есть
const stringValue = convertDefaultValueToType("STRING", "Пример текста");
console.log(stringValue); // "Пример текста" (string)

// NUMBER - преобразует строку в число
const numberValue = convertDefaultValueToType("NUMBER", "42");
console.log(numberValue); // 42 (number)

// BOOLEAN - преобразует строки "true"/"false" в логические значения
const booleanTrue = convertDefaultValueToType("BOOLEAN", "true");
console.log(booleanTrue); // true (boolean)

const booleanFalse = convertDefaultValueToType("BOOLEAN", "false");
console.log(booleanFalse); // false (boolean)

// DATE - преобразует строку в объект Date (только дата, без времени)
const dateValue = convertDefaultValueToType("DATE", "2024-12-25");
console.log(dateValue); // Date объект для 25 декабря 2024 года

// DATETIME - преобразует строку в объект Date (дата и время)
const dateTimeValue = convertDefaultValueToType(
	"DATETIME",
	"2024-12-25T15:30:00"
);
console.log(dateTimeValue); // Date объект для 25 декабря 2024 года, 15:30

// Пустые значения возвращают null
const nullValue = convertDefaultValueToType("STRING", "");
console.log(nullValue); // null

const nullValue2 = convertDefaultValueToType("NUMBER", null);
console.log(nullValue2); // null

// Ошибки при некорректных значениях:
try {
	convertDefaultValueToType("NUMBER", "не число"); // Выбросит ошибку
} catch (error) {
	console.error((error as Error).message);
}

try {
	convertDefaultValueToType("BOOLEAN", "maybe"); // Выбросит ошибку
} catch (error) {
	console.error((error as Error).message);
}
