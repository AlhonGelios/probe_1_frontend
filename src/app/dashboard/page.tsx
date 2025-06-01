"use client";

import { Button } from "@/shared/ui/button";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { AuthGuard } from "@/widgets/auth-guard/ui";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/shallow";

export default function DashboardPage() {
	const { user, logout } = useAuthStore(
		useShallow((state) => ({
			user: state.user,
			logout: state.logout,
		}))
	);
	const router = useRouter();

	const handleLogout = async () => {
		// В реальном приложении здесь стоит отправить запрос на бэкенд для завершения сессии
		logout();
		router.push("/");
	};

	return (
		<AuthGuard>
			<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4">
				<h1 className="text-4xl font-bold mb-4">
					Добро пожаловать, {user?.firstName} {user?.lastName}!{" "}
				</h1>
				<p className="text-lg mb-8">Это ваша панель управления.</p>
				<Button onClick={handleLogout} className="px-6 py-3 text-lg">
					Выйти
				</Button>
			</div>
		</AuthGuard>
	);
}
