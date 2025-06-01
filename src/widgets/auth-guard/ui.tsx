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

	// Логика перенаправления
	useEffect(() => {
		if (isInitialized && !isLoggedIn) {
			router.push("/"); // Перенаправить на страницу входа
		}
	}, [isInitialized, isLoggedIn, router]);

	// Пока идет загрузка или не инициализировано, показываем лоадер
	if (isLoading || !isInitialized) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
				<p>Проверка доступа...</p>
			</div>
		);
	}

	// Если пользователь авторизован, отображаем дочерние компоненты
	if (isLoggedIn) {
		return <>{children}</>;
	}

	// В случае, если не авторизован и не грузится (уже перенаправлен), не рендерим ничего
	return null;
}
