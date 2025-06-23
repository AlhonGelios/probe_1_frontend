"use client";

import { Button } from "@/shared/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import { useState } from "react";
import { logoutAllDevices } from "../api/edit-profile-api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function LogoutAllDeviceCard() {
	const [isLoading, setIsLoading] = useState(false);

	const router = useRouter();

	const handleLogoutAllDevices = async () => {
		setIsLoading(true);
		try {
			const response = await logoutAllDevices();
			toast.success(
				response.message || "Вы успешно вышли со всех устройств"
			);
			setTimeout(() => {
				router.push("/welcome");
			}, 2000);
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(
					"Ошибка при выходе со всех устройств. Обратитесь к администратору системы.",
					{
						description:
							error.message ||
							"Произошла неизвестная ошибка при выходе .",
					}
				);
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="bg-card text-card-foreground p-6 rounded-lg shadow-md h-full flex flex-col justify-between">
			<CardHeader className="p-0 pb-4">
				<CardTitle className="text-2xl font-semibold">
					Управление сессиями
				</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				<CardDescription className="mb-4">
					Вы можете завершить все активные сессии на всех устройствах
					(включая это).
				</CardDescription>
				<Button
					onClick={handleLogoutAllDevices}
					variant="destructive"
					className="w-full"
					disabled={isLoading}
				>
					{isLoading && (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					)}
					Выйти со всех устройств
				</Button>
			</CardContent>
		</Card>
	);
}
