"use client";

import React from "react";
import { DateTimeDisplay } from "../ui/date-time-display";
import { UserDropdown } from "../ui/user-dropdown";
import { YearSelector } from "../ui/year-selector";
import { Button } from "@/shared/ui/button";
import Link from "next/link";

export function DashboardHeader() {
	return (
		<header className="bg-card text-card-foreground border-b border-border p-3 flex justify-between items-center shadow-sm">
			<div className="flex items-center space-x-4">
				<DateTimeDisplay />
				<div className="border-l border-border h-8 mx-2" />
				<YearSelector />
				<nav className="flex items-center space-x-2">
					<Button variant="ghost" asChild>
						<Link href="/rules">Правила приема</Link>
					</Button>
					<Button variant="ghost" asChild>
						<Link href="/card-index">Картотека</Link>
					</Button>
					<Button variant="ghost" asChild>
						<Link href="/statistics">Статистика</Link>
					</Button>
				</nav>
			</div>
			<div className="flex items-center space-x-4">
				<Button variant="ghost" asChild>
					<Link href="/user-management">
						Управление пользователями
					</Link>
				</Button>
				<div className="border-l border-border h-8 mx-2" />
				<UserDropdown />
			</div>
		</header>
	);
}
