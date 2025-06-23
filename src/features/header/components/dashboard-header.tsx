"use client";

import React from "react";
import { DateTimeDisplay } from "../ui/date-time-display";
import { UserDropdown } from "../ui/user-dropdown";
import { YearSelector } from "../ui/year-selector";
import { Button } from "@/shared/ui/button";
import Link from "next/link";
import { navItems } from "../../profile/utils/display-nav-items";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { useShallow } from "zustand/shallow";
import { usePathname } from "next/navigation";

export function DashboardHeader() {
	const user = useAuthStore(useShallow((state) => state.user));
	const userRoleName = user?.role?.name;
	const pathname = usePathname();

	const visibleNavItems = navItems.filter((item) => {
		if (!userRoleName) {
			return false;
		}
		return item.roles.includes(userRoleName);
	});

	return (
		<header className="bg-card text-card-foreground border-b border-border p-3 flex justify-between items-center shadow-sm">
			<div className="flex items-center space-x-4">
				<DateTimeDisplay />
				<div className="border-l border-border h-8 mx-2" />
				<YearSelector />
				<nav className="flex items-center space-x-2">
					{visibleNavItems.map((item) => {
						const isActive = pathname === item.href;
						return (
							<Button
								asChild
								variant="ghost"
								className={
									isActive
										? "bg-gray-600 text-primary-foreground font-semibold"
										: ""
								}
								key={item.href}
							>
								<Link href={item.href}>{item.name}</Link>
							</Button>
						);
					})}
				</nav>
			</div>
			<div className="flex items-center space-x-4">
				<div className="border-l border-border h-8 mx-2" />
				<UserDropdown />
			</div>
		</header>
	);
}
