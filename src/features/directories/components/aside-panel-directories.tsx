"use client";

import { Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useYearStore } from "@/features/header/model/year-store";
import { getAllDirectories, createDirectory } from "../api/dictionaries-api";
import { Directory } from "../types";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import { toast } from "sonner";

export default function DictAsidePanel() {
	const { year } = useYearStore();
	const params = useParams();
	const selectedDirectoryId = params.id as string | undefined;
	const [isLoading, setIsLoading] = useState(false);
	const [dictList, setDictList] = useState<Directory[]>([]);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	interface FormData {
		name: string;
		displayName: string;
		description: string;
		isSystem: boolean;
		isActive: boolean;
		year: number;
	}

	const [formData, setFormData] = useState<FormData>({
		name: "",
		displayName: "",
		description: "",
		isSystem: false,
		isActive: true,
		year: parseInt(year, 10),
	});

	useEffect(() => {
		setIsLoading(true);
		const fetchDictionaries = async () => {
			try {
				const directoriesList = await getAllDirectories(year);
				setDictList(directoriesList);
			} catch (error) {
				console.error("Error fetching directories:", error);
				toast.error("Не удалось загрузить справочники");
			} finally {
				setIsLoading(false);
			}
		};
		fetchDictionaries();
	}, [year]);

	const handleCreateDirectory = async () => {
		try {
			const newDirectory = await createDirectory(formData);
			setDictList([...dictList, newDirectory]);
			setFormData({
				name: "",
				displayName: "",
				description: "",
				isSystem: false,
				isActive: true,
				year: parseInt(year, 10),
			});
			setIsDialogOpen(false);
			toast.success("Справочник успешно создан");
		} catch (error) {
			console.error("Error creating directory:", error);
			toast.error("Не удалось создать справочник");
		}
	};

	return (
		<>
			<aside className="bg-card p-6 -mx-4 flex flex-col grow border rounded-lg shadow-sm relative">
				<h2 className="text-xl font-bold">Общие справочники</h2>
				<Separator className="my-4" />
				<nav className="flex flex-col gap-4">
					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger asChild>
							<Button variant="outline">
								Добавить справочник...{" "}
								<Plus className="h-8 w-8" />
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Создать справочник</DialogTitle>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								<div className="grid gap-2">
									<Label htmlFor="name">
										Системное название
									</Label>
									<Input
										id="name"
										value={formData.name}
										onChange={(e) =>
											setFormData({
												...formData,
												name: e.target.value,
											})
										}
										placeholder="Ex. EDUCATION_LEVEL    REGION    COUNTRY"
										required
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="displayName">
										Отображаемое название
									</Label>
									<Input
										id="displayName"
										value={formData.displayName}
										onChange={(e) =>
											setFormData({
												...formData,
												displayName: e.target.value,
											})
										}
										placeholder="Введите отображаемое название"
										required
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="description">
										Описание
									</Label>
									<Input
										id="description"
										value={formData.description}
										onChange={(e) =>
											setFormData({
												...formData,
												description: e.target.value,
											})
										}
										placeholder="Введите описание (опционально)"
									/>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="isSystem"
										checked={formData.isSystem}
										onCheckedChange={(checked) =>
											setFormData({
												...formData,
												isSystem: !!checked,
											})
										}
									/>
									<Label htmlFor="isSystem">
										Системный справочник
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox
										id="isActive"
										checked={formData.isActive}
										onCheckedChange={(checked) =>
											setFormData({
												...formData,
												isActive: !!checked,
											})
										}
									/>
									<Label htmlFor="isActive">Активен</Label>
								</div>
							</div>
							<Button onClick={handleCreateDirectory}>
								Создать
							</Button>
						</DialogContent>
					</Dialog>
					{isLoading ? (
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
					) : dictList.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							Нет справочников...
						</p>
					) : (
						<ul className="list-none pl-2 space-y-2 text-sm text-muted-foreground">
							{dictList.map((dict) => (
								<li key={dict.id}>
									<Link
										href={`/directories/${dict.id}`}
										className={`flex py-1 px-5 border-b-2 border-transparent rounded-md hover:bg-gray-100 transition-all duration-400 ${
											dict.id === selectedDirectoryId
												? "underline"
												: ""
										}`}
									>
										{dict.displayName}
									</Link>
								</li>
							))}
						</ul>
					)}
				</nav>
			</aside>
		</>
	);
}
