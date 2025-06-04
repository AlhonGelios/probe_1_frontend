"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { checkVerificationStatus } from "@/features/auth/api/auth-api";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Button } from "@/shared/ui/button";

export default function VerifyEmailPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	// Получаем данные пользователя из URL-параметров
	const userId = searchParams.get("id");
	const firstName = searchParams.get("firstName");
	const lastName = searchParams.get("lastName");
	const email = searchParams.get("email");

	const [isVerified, setIsVerified] = useState(false);
	const [isChecking, setIsChecking] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!userId || !email) {
			setError(
				"Недостаточно данных для проверки. Пожалуйста, вернитесь на страницу регистрации."
			);
			setIsChecking(false);
			return;
		}

		let intervalId: NodeJS.Timeout | null = null;

		const pollVerificationStatus = async () => {
			setIsChecking(true);
			setError(null);
			try {
				const status = await checkVerificationStatus(userId);

				if (status.isVerified) {
					setIsVerified(true);
					if (intervalId) clearInterval(intervalId);
				} else {
				}
			} catch (err: unknown) {
				console.error("Ошибка при проверке статуса верификации:", err);
				if (err instanceof Error) {
					setError(
						err.message ||
							"Не удалось проверить статус. Пожалуйста, перезагрузите страницу."
					);
				}

				if (intervalId) clearInterval(intervalId);
			} finally {
				setIsChecking(false);
			}
		};

		pollVerificationStatus();

		intervalId = setInterval(pollVerificationStatus, 5000);

		return () => {
			if (intervalId) clearInterval(intervalId);
		};
	}, [userId, email]);
	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4">
			<div className="p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800 text-center">
				{isVerified ? (
					<>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="48"
							height="48"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="lucide lucide-circle-check h-12 w-12 mx-auto text-green-500"
						>
							<circle cx="12" cy="12" r="10" />
							<path d="m9 12 2 2 4-4" />
						</svg>
						<h1 className="text-3xl font-bold text-green-600 dark:text-green-400">
							Спасибо за подтверждение почты!
						</h1>
						<p className="text-lg text-gray-700 dark:text-gray-300">
							Ваша учетная запись успешно подтверждена.
						</p>
						<Button
							onClick={() => router.push("/")}
							className="mt-6 px-8 py-3 text-lg"
						>
							Перейти к входу
						</Button>
					</>
				) : (
					<>
						{isChecking ? (
							<ReloadIcon className="h-8 w-8 animate-spin mx-auto text-blue-500" />
						) : (
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="lucide lucide-mail-warning h-8 w-8 mx-auto text-yellow-500"
							>
								<path d="M22 10.5V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h12.5" />
								<path d="m22 7-8.97 5.7L2 7" />
								<path d="M12 17h.01" />
								<path d="M12 11v-3" />
							</svg>
						)}
						<h1 className="text-2xl font-bold">
							Пожалуйста, подтвердите свою почту
						</h1>
						{firstName && lastName && email && (
							<p className="text-lg text-gray-700 dark:text-gray-300">
								Вам,{" "}
								<b>
									{firstName} {lastName}
								</b>
								, был отправлен email на адрес <b>{email}</b>.
								<br />
								Письмо действует в течение <b>24 часов</b>.
								<br />
								Перейдите по ссылке в письме для подтверждения
								своей регистрации.
							</p>
						)}
						{!firstName && !lastName && !email && (
							<p className="text-lg text-gray-700 dark:text-gray-300">
								Мы отправили ссылку для подтверждения на ваш
								адрес электронной почты. Пожалуйста, проверьте
								папку &quot;Входящие&quot; или &quot;Спам&quot;.
							</p>
						)}
						{error && (
							<p className="text-sm text-red-600 dark:text-red-400">
								{error}
							</p>
						)}
						{!isChecking && (
							<p className="text-sm text-gray-500 dark:text-gray-400">
								Мы автоматически проверим статус подтверждения.
							</p>
						)}
						<Button
							onClick={() => router.push("/")}
							className="mt-4 px-6 py-3 text-lg"
							disabled={isChecking}
						>
							Вернуться на главную
						</Button>
					</>
				)}
			</div>
		</div>
	);
}
