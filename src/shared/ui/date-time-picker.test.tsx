import { convertToServerTime, convertFromServerTime } from "./date-time-picker";

describe("Date Time Picker Time Conversion", () => {
	it("should convert local time to server time correctly", () => {
		const localDate = new Date("2025-07-01T12:00:00.000"); // Летнее время
		const serverDate = convertToServerTime(localDate);
		expect(serverDate.toISOString()).toBe("2025-07-01T09:00:00.000Z");
	});

	it("should convert server time to local time correctly", () => {
		const serverDate = new Date("2025-07-01T12:00:00.000Z"); // Летнее время
		const localDate = convertFromServerTime(serverDate);
		expect(localDate.toISOString()).toBe("2025-07-01T12:00:00.000Z");
	});

	it("should convert local time to server time correctly during winter time", () => {
		const localDate = new Date("2025-11-01T12:00:00.000"); // Зимнее время
		const serverDate = convertToServerTime(localDate);
		expect(serverDate.toISOString()).toBe("2025-11-01T09:00:00.000Z");
	});

	it("should convert server time to local time correctly during winter time", () => {
		const serverDate = new Date("2025-11-01T12:00:00.000Z"); // Зимнее время
		const localDate = convertFromServerTime(serverDate);
		expect(localDate.toISOString()).toBe("2025-11-01T12:00:00.000Z");
	});
});
