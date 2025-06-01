"use client";

import React, { useState } from "react";
import { Button } from "@/shared/ui/button";
import { useRouter } from "next/navigation";
import { loginUser, registerUser } from "../api/auth-api";
import { useAuthStore } from "../model/auth-store";
import { useShallow } from "zustand/shallow";

export function AuthForm() {
	const [isSignUp, setIsSignUp] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");

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

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setLoading(true);
		setError(null);

		try {
			if (isSignUp) {
				const registeredUser = await registerUser({
					email,
					password,
					firstName,
					lastName,
				});
				console.log("Пользователь зарегистрирован:", registeredUser);
				alert("Регистрация прошла успешно! Теперь вы можете войти.");
				setEmail("");
				setPassword("");
				setFirstName("");
				setLastName("");
				setIsSignUp(false);
			} else {
				const loggedInUser = await loginUser({
					email,
					password,
				});
				console.log("Пользователь авторизован:", loggedInUser);
				alert("Вход выполнен успешно!");
				login(loggedInUser);
				router.push("/dashboard");
			}
		} catch (err: unknown) {
			console.error("Ошибка авторизации/регистрации:", err);
			if (err instanceof Error) {
				setError(
					err.message ||
						"Произошла неизвестная ошибка. Попробуйте еще раз."
				);
			} else {
				setError("Произошла неизвестная ошибка. Попробуйте еще раз.");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
			<h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
				{isSignUp ? "Регистрация" : "Вход"}
			</h2>
			<form onSubmit={handleSubmit} className="space-y-4">
				{isSignUp && ( // Показываем поля имени и фамилии только при регистрации
					<>
						<div>
							<label
								htmlFor="firstName"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Имя
							</label>
							<input
								type="text"
								id="firstName"
								className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								required // Делаем поле обязательным
								disabled={isLoading}
							/>
						</div>
						<div>
							<label
								htmlFor="lastName"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Фамилия
							</label>
							<input
								type="text"
								id="lastName"
								className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								required // Делаем поле обязательным
								disabled={isLoading}
							/>
						</div>
					</>
				)}
				<div>
					<label
						htmlFor="email"
						className="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Email
					</label>
					<input
						type="email"
						id="email"
						className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						disabled={isLoading}
					/>
				</div>
				<div>
					<label
						htmlFor="password"
						className="block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Пароль
					</label>
					<input
						type="password"
						id="password"
						className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						disabled={isLoading}
					/>
				</div>
				{error && (
					<p className="text-sm text-red-600 dark:text-red-400 text-center">
						{error}
					</p>
				)}
				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading
						? isSignUp
							? "Регистрация..."
							: "Вход..."
						: isSignUp
						? "Зарегистрироваться"
						: "Войти"}
				</Button>
			</form>
			<p className="text-sm text-center text-gray-600 dark:text-gray-400">
				{isSignUp ? "Уже есть аккаунт?" : "Нет аккаунта?"}
				<button
					type="button"
					onClick={() => {
						setIsSignUp(!isSignUp);
						setError(null);
						// Очищаем поля при переключении между формами
						setEmail("");
						setPassword("");
						setFirstName("");
						setLastName("");
					}}
					className="ml-1 font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
					disabled={isLoading}
				>
					{isSignUp ? "Войти" : "Зарегистрироваться"}
				</button>
			</p>
		</div>
	);
}
