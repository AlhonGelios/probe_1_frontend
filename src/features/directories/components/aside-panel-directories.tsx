"use client";

import { Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/shared/ui/button";
import { getAllDirectories } from "../api/dictionaries-api";
import { Directory } from "../types";
import Link from "next/link";

export default function DictAsidePanel() {
	const [isLoading, setIsLoading] = useState(false);
	const [dictList, setDictList] = useState<Directory[]>([]);

	useEffect(() => {
		setIsLoading(true);
		const fetchDictionaries = async () => {
			const directoriesList = await getAllDirectories();
			setDictList(directoriesList);
			setIsLoading(false);
		};
		fetchDictionaries();
	}, []);

	return (
		<aside className="h-full bg-card p-6 -mx-4 flex flex-col border rounded-lg shadow-sm">
			<h2 className="text-xl font-bold mb-6">Общие справочники</h2>
			<nav className="flex flex-col gap-4">
				<Button variant="outline">
					Добавить справочник... <Plus className="h-8 w-8" />
				</Button>
				{isLoading ? (
					<Loader2 className="mr-2 h-4 w-4 animate-spin" />
				) : dictList.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						Нет справочников
					</p>
				) : (
					dictList.map((dict) => (
						<ul
							key={dict.id}
							className="list-none pl-6 space-y-2 text-sm text-muted-foreground"
						>
							<li>
								<Link
									href={""}
									className="border-b-2 border-transparent hover:border-current transition-all duration-200"
								>
									{dict.displayName}
								</Link>
							</li>
						</ul>
					))
				)}
			</nav>
		</aside>
	);
}
