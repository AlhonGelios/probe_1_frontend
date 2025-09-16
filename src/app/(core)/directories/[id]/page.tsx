"use client";

import { useParams } from "next/navigation";
import DirectoryContent from "@/features/directories/components/directory-content";

export default function DirectoryPage() {
	const { id } = useParams();
	return <DirectoryContent directoryId={id as string} />;
}
