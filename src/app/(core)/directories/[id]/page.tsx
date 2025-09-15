"use client";

import { useParams } from "next/navigation";
import DirectoryContent from "@/features/directories/components/directory-content";
import DictAsidePanel from "@/features/directories/components/aside-panel-directories";
import { useState } from "react";

export default function DirectoryPage() {
	const { id } = useParams();
	const [isAsideVisible, setIsAsideVisible] = useState(true);

	return (
		<div className="flex flex-col md:flex-row w-full gap-10">
			{isAsideVisible && (
				<div className="flex grow items-stretch max-w-1/6 md:w-[300px] transition-all duration-300">
					<DictAsidePanel
						isAsideVisible={isAsideVisible}
						setIsAsideVisible={setIsAsideVisible}
					/>
				</div>
			)}
			<div
				className={`flex grow transition-all duration-300 items-stretch ${
					isAsideVisible ? "flex-1" : "w-full"
				}`}
			>
				<DirectoryContent directoryId={id as string} />
			</div>
		</div>
	);
}
