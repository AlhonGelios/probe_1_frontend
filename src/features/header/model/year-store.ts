import { create } from "zustand";

interface YearState {
	year: string;
	setYear: (year: string) => void;
}

export const useYearStore = create<YearState>((set) => {
	// Инициализация с проверкой localStorage и SSR
	const initializeYear = () => {
		// На сервере возвращаем текущий год как строку
		if (typeof window === "undefined") {
			return new Date().getFullYear().toString();
		}

		const savedYear = localStorage.getItem("selectedYear");
		if (savedYear) {
			// Пробуем распарсить число
			const yearNumber = parseInt(savedYear, 10);
			// Проверяем, что это валидный год (4 цифры)
			if (
				!Number.isNaN(yearNumber) &&
				yearNumber > 2000 &&
				yearNumber < 2100
			) {
				return yearNumber.toString();
			}
		}
		// Возвращаем текущий год по умолчанию как строку
		return new Date().getFullYear().toString();
	};

	return {
		year: initializeYear(),
		setYear: (year) => {
			// Сохраняем только в браузере
			if (typeof window !== "undefined") {
				// Сохраняем как число
				const yearNumber = parseInt(year, 10);
				if (!Number.isNaN(yearNumber)) {
					localStorage.setItem("selectedYear", yearNumber.toString());
				}
			}
			set({ year });
		},
	};
});
