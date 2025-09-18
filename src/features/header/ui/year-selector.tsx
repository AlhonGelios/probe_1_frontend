"use client";

import React from "react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { useRouter } from "next/navigation";

import { useYearStore } from "../model/year-store";

export function YearSelector() {
	const currentYear = new Date().getFullYear();
	const { year, setYear } = useYearStore();
	const router = useRouter();

	const years = [];
	for (let year = currentYear + 1; year >= 2000; year--) {
		years.push(String(year));
	}

	const handleYearChange = (newYear: string) => {
		setYear(newYear);
		router.push("/dashboard");
	};

	return (
		<Select value={year} onValueChange={handleYearChange}>
			<SelectTrigger
				className={`w-[100px] font-medium shadow-md ${
					year === String(currentYear)
						? "shadow-blue-500/50"
						: "shadow-orange-500/50"
				}`}
			>
				<SelectValue placeholder="Год" />
			</SelectTrigger>
			<SelectContent className="max-h-[200px] overflow-y-auto">
				<SelectGroup>
					<SelectLabel>Выберите год</SelectLabel>
					{years.map((yearItem) => (
						<SelectItem key={yearItem} value={yearItem}>
							{yearItem}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
