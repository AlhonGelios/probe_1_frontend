"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState, useContext } from "react";
import { Separator } from "@/shared/ui/separator";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useYearStore } from "@/features/header/model/year-store";
import { getAllDirectories, createDirectory } from "../api/dictionaries-api";
import { toast } from "sonner";
import { CreateDirectoryDialog } from "./create-directory-dialog";
import { DirectoriesContext } from "@/app/(core)/directories/layout";

export default function DictAsidePanel() {
	const { year } = useYearStore();
	const params = useParams();
	const selectedDirectoryId = params.id as string | undefined;
	const [isLoading, setIsLoading] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const { dictList, setDictList } = useContext(DirectoriesContext);

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
	}, [year, setDictList]);

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
			toast.error("Не удалось создать справочник.", {
				description: `${error}`,
			});
		}
	};

	return (
		<>
			<aside className="bg-card p-6 -mx-4 flex flex-col grow border rounded-lg shadow-sm relative">
				<h2 className="text-xl font-bold">Общие справочники</h2>
				<Separator className="my-4" />
				<nav className="flex flex-col gap-4">
					<CreateDirectoryDialog
						isOpen={isDialogOpen}
						onOpenChange={setIsDialogOpen}
						formData={formData}
						setFormData={setFormData}
						onCreate={handleCreateDirectory}
					/>
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
