"use client";

import React, { useState } from "react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";

export function YearSelector() {
	const currentYear = new Date().getFullYear();
	const [selectedYear, setSelectedYear] = useState(String(currentYear));

	const years = [];
	for (let year = currentYear + 1; year >= 2000; year--) {
		years.push(String(year));
	}

	return (
		<Select value={selectedYear} onValueChange={setSelectedYear}>
			<SelectTrigger className="w-[100px] font-medium">
				<SelectValue placeholder="Год" />
			</SelectTrigger>
			<SelectContent className="max-h-[200px] overflow-y-auto">
				<SelectGroup>
					<SelectLabel>Выберите год</SelectLabel>
					{years.map((year) => (
						<SelectItem key={year} value={year}>
							{year}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
