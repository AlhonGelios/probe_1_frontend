// app/admission-rules/page.tsx (или pages/admission-rules.tsx)
"use client"; // Если используете App Router и компоненты клиента

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { Button } from "@/shared/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { Separator } from "@/shared/ui/separator";
import { Input } from "@/shared/ui/input"; // Возможно, понадобится для добавления
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import {
	addEducationLevels,
	findAllEducationLevels,
} from "@/features/admission-rules/api/admission-rules-api";
import { EducationLevel } from "@/features/admission-rules/types";
import { toast } from "sonner";

export default function AdmissionRulesPage() {
	const [educationLevels, setEducationLevels] = useState<EducationLevel[]>(
		[]
	);
	const [selectedEducationLevel, setSelectedEducationLevel] = useState<
		string | undefined
	>(undefined);
	const [newEducationLevelName, setNewEducationLevelName] = useState("");
	const [isAddLevelDialogOpen, setIsAddLevelDialogOpen] = useState(false);

	useEffect(() => {
		const fetchEducationLevels = async () => {
			try {
				const educationLevelsArr = await findAllEducationLevels();

				setEducationLevels(educationLevelsArr);
				if (educationLevelsArr.length > 0) {
					setSelectedEducationLevel(educationLevelsArr[0].id);
				}
			} catch (error) {
				console.error(
					"Ошибка при получении уровней образования:",
					error
				);
			}
		};

		fetchEducationLevels();
	}, []);

	const handleAddEducationLevel = async () => {
		if (!newEducationLevelName.trim()) return;

		try {
			const newLevel = await addEducationLevels(newEducationLevelName);

			setEducationLevels((prev) => [...prev, newLevel]);
			setSelectedEducationLevel(newLevel.id);
			setNewEducationLevelName("");
			setIsAddLevelDialogOpen(false);

			toast.success(
				`Добавлен новый уровень образования: ${newLevel.name}`
			);
		} catch (error) {
			toast.error(`Ошибка при добавлении уровня образования: ${error}`);
		}
	};

	return (
		<div className="container mx-auto py-4">
			<div className=" flex flex-col sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-wrap items-center gap-4 mb-4  p-4 border rounded-lg bg-card w-full">
					<div className="flex items-center gap-2">
						<Label
							htmlFor="education-level-select"
							className="whitespace-nowrap"
						>
							Уровень образования:
						</Label>
						<Select
							value={selectedEducationLevel}
							onValueChange={setSelectedEducationLevel}
						>
							<SelectTrigger
								id="education-level-select"
								className="w-[200px]"
							>
								<SelectValue placeholder="Выберите уровень" />
							</SelectTrigger>
							<SelectContent>
								{educationLevels.map((level) => (
									<SelectItem key={level.id} value={level.id}>
										{level.name}
									</SelectItem>
								))}
								<Separator className="my-1" />
								<Dialog
									open={isAddLevelDialogOpen}
									onOpenChange={setIsAddLevelDialogOpen}
								>
									<DialogTrigger asChild>
										<div className="flex cursor-pointer items-center justify-between px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
											<span>Добавить новый...</span>
											<PlusCircle className="ml-2 h-4 w-4" />
										</div>
									</DialogTrigger>
									<DialogContent className="sm:max-w-[425px]">
										<DialogHeader>
											<DialogTitle>
												Добавить уровень образования
											</DialogTitle>
											<DialogDescription>
												Введите название нового уровня
												образования.
											</DialogDescription>
										</DialogHeader>
										<div className="grid gap-4 py-4">
											<div className="grid grid-cols-4 items-center gap-4">
												<Label
													htmlFor="new-level-name"
													className="text-right"
												>
													Название
												</Label>
												<Input
													id="new-level-name"
													value={
														newEducationLevelName
													}
													onChange={(e) =>
														setNewEducationLevelName(
															e.target.value
														)
													}
													className="col-span-3"
													placeholder="Например, 'Докторантура'"
												/>
											</div>
										</div>
										<DialogFooter>
											<Button
												variant="outline"
												onClick={() =>
													setIsAddLevelDialogOpen(
														false
													)
												}
											>
												Отмена
											</Button>
											<Button
												onClick={
													handleAddEducationLevel
												}
											>
												Добавить
											</Button>
										</DialogFooter>
									</DialogContent>
								</Dialog>
							</SelectContent>
						</Select>
					</div>
					<Separator
						orientation="vertical"
						className="h-6 hidden sm:block"
					/>{" "}
					<Link href="/admission-campaigns" passHref>
						<Button variant="outline">Приёмные кампании</Button>
					</Link>
				</div>
			</div>
			<div className="bg-card p-6 rounded-lg shadow-sm min-h-[400px]">
				<h2 className="text-2xl font-semibold">
					Правила приема -{" "}
					{educationLevels.find(
						(level) => level.id === selectedEducationLevel
					)?.name || "выбранного уровня"}
				</h2>
				<p className="text-muted-foreground">
					Здесь будет отображаться контент правил приема, зависящий от
					выбранного уровня образования и, возможно, приемной
					кампании.
				</p>
				{/* Здесь будет динамический контент */}
			</div>
		</div>
	);
}
