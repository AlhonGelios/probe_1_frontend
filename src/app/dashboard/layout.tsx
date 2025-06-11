"use client";

import { DashboardHeader } from "@/features/dashboard";
import { AuthGuard } from "@/widgets/auth-guard/ui";
import React from "react";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<AuthGuard>
			<div className="flex flex-col min-h-screen">
				<DashboardHeader />
				<main className="flex-grow p-6 h-full">{children}</main>
			</div>
		</AuthGuard>
	);
}
