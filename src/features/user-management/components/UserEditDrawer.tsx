"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/shared/ui/sheet";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { changeUser } from "../api/user-api";
import { User } from "@/features/auth/model/types";
import { UserEditFormValues, userEditSchema } from "../model/schemas";
import { useRoleStore } from "../stores/role-store";
import { DatePickerInput } from "@/shared/ui/date-picker-input";

interface UserEditDrawerProps {
	user: User | null;
	isOpen: boolean;
	onClose: () => void;
	onUserUpdated: () => void;
}

export function UserEditDrawer({
	user,
	isOpen,
	onClose,
	onUserUpdated,
}: UserEditDrawerProps) {
	const {
		roles,
		isLoading: rolesLoading,
		error: rolesError,
		getRoleDisplayName,
		getRoleNameByDisplayName,
	} = useRoleStore();
	const form = useForm<UserEditFormValues>({
		resolver: zodResolver(userEditSchema),
		defaultValues: {
			userId: "",
			firstName: "",
			lastName: "",
			role: "",
			roleExpiration: null,
		},
		mode: "onBlur",
	});

	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (user) {
			form.reset({
				userId: user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				role: getRoleDisplayName(user.role.name),
				roleExpiration: user.roleExpiration
					? new Date(user.roleExpiration)
					: null,
			});
		} else {
			form.reset();
		}
	}, [user, form, getRoleDisplayName]);

	const onSubmit = async (values: UserEditFormValues) => {
		setIsLoading(true);
		try {
			const roleNameForApi = getRoleNameByDisplayName(values.role);
			if (!roleNameForApi) {
				throw new Error("Выбранная роль не найдена.");
			}

			const payload: UserEditFormValues = {
				userId: values.userId,
				firstName: values.firstName,
				lastName: values.lastName,
				role: roleNameForApi,
				roleExpiration: values.roleExpiration ?? null,
			};

			const response = await changeUser(payload);
			toast.success(
				response.message || "Данные пользователя успешно обновлены."
			);
			onUserUpdated();
			onClose();
		} catch (error: unknown) {
			if (error instanceof Error)
				toast.error("Ошибка при обновлении пользователя.", {
					description:
						error.message || "Произошла неизвестная ошибка.",
				});
		} finally {
			setIsLoading(false);
		}
	};

	const availableDisplayNames = roles.map((role) => role.displayName);

	return (
		<Sheet open={isOpen} onOpenChange={onClose}>
			<SheetContent
				className="w-full h-fit sm:max-w-md mt-16 md:mt-20 lg:mt-24 mb-4 mr-4 rounded-xl shadow-2xl animate-fade-right animate-duration-500 animate-ease-in-out"
				side="right"
			>
				<SheetHeader>
					<SheetTitle>
						{user
							? `Редактировать ${user.firstName} ${user.lastName}`
							: "Редактировать пользователя"}
					</SheetTitle>
					<SheetDescription>
						Измените информацию о пользователе и его роль.
					</SheetDescription>
				</SheetHeader>
				{user ? (
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-6 p-6 h-full flex flex-col"
						>
							<FormField
								control={form.control}
								name="firstName"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Имя</FormLabel>
										<FormControl>
											<Input {...field} />
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
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="role"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Роль</FormLabel>
										<Select
											onValueChange={field.onChange}
											value={field.value}
											disabled={rolesLoading}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Выберите роль" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{rolesLoading ? (
													<SelectItem
														value="loading"
														disabled
													>
														Загрузка ролей...
													</SelectItem>
												) : rolesError ? (
													<SelectItem
														value="error"
														disabled
													>
														Ошибка загрузки ролей
													</SelectItem>
												) : (
													availableDisplayNames.map(
														(displayName) => (
															<SelectItem
																key={
																	displayName
																}
																value={
																	displayName
																}
															>
																{displayName}
															</SelectItem>
														)
													)
												)}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="roleExpiration"
								render={({ field }) => (
									<DatePickerInput<
										UserEditFormValues,
										"roleExpiration"
									>
										field={field}
										label="Дата истечения роли (опционально)"
										placeholder="Выберите дату"
										fromYear={new Date().getFullYear()}
										toYear={new Date().getFullYear() + 5}
										disabled={{
											before: new Date(),
										}}
									/>
								)}
							/>
							<div className="text-sm text-muted-foreground mb-2">
								Установите дату, после которой роль будет
								неактивна. Оставьте пустым для{" "}
								<span className="text-red-600 font-medium">
									бессрочной
								</span>{" "}
								роли.
							</div>
							<div className="mt-auto pt-6">
								<Button
									type="submit"
									className="w-full"
									disabled={isLoading || rolesLoading}
								>
									{isLoading && (
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									)}
									Сохранить изменения
								</Button>
							</div>
						</form>
					</Form>
				) : (
					<p className="text-center text-muted-foreground mt-8">
						Выберите пользователя для редактирования.
					</p>
				)}
			</SheetContent>
		</Sheet>
	);
}
