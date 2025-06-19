"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns"; // Import format for date utility
import { ru } from "date-fns/locale"; // Import locale if needed for date formatting

import { UserFilterState } from "@/features/user-management/types";
import { getAllUsers } from "@/features/user-management/api/user-api";
import { UserFilters } from "@/features/user-management/components/UserFilters";
import StickyTableExample, {
	UserListTable,
} from "@/features/user-management/components/UserListTable";
import { UserEditDrawer } from "@/features/user-management/components/UserEditDrawer";
import { useRoleStore } from "@/features/user-management/stores/role-store";
import { Button } from "@/shared/ui/button";
import { User } from "@/features/auth/model/types";

export default function UserManagementPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [isLoadingUsers, setIsLoadingUsers] = useState(true);
	const [usersError, setUsersError] = useState<string | null>(null);

	const {
		isLoading: isLoadingRoles,
		error: rolesError,
		fetchRoles,
		getRoleNameByDisplayName,
		getRoleDisplayName,
	} = useRoleStore();

	const [filter, setFilter] = useState<UserFilterState>({
		role: "all",
		search: "",
	});

	const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<User | null>(null);

	const fetchUsers = useCallback(async () => {
		setIsLoadingUsers(true);
		setUsersError(null);
		try {
			const fetchedUsers = await getAllUsers();
			setUsers(fetchedUsers);
		} catch (err: unknown) {
			if (err instanceof Error) {
				setUsersError(err.message || "Failed to load users.");
				toast.error("Ошибка загрузки пользователей", {
					description: err.message,
				});
			}
		} finally {
			setIsLoadingUsers(false);
		}
	}, []);

	useEffect(() => {
		fetchRoles();
		fetchUsers();
	}, [fetchRoles, fetchUsers]);

	const handleFilterChange = useCallback(
		(newFilter: Partial<UserFilterState>) => {
			setFilter((prev) => ({ ...prev, ...newFilter }));
		},
		[]
	);

	const handleEditUser = useCallback((user: User) => {
		setEditingUser(user);
		setIsEditDrawerOpen(true);
	}, []);

	const handleCloseDrawer = useCallback(() => {
		setIsEditDrawerOpen(false);
		setEditingUser(null);
	}, []);

	const handleUserUpdated = useCallback(() => {
		fetchUsers();
	}, [fetchUsers]);

	// Применяем фильтры и сортировку к списку пользователей
	const filteredAndSortedUsers = useMemo(() => {
		let filteredUsers = users;

		// 1. Фильтрация по роли (без изменений)
		if (filter.role !== "all") {
			const internalRoleName = getRoleNameByDisplayName(filter.role);
			if (internalRoleName) {
				filteredUsers = filteredUsers.filter(
					(user) => user.role.name === internalRoleName
				);
			} else {
				filteredUsers = [];
			}
		}

		// 2. Глобальный поиск по всем полям
		const searchTerm = filter.search.toLowerCase().trim();
		if (searchTerm) {
			filteredUsers = filteredUsers.filter((user) => {
				// Объединяем все текстовые поля в одну строку для поиска
				const userText = [
					user.firstName,
					user.lastName,
					user.email,
					getRoleDisplayName(user.role.name), // Используем displayName роли
					user.isVerified ? "верифицирован" : "не верифицирован", // Пример для булева
					user.roleExpiration
						? format(user.roleExpiration, "PPP", { locale: ru })
						: "", // Форматируем дату
					format(user.createdAt, "PPP", { locale: ru }),
					format(user.updatedAt, "PPP", { locale: ru }),
				]
					.join(" ")
					.toLowerCase();

				return userText.includes(searchTerm);
			});
		}

		// 3. Сортировка (без изменений)
		filteredUsers.sort((a, b) => {
			const nameComparison = a.firstName.localeCompare(b.firstName);
			if (nameComparison !== 0) return nameComparison;
			return a.lastName.localeCompare(b.lastName);
		});

		return filteredUsers;
	}, [users, filter, getRoleNameByDisplayName, getRoleDisplayName]); // <--- Добавляем getRoleDisplayName в зависимости

	if (isLoadingUsers || isLoadingRoles) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<span className="ml-2 text-muted-foreground">
					Загрузка {isLoadingRoles ? "ролей" : "пользователей"}...
				</span>
			</div>
		);
	}

	if (usersError || rolesError) {
		return (
			<div className="text-center p-8 text-destructive-foreground bg-destructive rounded-lg">
				<p className="font-semibold">Ошибка:</p>
				<p>{usersError || rolesError}</p>
				<Button
					onClick={usersError ? fetchUsers : fetchRoles}
					className="mt-4"
				>
					Повторить попытку
				</Button>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8">
			<h1 className="text-3xl font-bold mb-6 text-foreground">
				Управление пользователями
			</h1>

			<UserFilters filter={filter} onFilterChange={handleFilterChange} />

			{/* <UserListTable
				users={filteredAndSortedUsers}
				onEditUser={handleEditUser}
			/> */}

			<StickyTableExample />

			<UserEditDrawer
				user={editingUser}
				isOpen={isEditDrawerOpen}
				onClose={handleCloseDrawer}
				onUserUpdated={handleUserUpdated}
			/>
		</div>
	);
}
