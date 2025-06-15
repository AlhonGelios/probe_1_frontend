"use client";

import React from "react";
import { Input } from "@/shared/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { UserFilterState } from "../types";

interface UserFiltersProps {
	filter: UserFilterState;
	onFilterChange: (newFilter: Partial<UserFilterState>) => void;
	availableRoles: string[];
}

export function UserFilters({
	filter,
	onFilterChange,
	availableRoles,
}: UserFiltersProps) {
	return (
		<div className="flex flex-wrap items-center gap-4 mb-6 p-4 border rounded-lg bg-card">
			<div className="flex-1 min-w-[180px]">
				<label htmlFor="role-filter" className="sr-only">
					Фильтр по роли
				</label>
				<Select
					value={filter.role}
					onValueChange={(value) => onFilterChange({ role: value })}
				>
					<SelectTrigger id="role-filter">
						<SelectValue placeholder="Фильтр по роли" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Все роли</SelectItem>
						{availableRoles.map((role) => (
							<SelectItem key={role} value={role}>
								{role}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div className="flex-1 min-w-[180px]">
				<label htmlFor="first-name-search" className="sr-only">
					Поиск по имени
				</label>
				<Input
					id="first-name-search"
					placeholder="Поиск по имени..."
					value={filter.firstName}
					onChange={(e) =>
						onFilterChange({ firstName: e.target.value })
					}
				/>
			</div>

			<div className="flex-1 min-w-[180px]">
				<label htmlFor="last-name-search" className="sr-only">
					Поиск по фамилии
				</label>
				<Input
					id="last-name-search"
					placeholder="Поиск по фамилии..."
					value={filter.lastName}
					onChange={(e) =>
						onFilterChange({ lastName: e.target.value })
					}
				/>
			</div>
		</div>
	);
}
