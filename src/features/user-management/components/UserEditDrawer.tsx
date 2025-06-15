"use client";

import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ru } from "date-fns/locale"; // Для локализации даты, если нужно

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
	FormDescription,
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
import { Calendar } from "@/shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { cn } from "@/shared/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

// import { UserEditFormValues } from "../types";
import { changeUser } from "../api/user-api";
import { User } from "@/features/auth/model/types";

interface UserEditDrawerProps {
	user: User | null;
	isOpen: boolean;
	onClose: () => void;
	onUserUpdated: () => void; // Колбэк для обновления списка пользователей
	availableRoles: string[]; // Список всех доступных ролей
}

const userEditSchema = z.object({
	userId: z.string().min(1, "ID пользователя обязателен"),
	firstName: z
		.string()
		.min(1, "Имя не может быть пустым")
		.max(50, "Имя слишком длинное"),
	lastName: z
		.string()
		.min(1, "Фамилия не может быть пустой")
		.max(50, "Фамилия слишком длинная"),
	role: z.string().min(1, "Роль обязательна"),
	roleExpiration: z.date().nullable().optional(), // Дата может быть null
});

type UserEditFormValues = z.infer<typeof userEditSchema>;

export function UserEditDrawer({
	user,
	isOpen,
	onClose,
	onUserUpdated,
	availableRoles,
}: UserEditDrawerProps) {
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
				role: user.role.name,
				roleExpiration:
					user.roleExpiration instanceof Date
						? user.roleExpiration
						: user.roleExpiration
						? new Date(user.roleExpiration)
						: null,
			});
		} else {
			form.reset(); // Очищаем форму, если пользователя нет
		}
	}, [user, form]);

	const onSubmit = async (values: UserEditFormValues) => {
		setIsLoading(true);
		try {
			// Преобразование roleExpiration для API, если оно есть
			// const payload = {
			// 	...values,
			// 	roleExpiration: values.roleExpiration, // Date объект будет преобразован в ISOString в api/user-api.ts
			// };

			const response = await changeUser({
				...values,
				roleExpiration: values.roleExpiration ?? null,
			});
			toast.success(
				response.message || "Данные пользователя успешно обновлены."
			);
			onUserUpdated(); // Вызываем колбэк для обновления списка
			onClose(); // Закрываем drawer
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

	return (
		<Sheet open={isOpen} onOpenChange={onClose}>
			<SheetContent className="w-full sm:max-w-md">
				{" "}
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
							className="space-y-6 py-4 h-full flex flex-col"
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
											defaultValue={field.value}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Выберите роль" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{availableRoles.map((role) => (
													<SelectItem
														key={role}
														value={role}
													>
														{role}
													</SelectItem>
												))}
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
									<FormItem className="flex flex-col">
										<FormLabel>
											Дата истечения роли (опционально)
										</FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={cn(
															"w-full pl-3 text-left font-normal",
															!field.value &&
																"text-muted-foreground"
														)}
													>
														{field.value ? (
															format(
																field.value,
																"PPP",
																{ locale: ru }
															) // 'PPP' -> 25 мая 2023 г.
														) : (
															<span>
																Выберите дату
															</span>
														)}
														<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent
												className="w-auto p-0"
												align="start"
											>
												<Calendar
													mode="single"
													selected={
														field.value || undefined
													}
													onSelect={field.onChange}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
										<FormDescription>
											Установите дату, после которой роль
											пользователя будет неактивна.
											Оставьте пустым для бессрочной роли.
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="mt-auto pt-6">
								{" "}
								{/* Кнопка прижата к низу */}
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
