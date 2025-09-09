import { create } from "zustand";

interface YearState {
	year: string;
	setYear: (year: string) => void;
}

export const useYearStore = create<YearState>((set) => ({
	year: new Date().getFullYear().toString(),
	setYear: (year) => set({ year }),
}));
