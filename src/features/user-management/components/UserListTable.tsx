// features/user-management/components/UserListTable.tsx
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

interface UserListTableProps {
	users: User[];
	onEditUser: (user: User) => void;
}

export function UserListTable({ users, onEditUser }: UserListTableProps) {
	// Группируем пользователей по ролям
	const groupedUsers = users.reduce((acc, user) => {
		const roleName = user.role.name || "UNASSIGNED"; // Если роль по какой-то причине отсутствует
		if (!acc[roleName]) {
			acc[roleName] = [];
		}
		acc[roleName].push(user);
		return acc;
	}, {} as Record<string, User[]>);

	// Сортируем названия ролей для консистентного отображения
	const sortedRoleNames = Object.keys(groupedUsers).sort();

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
					{sortedRoleNames.length === 0 && (
						<TableRow>
							<TableCell
								colSpan={6}
								className="h-24 text-center text-muted-foreground"
							>
								Пользователи не найдены.
							</TableCell>
						</TableRow>
					)}
					{sortedRoleNames.map((roleName) => (
						<React.Fragment key={roleName}>
							<TableRow className="bg-muted/30 hover:bg-muted/30">
								{" "}
								{/* Отдельный заголовок для группы */}
								<TableCell
									colSpan={6}
									className="font-semibold text-lg py-3"
								>
									Роль: {roleName}
								</TableCell>
							</TableRow>
							{groupedUsers[roleName].map((user) => (
								<TableRow key={user.id}>
									<TableCell>{user.firstName}</TableCell>
									<TableCell>{user.lastName}</TableCell>
									<TableCell>{user.email}</TableCell>
									<TableCell>{user.role.name}</TableCell>
									<TableCell>
										{user.roleExpiration
											? format(
													user.roleExpiration,
													"PPP",
													{ locale: ru }
											  )
											: "Бессрочно"}
									</TableCell>
									<TableCell>
										<Button
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
					))}
				</TableBody>
			</Table>
		</div>
	);
}
