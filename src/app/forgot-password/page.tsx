"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FieldErrors, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestPasswordReset } from "@/features/auth/api/auth-api";
import { Button } from "@/shared/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { ReloadIcon } from "@radix-ui/react-icons";
import {
	forgotPasswordSchema,
	ForgotPasswordValues,
} from "@/features/auth/model/auth-schemas";
import ReCAPTCHA from "react-google-recaptcha";

export default function ForgotPasswordPage() {
	const router = useRouter();
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

	const form = useForm<ForgotPasswordValues>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: "",
		},
		mode: "onBlur", // Валидация при потере фокуса
	});

	const handleRecaptchaChange = (token: string | null) => {
		setRecaptchaToken(token);
		form.setValue("recaptchaToken", token || "", { shouldValidate: true }); // Устанавливаем значение в форму
		if (token) {
			form.clearErrors("recaptchaToken"); // Очищаем ошибку, если токен получен
		}
		setError(null); // Очищаем общую ошибку при взаимодействии с капчей
	};

	const onSubmit = async (values: ForgotPasswordValues) => {
		setIsLoading(true);
		setMessage(null);
		setError(null);

		if (!values.recaptchaToken) {
			setError("Пожалуйста, подтвердите, что вы не робот.");
			setIsLoading(false);
			return;
		}

		try {
			const response = await requestPasswordReset({
				email: values.email,
				recaptchaToken: values.recaptchaToken,
			});
			setMessage(response.message);
			form.reset({
				email: "",
				recaptchaToken: "",
			});
			setRecaptchaToken(null);
		} catch (err: unknown) {
			console.error("Ошибка при запросе сброса пароля:", err);
			if (err instanceof Error) {
				setError(
					err.message ||
						"Произошла неизвестная ошибка при запросе сброса пароля."
				);
			}
			setRecaptchaToken(null);
			form.setValue("recaptchaToken", "");
		} finally {
			setIsLoading(false);
		}
	};

	const recaptchaErrors = form.formState
		.errors as FieldErrors<ForgotPasswordValues>;

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
			<div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800 text-gray-900 dark:text-white">
				<h2 className="text-2xl font-bold text-center">
					Восстановление пароля
				</h2>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="Ваш email"
											{...field}
											disabled={isLoading}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-center mt-4 flex-col items-center">
							<ReCAPTCHA
								sitekey={
									process.env
										.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""
								}
								onChange={handleRecaptchaChange}
								onExpired={() => {
									setRecaptchaToken(null);
									form.setValue("recaptchaToken", ""); // Сбрасываем значение в форме при истечении
								}}
								onErrored={() =>
									setError(
										"Ошибка CAPTCHA. Пожалуйста, попробуйте еще раз."
									)
								}
							/>
							{recaptchaErrors.recaptchaToken && ( // Отображаем ошибку валидации из Zod
								<p className="text-sm text-red-600 dark:text-red-400 mt-2">
									{recaptchaErrors.recaptchaToken.message}
								</p>
							)}
						</div>

						{message && (
							<p className="text-sm text-green-600 dark:text-green-400 text-center">
								{message}
							</p>
						)}
						{error && (
							<p className="text-sm text-red-600 dark:text-red-400 text-center">
								{error}
							</p>
						)}

						<Button
							type="submit"
							className="w-full"
							disabled={isLoading || !recaptchaToken}
						>
							{isLoading ? (
								<>
									<ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
									Отправка...
								</>
							) : (
								"Отправить ссылку для сброса"
							)}
						</Button>
					</form>
				</Form>

				<p className="text-sm text-center text-gray-600 dark:text-gray-400">
					Вспомнили пароль?{" "}
					<button
						type="button"
						onClick={() => router.push("/")}
						className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer link-hover-underline"
						disabled={isLoading}
					>
						Войти
					</button>
				</p>
			</div>
		</div>
	);
}
