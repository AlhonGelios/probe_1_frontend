"use client";

import React from "react";

import { useRouter } from "next/navigation";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Button } from "@/shared/ui/button";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { useShallow } from "zustand/shallow";

export function UserDropdown() {
	const { user, logout } = useAuthStore(
		useShallow((state) => ({
			user: state.user,
			logout: state.logout,
		}))
	);

	const router = useRouter();

	const handleLogout = async () => {
		try {
			await logout();
		} catch (error) {
			console.error("Ошибка при выходе:", error);
		}
	};

	const handleEditProfile = () => {
		router.push("/edit-profile");
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="flex items-center space-x-2 cursor-pointer"
				>
					<span className="text-lg font-semibold">
						{user?.firstName} {user?.lastName}
					</span>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						className="w-5 h-5"
					>
						<path
							fillRule="evenodd"
							d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
							clipRule="evenodd"
						/>
					</svg>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="end">
				<DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={handleEditProfile}>
					Редактировать профиль
				</DropdownMenuItem>
				<DropdownMenuItem onClick={handleLogout}>
					Выход
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
