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
import { useRoleStore } from "../stores/role-store";

interface UserFiltersProps {
	filter: UserFilterState;
	onFilterChange: (newFilter: Partial<UserFilterState>) => void;
}

export function UserFilters({ filter, onFilterChange }: UserFiltersProps) {
	const { roles, isLoading, error } = useRoleStore();

	const availableDisplayNames = roles.map((role) => role.displayName);

	return (
		<div className="flex flex-wrap items-center gap-4 mb-6 p-4 border rounded-lg bg-card">
			<div className="flex-1 min-w-[180px]">
				<label htmlFor="role-filter" className="sr-only">
					Фильтр по роли
				</label>
				<Select
					value={filter.role}
					onValueChange={(value) => onFilterChange({ role: value })}
					disabled={isLoading}
				>
					<SelectTrigger id="role-filter">
						<SelectValue placeholder="Фильтр по роли" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">Все роли</SelectItem>
						{isLoading ? (
							<SelectItem value="loading" disabled>
								Загрузка ролей...
							</SelectItem>
						) : error ? (
							<SelectItem value="error" disabled>
								Ошибка загрузки ролей
							</SelectItem>
						) : (
							availableDisplayNames.map((displayName) => (
								<SelectItem
									key={displayName}
									value={displayName}
								>
									{displayName}
								</SelectItem>
							))
						)}
					</SelectContent>
				</Select>
			</div>

			<div className="flex-1 min-w-[250px]">
				<label htmlFor="global-search" className="sr-only">
					Общий поиск
				</label>
				<Input
					id="global-search"
					placeholder="Поиск по имени, фамилии, email, роли..."
					value={filter.search}
					onChange={(e) => onFilterChange({ search: e.target.value })}
				/>
			</div>
		</div>
	);
}
