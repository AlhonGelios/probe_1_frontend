"use client";

import React from "react";
import { Button } from "@/shared/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/ui/table";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { User } from "@/features/auth/model/types";
import { useRoleStore } from "../stores/role-store";

interface UserListTableProps {
	users: User[];
	onEditUser: (user: User) => void;
}

export function UserListTable({ users, onEditUser }: UserListTableProps) {
	const { getRoleDisplayName } = useRoleStore();
	// Сортируем названия ролей для консистентного отображения
	const sortedUser = users.sort((a, b) => {
		const roleCompare = a.role.name.localeCompare(b.role.name);
		if (roleCompare !== 0) return roleCompare;
		return a.lastName.localeCompare(b.lastName);
	});

	return (
		<div className="border rounded-lg overflow-hidden bg-card text-card-foreground shadow-sm">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Имя</TableHead>
						<TableHead>Фамилия</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Роль</TableHead>
						<TableHead>Истечение роли</TableHead>
						<TableHead>Действия</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{sortedUser.length === 0 && (
						<TableRow>
							<TableCell
								colSpan={6}
								className="h-24 text-center text-muted-foreground"
							>
								Пользователи не найдены.
							</TableCell>
						</TableRow>
					)}
					<React.Fragment>
						<TableRow className="bg-muted/30 hover:bg-muted/30"></TableRow>
						{sortedUser.map((user) => (
							<TableRow key={user.id}>
								<TableCell>{user.firstName}</TableCell>
								<TableCell>{user.lastName}</TableCell>
								<TableCell>{user.email}</TableCell>
								<TableCell>
									{getRoleDisplayName(user.role.name)}
								</TableCell>
								<TableCell>
									{user.roleExpiration
										? format(user.roleExpiration, "PPP", {
												locale: ru,
										  })
										: "Бессрочно"}
								</TableCell>
								<TableCell>
									<Button
										className="bg-amber-100 hover:bg-amber-200"
										variant="outline"
										size="sm"
										onClick={() => onEditUser(user)}
									>
										Редактировать
									</Button>
								</TableCell>
							</TableRow>
						))}
					</React.Fragment>
				</TableBody>
			</Table>
		</div>
	);
}
