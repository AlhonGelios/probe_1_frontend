"use client";

import React, { useState, createContext } from "react";
import { Button } from "@/shared/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DictAsidePanel from "@/features/directories/components/aside-panel-directories";
import { Directory } from "@/features/directories/types";

// Создаем контекст для передачи setDictList
export const DirectoriesContext = createContext<{
	dictList: Directory[];
	setDictList: React.Dispatch<React.SetStateAction<Directory[]>>;
}>({
	dictList: [],
	setDictList: () => {},
});

export default function DirectoriesLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [isAsideVisible, setIsAsideVisible] = useState(true);
	const [dictList, setDictList] = useState<Directory[]>([]);

	return (
		<DirectoriesContext.Provider value={{ dictList, setDictList }}>
			<div className="flex flex-col md:flex-row w-full gap-10">
				<Button
					variant={"secondary"}
					onClick={() => setIsAsideVisible(!isAsideVisible)}
					className="absolute top-1/2 left-0 p-2 rounded-r-lg rounded-l-none transition-colors z-50 w-5 h-16 bg-gray-200  hover:bg-gray-300"
				>
					{isAsideVisible ? <ChevronLeft /> : <ChevronRight />}
				</Button>
				{isAsideVisible && (
					<div className="flex grow items-stretch max-w-1/6 md:w-[300px] relative">
						<DictAsidePanel />
					</div>
				)}
				<div
					className={`flex grow transition-all duration-300 items-stretch ${
						isAsideVisible ? "flex-1" : "w-full"
					}`}
				>
					{children}
				</div>
			</div>
		</DirectoriesContext.Provider>
	);
}
