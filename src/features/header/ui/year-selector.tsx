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

import { useYearStore } from "../model/year-store";

export function YearSelector() {
	const currentYear = new Date().getFullYear();
	const { year, setYear } = useYearStore();

	const years = [];
	for (let year = currentYear + 1; year >= 2000; year--) {
		years.push(String(year));
	}

	return (
		<Select value={year} onValueChange={setYear}>
			<SelectTrigger className="w-[100px] font-medium">
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
