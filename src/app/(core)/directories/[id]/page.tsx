"use client";

import { useParams } from "next/navigation";
import DirectoryContent from "@/features/directories/components/directory-content";
import DictAsidePanel from "@/features/directories/components/aside-panel-directories";

export default function DirectoryPage() {
	const { id } = useParams();
	return (
		<div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8 w-full">
			<DictAsidePanel />
			<DirectoryContent directoryId={id as string} />
		</div>
	);
}
