"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPassword } from "@/features/auth/api/auth-api";
import { Button } from "@/shared/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/ui/form";
import { PasswordInput } from "@/shared/ui/password-input";
import { ReloadIcon } from "@radix-ui/react-icons";
import {
	resetPasswordSchema,
	ResetPasswordValues,
} from "@/features/auth/model/auth-schemas";

export function ResetPasswordForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [token, setToken] = useState<string | null>(null);

	useEffect(() => {
		const urlToken = searchParams.get("token");
		if (urlToken) {
			setToken(urlToken);
		} else {
			setError(
				"Токен для сброса пароля отсутствует. Пожалуйста, вернитесь на страницу запроса сброса пароля."
			);
		}
	}, [searchParams]);

	const form = useForm<ResetPasswordValues>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
		mode: "onChange",
	});

	const onSubmit = async (values: ResetPasswordValues) => {
		setIsLoading(true);
		setMessage(null);
		setError(null);

		if (!token) {
			setError("Токен для сброса пароля отсутствует или недействителен.");
			setIsLoading(false);
			return;
		}

		try {
			const response = await resetPassword({
				token,
				newPassword: values.password,
			});
			setMessage(response.message);
			form.reset();
		} catch (err: unknown) {
			console.error("Ошибка при сбросе пароля:", err);
			if (err instanceof Error) {
				setError(
					err.message ||
						"Произошла неизвестная ошибка при сбросе пароля."
				);
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-xl/30 dark:bg-gray-800 text-gray-900 dark:text-white">
			<h2 className="text-2xl font-bold text-center">
				Установите новый пароль
			</h2>
			{error && ( // Показываем глобальную ошибку, если нет токена
				<p className="text-sm text-red-600 dark:text-red-400 text-center">
					{error}
				</p>
			)}

			{!token && !error ? (
				<p className="text-sm text-gray-600 dark:text-gray-400 text-center">
					Загрузка...
				</p>
			) : (
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Новый пароль</FormLabel>
									<FormControl>
										<PasswordInput
											placeholder="Введите новый пароль"
											{...field}
											disabled={isLoading}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="confirmPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Подтвердите пароль</FormLabel>
									<FormControl>
										<PasswordInput
											placeholder="Подтвердите новый пароль"
											{...field}
											disabled={isLoading}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{message && (
							<p className="text-sm text-green-600 dark:text-green-400 text-center">
								{message}
							</p>
						)}

						<Button
							type="submit"
							className="w-full"
							disabled={isLoading || !token}
						>
							{isLoading ? (
								<>
									<ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
									Сброс...
								</>
							) : (
								"Сбросить пароль"
							)}
						</Button>
					</form>
				</Form>
			)}

			<p className="text-sm text-center text-gray-600 dark:text-gray-400">
				<button
					type="button"
					onClick={() => router.push("/")}
					className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer link-hover-underline"
					disabled={isLoading}
				>
					Вернуться на страницу входа
				</button>
			</p>
		</div>
	);
}
