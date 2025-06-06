"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { useShallow } from "zustand/react/shallow";
import { loginUser, registerUser } from "@/features/auth/api/auth-api";
import { FieldErrors, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
	loginSchema,
	registerSchema,
	LoginFormValues,
	RegisterFormValues,
} from "@/features/auth/model/auth-schemas";
import { PasswordInput } from "@/shared/ui/password-input";

export function AuthForm() {
	const [isSignUp, setIsSignUp] = useState(false);
	const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

	const { login, setLoading, setError, isLoading, error } = useAuthStore(
		useShallow((state) => ({
			login: state.login,
			setLoading: state.setLoading,
			setError: state.setError,
			isLoading: state.isLoading,
			error: state.error,
		}))
	);
	const router = useRouter();

	const formSchema = isSignUp ? registerSchema : loginSchema;

	const form = useForm<LoginFormValues | RegisterFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
			firstName: "",
			lastName: "",
			recaptchaToken: "",
		} as LoginFormValues & RegisterFormValues,
		mode: "onChange",
	});

	React.useEffect(() => {
		form.reset();
		setRecaptchaToken(null);
		setError(null);
	}, [isSignUp, form, setError]);

	const handleRecaptchaChange = (token: string | null) => {
		setRecaptchaToken(token);
		form.setValue("recaptchaToken", token || "", { shouldValidate: true });
		if (token) {
			form.clearErrors("recaptchaToken");
		}
		setError(null);
	};

	const onSubmit = async (values: LoginFormValues | RegisterFormValues) => {
		setLoading(true);
		setError(null);

		try {
			if (isSignUp) {
				const registerValues = values as RegisterFormValues;
				const {
					confirmPassword: _,
					...registerValuesWithoutConfirmPassword
				} = registerValues;

				const registeredUser = await registerUser(
					registerValuesWithoutConfirmPassword
				);
				router.push(
					`/verify-email?id=${registeredUser.id}&firstName=${registeredUser.firstName}&lastName=${registeredUser.lastName}&email=${registeredUser.email}`
				);
				//setIsSignUp(false);
			} else {
				const loginValues = values as LoginFormValues;
				const loggedInUser = await loginUser(loginValues);

				if (!loggedInUser.isVerified) {
					alert(
						"Ваш аккаунт еще не подтвержден. Пожалуйста, проверьте свою почту."
					);
					router.push(
						`/verify-email?id=${loggedInUser.id}&firstName=${loggedInUser.firstName}&lastName=${loggedInUser.lastName}&email=${loggedInUser.email}`
					);
				} else {
					alert("Вход выполнен успешно!");
					login(loggedInUser);
					router.push("/dashboard");
				}
			}
		} catch (err: unknown) {
			console.error("Ошибка авторизации/регистрации:", err);
			if (err instanceof Error) {
				setError(err.message || "Ошибка авторизации/регистрации:");
			} else {
				setError("Произошла неизвестная ошибка. Попробуйте еще раз.");
			}
		} finally {
			setLoading(false);
		}
	};

	const recaptchaErrors = form.formState
		.errors as FieldErrors<RegisterFormValues>;

	return (
		<div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
			<h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
				{isSignUp ? "Регистрация" : "Вход"}
			</h2>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-4"
				>
					{isSignUp && (
						<>
							<FormField
								control={form.control}
								name="firstName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Имя</FormLabel>
										<FormControl>
											<Input
												placeholder="Ваше имя"
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
								name="lastName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Фамилия</FormLabel>
										<FormControl>
											<Input
												placeholder="Ваша фамилия"
												{...field}
												disabled={isLoading}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</>
					)}
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										type="email"
										placeholder="email@example.com"
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
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Пароль</FormLabel>
								<FormControl>
									<PasswordInput
										placeholder="********"
										{...field}
										disabled={isLoading}
									/>
								</FormControl>
								{!isSignUp && (
									<div className="text-right text-sm mt-1">
										<button
											type="button"
											onClick={() =>
												router.push("/forgot-password")
											}
											className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer link-hover-underline"
											disabled={isLoading}
										>
											Забыли пароль?
										</button>
									</div>
								)}
								<FormMessage />
							</FormItem>
						)}
					/>

					{isSignUp && ( // Показываем только для формы регистрации
						<FormField
							control={form.control}
							name="confirmPassword" // Имя поля, как в схеме
							render={({ field }) => (
								<FormItem>
									<FormLabel>Подтвердите пароль</FormLabel>
									<FormControl>
										<PasswordInput
											placeholder="********"
											{...field}
											disabled={isLoading}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					)}

					{isSignUp && (
						<div className="flex justify-center mt-4 flex-col items-center">
							<ReCAPTCHA
								sitekey={
									process.env
										.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""
								}
								onChange={handleRecaptchaChange}
								onExpired={() => {
									setRecaptchaToken(null);
									form.setValue("recaptchaToken", "");
								}}
								onErrored={() =>
									setError(
										"Ошибка CAPTCHA. Пожалуйста, попробуйте еще раз."
									)
								}
							/>
							{recaptchaErrors.recaptchaToken && (
								<p className="text-sm text-red-600 dark:text-red-400 mt-2">
									{recaptchaErrors.recaptchaToken.message}
								</p>
							)}
						</div>
					)}

					{error && ( // Ошибки от бэкенда или общие ошибки
						<p className="text-sm text-red-600 dark:text-red-400 text-center">
							{error}
						</p>
					)}
					<Button
						type="submit"
						className="w-full"
						disabled={isLoading || (isSignUp && !recaptchaToken)}
					>
						{isLoading
							? isSignUp
								? "Регистрация..."
								: "Вход..."
							: isSignUp
							? "Зарегистрироваться"
							: "Войти"}
					</Button>
				</form>
			</Form>

			<p className="text-sm text-center text-gray-600 dark:text-gray-400">
				{isSignUp ? "Уже есть аккаунт?" : "Нет аккаунта?"}
				<button
					type="button"
					onClick={() => {
						setIsSignUp(!isSignUp);
					}}
					className="ml-1 font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
					disabled={isLoading}
				>
					{isSignUp ? "Войти" : "Зарегистрироваться"}
				</button>
			</p>
		</div>
	);
}
