"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { Loader2 } from "lucide-react";
import { updateProfile } from "../api/edit-profile-api";

import { ProfileEditFormValues, profileEditSchema } from "../model/shemas";
import { useAuthStore } from "@/features/auth/model/auth-store";
import { useShallow } from "zustand/shallow";

export function EditProfileForm() {
	const { user, updateUser } = useAuthStore(
		useShallow((state) => ({
			user: state.user,
			updateUser: state.updateUser,
		}))
	);

	const initialData = useMemo(
		() => ({
			lastName: user?.lastName,
			firstName: user?.firstName,
		}),
		[user]
	);

	const form = useForm<ProfileEditFormValues>({
		resolver: zodResolver(profileEditSchema),
		defaultValues: initialData,
		mode: "onSubmit",
	});

	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		form.reset(initialData);
	}, [initialData, form]);

	const onSubmit = async (values: ProfileEditFormValues) => {
		setIsLoading(true);
		try {
			const response = await updateProfile(values);
			toast.success(response.message || "Профиль успешно обновлен.");

			if (response.user) {
				updateUser(response.user);
			}
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error("Ошибка обновления профиля.", {
					description:
						error.message ||
						"Произошла неизвестная ошибка при обновлении профиля.",
				});
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="max-w-md bg-card text-card-foreground p-6 rounded-lg shadow-xl/30 flex flex-col">
			<h2 className="text-2xl font-semibold mb-4">
				Редактировать профиль
			</h2>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-4"
				>
					<div className="space-y-4">
						<FormField
							control={form.control}
							name="firstName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Имя</FormLabel>
									<FormControl>
										<Input type="text" {...field} />
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
										<Input type="text" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<Button
						type="submit"
						className="w-full"
						disabled={isLoading}
					>
						{isLoading && (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						)}
						Сохранить изменения
					</Button>
				</form>
			</Form>
		</div>
	);
}
