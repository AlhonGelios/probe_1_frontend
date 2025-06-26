"use client";

import { useAuthStore } from "@/features/auth/model/auth-store";
import { DashboardHeader } from "@/features/profile";
import { AuthGuard } from "@/widgets/auth-guard/ui";
import React, { useEffect } from "react";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const syncUser = useAuthStore((state) => state.syncUser);

	useEffect(() => {
		const handleFocus = () => {
			syncUser();
		};

		window.addEventListener("focus", handleFocus);
		syncUser();

		return () => {
			window.removeEventListener("focus", handleFocus);
		};
	}, [syncUser]);

	return (
		<AuthGuard>
			<div className="flex flex-col min-h-screen">
				<DashboardHeader />
				<main className="flex-grow px-6 py-2 h-full">{children}</main>
			</div>
		</AuthGuard>
	);
}
