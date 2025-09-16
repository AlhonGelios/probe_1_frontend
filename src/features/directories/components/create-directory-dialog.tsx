"use client";

import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
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

interface FormData {
	name: string;
	displayName: string;
	description: string;
	isSystem: boolean;
	isActive: boolean;
	year: number;
}

interface CreateDirectoryDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	formData: FormData;
	setFormData: React.Dispatch<React.SetStateAction<FormData>>;
	onCreate: () => void;
}

export function CreateDirectoryDialog({
	isOpen,
	onOpenChange,
	formData,
	setFormData,
	onCreate,
}: CreateDirectoryDialogProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>
				<Button variant="outline">
					Добавить справочник... <Plus className="h-8 w-8" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Создать справочник</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
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
						<Label htmlFor="name">Системное название</Label>
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
						<Label htmlFor="description">Описание</Label>
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
						<Label htmlFor="isSystem">Системный справочник</Label>
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
				<Button onClick={onCreate}>Создать</Button>
			</DialogContent>
		</Dialog>
	);
}
