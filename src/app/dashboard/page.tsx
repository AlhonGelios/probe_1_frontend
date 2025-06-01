"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { Button } from "@/shared/ui/button";
import { useShallow } from "zustand/shallow";

export default function DashboardPage() {
	const { user, isLoggedIn, isLoading, isInitialized, logout, checkAuth } =
		useAuthStore(
			useShallow((state) => ({
				user: state.user,
				isLoggedIn: state.isLoggedIn,
				isLoading: state.isLoading,
				isInitialized: state.isInitialized,
				logout: state.logout,
				checkAuth: state.checkAuth,
			}))
		);
	const router = useRouter();

	// Выполняем проверку сессии при монтировании компонента
	useEffect(() => {
		if (!isInitialized) {
			// Проверяем, если хранилище еще не инициализировано
			checkAuth();
		}
	}, [isInitialized, checkAuth]); // Зависимости хука

	// Логика перенаправления
	useEffect(() => {
		if (isInitialized && !isLoggedIn) {
			// Только если хранилище инициализировано И пользователь не авторизован
			router.push("/");
		}
	}, [isInitialized, isLoggedIn, router]);

	const handleLogout = async () => {
		// await fetch("/api/auth/logout", {
		// 	method: "POST",
		// 	credentials: "include",
		// });
		logout();
		router.push("/");
	};

	// Отображение состояния загрузки/ожидания
	if (isLoading || !isInitialized) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
				<p>Проверка сессии...</p> {/* Или спиннер загрузки */}
			</div>
		);
	}

	// Если пользователь не авторизован после инициализации, этот блок не должен быть достигнут,
	// так как сработает редирект выше. Но как запасной вариант:
	if (!isLoggedIn) {
		return null;
	}

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4">
			<h1 className="text-4xl font-bold mb-4">
				Добро пожаловать, {user?.email || "Пользователь"}!
			</h1>
			<p className="text-lg mb-8">Это ваша панель управления.</p>
			<Button onClick={handleLogout} className="px-6 py-3 text-lg">
				Выйти
			</Button>
		</div>
	);
}
