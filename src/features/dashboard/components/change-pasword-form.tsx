"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";
import {
	PasswordChangeFormValues,
	passwordChangeSchema,
} from "@/features/dashboard/model/shemas";

export default function ChangePasswordForm() {
	const form = useForm<PasswordChangeFormValues>({
		resolver: zodResolver(passwordChangeSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmNewPassword: "",
		},
	});

	const onSubmit = async (values: PasswordChangeFormValues) => {
		try {
			await changePassword({
				currentPassword: values.currentPassword,
				newPassword: values.newPassword,
			});

			// <-- Изменено: вызовы toast
			toast.success("Пароль успешно изменен.", {
				description: "Вы можете войти с новым паролем.",
			});

			form.reset({
				currentPassword: "",
				newPassword: "",
				confirmNewPassword: "",
			});
		} catch (error: any) {
			// <-- Изменено: вызовы toast
			toast.error("Ошибка смены пароля.", {
				description:
					error.message ||
					"Произошла неизвестная ошибка при смене пароля.",
			});
		}
	};

	return (
		<div className="container max-w-lg mx-auto py-8">
			<h1 className="text-3xl font-bold mb-6 text-center text-foreground">
				Редактирование профиля
			</h1>

			<div className="bg-card text-card-foreground p-6 rounded-lg shadow-md">
				<h2 className="text-2xl font-semibold mb-4">Смена пароля</h2>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="currentPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Текущий пароль</FormLabel>
									<FormControl>
										<Input type="password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="newPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Новый пароль</FormLabel>
									<FormControl>
										<Input type="password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="confirmNewPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Подтвердите новый пароль
									</FormLabel>
									<FormControl>
										<Input type="password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" className="w-full">
							Сменить пароль
						</Button>
					</form>
				</Form>
			</div>
		</div>
	);
}
