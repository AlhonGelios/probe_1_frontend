"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { LoginResponse } from "../model/types";
import { RecaptchaComponent } from "@/shared/ui/recaptcha";

export function AuthForm() {
	const [isSignUp, setIsSignUp] = useState(false);
	const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
	const [backendRequiresCaptcha, setBackendRequiresCaptcha] = useState(false);

	const recaptchaRef = useRef<ReCAPTCHA>(null) as React.RefObject<ReCAPTCHA>;

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

	useEffect(() => {
		form.reset();
		setRecaptchaToken(null);
		setError(null);
		setBackendRequiresCaptcha(false);
		if (recaptchaRef.current) {
			recaptchaRef.current.reset();
		}
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
			} else {
				const loginValues = values as LoginFormValues;
				if (backendRequiresCaptcha && !recaptchaToken) {
					setError("Пожалуйста, подтвердите, что вы не робот.");
					setLoading(false);
					return;
				}

				const response: LoginResponse = await loginUser(loginValues);

				if (response.user) {
					alert(response.message || "Вход выполнен успешно!");
					login(response.user);
					setBackendRequiresCaptcha(false);
					setRecaptchaToken(null);
					router.push("/dashboard");
					if (recaptchaRef.current) {
						recaptchaRef.current.reset();
						console.log(
							"ReCAPTCHA widget reset on successful login."
						);
					}
				} else {
					setError(
						response.message || "Ошибка входа. Попробуйте еще раз."
					);
					if (response.requiresCaptcha) {
						console.log(
							"Backend explicitly requires CAPTCHA. Setting backendRequiresCaptcha to true."
						);
						setBackendRequiresCaptcha(true);
						setRecaptchaToken(null);
						form.setValue("recaptchaToken", "");
						if (recaptchaRef.current) {
							recaptchaRef.current.reset();
							console.log(
								"ReCAPTCHA widget reset due to backend requiring CAPTCHA."
							);
						}
					}
				}
			}
		} catch (err: unknown) {
			console.error("Неожиданная ошибка:", err);
			if (err instanceof Error) {
				setError(
					err.message ||
						"Произошла неизвестная ошибка сети. Попробуйте еще раз."
				);
			}
			setRecaptchaToken(null);
			form.setValue("recaptchaToken", "");
			if (recaptchaRef.current) {
				recaptchaRef.current.reset();
				console.log("ReCAPTCHA widget reset due to submit error.");
			}
		} finally {
			setLoading(false);
		}
	};

	const recaptchaErrors = form.formState
		.errors as FieldErrors<RegisterFormValues>;
	const loginRecaptchaErrors = form.formState
		.errors as FieldErrors<LoginFormValues>;

	const shouldShowCaptcha = isSignUp || backendRequiresCaptcha;
	const isButtonDisabled =
		isLoading || (shouldShowCaptcha && !recaptchaToken);

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

					{isSignUp && (
						<FormField
							control={form.control}
							name="confirmPassword"
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

					{shouldShowCaptcha && (
						<div className="flex justify-center mt-4 flex-col items-center">
							<RecaptchaComponent
								recaptchaRef={recaptchaRef}
								sitekey={
									process.env
										.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""
								}
								onRecaptchaChange={handleRecaptchaChange}
								onRecaptchaError={(msg) => setError(msg)}
							/>
							{isSignUp && recaptchaErrors.recaptchaToken && (
								<p className="text-sm text-red-600 dark:text-red-400 mt-2">
									{recaptchaErrors.recaptchaToken.message}
								</p>
							)}
							{!isSignUp &&
								backendRequiresCaptcha &&
								loginRecaptchaErrors.recaptchaToken && (
									<p className="text-sm text-red-600 dark:text-red-400 mt-2">
										{
											loginRecaptchaErrors.recaptchaToken
												.message
										}
									</p>
								)}
						</div>
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
					className="ml-1 font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer link-hover-underline"
					disabled={isLoading}
				>
					{isSignUp ? "Войти" : "Зарегистрироваться"}
				</button>
			</p>
		</div>
	);
}
