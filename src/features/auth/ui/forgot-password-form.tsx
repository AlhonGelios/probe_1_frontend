"use client";

import React, { useCallback, useRef, useState } from "react";
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
import { RecaptchaComponent } from "@/shared/ui/recaptcha";

export function ForgotPasswordForm() {
	const router = useRouter();
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

	const recaptchaRef = useRef<ReCAPTCHA>(null) as React.RefObject<ReCAPTCHA>;

	const form = useForm<ForgotPasswordValues>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: "",
			recaptchaToken: "",
		},
		mode: "onBlur",
	});

	const handleRecaptchaChange = useCallback(
		(token: string | null) => {
			setRecaptchaToken(token);
			form.setValue("recaptchaToken", token || "", {
				shouldValidate: true,
			});
			if (token) {
				form.clearErrors("recaptchaToken");
			}
			setError(null);
		},
		[form]
	);

	const handleFormSubmit = useCallback(
		async (values: ForgotPasswordValues) => {
			setIsLoading(true);
			setMessage(null);
			setError(null);

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
				if (recaptchaRef.current) {
					recaptchaRef.current.reset();
					console.log(
						"ReCAPTCHA widget reset on successful password reset request."
					);
				}
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
				if (recaptchaRef.current) {
					recaptchaRef.current.reset();
					console.log(
						"ReCAPTCHA widget reset on password reset request error."
					);
				}
			} finally {
				setIsLoading(false);
			}
		},
		[form]
	);

	const recaptchaErrors = form.formState
		.errors as FieldErrors<ForgotPasswordValues>;

	const isButtonDisabled = isLoading || !recaptchaToken;

	return (
		<div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-xl/30 dark:bg-gray-800 text-gray-900 dark:text-white">
			<h2 className="text-2xl font-bold text-center">
				Восстановление пароля
			</h2>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(handleFormSubmit)}
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
						<RecaptchaComponent
							recaptchaRef={recaptchaRef}
							sitekey={
								process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""
							}
							onRecaptchaChange={handleRecaptchaChange}
							onRecaptchaError={(msg) => setError(msg)}
						/>
						{recaptchaErrors.recaptchaToken && (
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
						disabled={isButtonDisabled}
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
	);
}
