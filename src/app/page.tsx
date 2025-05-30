import { AuthForm } from "@/features/auth/ui/auth-form";

export default function WelcomePage() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-50 dark:bg-gray-900">
			<main className="flex flex-col items-center justify-center flex-1 w-full px-4 text-center">
				<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
					Добро пожаловать в систему приемной кампании!
				</h1>
				<AuthForm />
			</main>

			<footer className="w-full py-4 text-sm text-center text-gray-600 dark:text-gray-400">
				<p>
					&copy; {new Date().getFullYear()} Ваше Название ВУЗа. Все
					права защищены.
				</p>
				<p className="mt-1">
					<a
						href="/terms-of-service"
						className="text-blue-600 hover:underline dark:text-blue-400"
					>
						Лицензионное соглашение и Условия использования
					</a>
				</p>
			</footer>
		</div>
	);
}
