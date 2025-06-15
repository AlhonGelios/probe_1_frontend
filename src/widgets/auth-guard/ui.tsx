"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { useShallow } from "zustand/shallow";

interface AuthGuardProps {
	children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
	const { isLoggedIn, isLoading, isInitialized, checkAuth } = useAuthStore(
		useShallow((state) => ({
			isLoggedIn: state.isLoggedIn,
			isLoading: state.isLoading,
			isInitialized: state.isInitialized,
			checkAuth: state.checkAuth,
		}))
	);
	const router = useRouter();

	// Выполняем проверку сессии при монтировании компонента, если еще не инициализировано
	useEffect(() => {
		if (!isInitialized) {
			checkAuth();
		}
	}, [isInitialized, checkAuth]);

	useEffect(() => {
		if (isInitialized && !isLoggedIn) {
			router.push("/welcome");
		}
	}, [isInitialized, isLoggedIn, router]);

	if (isLoading || !isInitialized) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
				<p>Проверка доступа...</p>
			</div>
		);
	}

	if (isLoggedIn) {
		return <>{children}</>;
	}

	return null;
}
