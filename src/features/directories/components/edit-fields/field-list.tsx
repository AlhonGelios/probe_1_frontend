"use client";

import { Button } from "@/shared/ui/button";
import { Trash2 } from "lucide-react";
import { DirectoryField } from "../../model/edit-fields-types";

interface FieldListProps {
	fields: DirectoryField[];
	selectedField: DirectoryField | null;
	onSelectField: (field: DirectoryField) => void;
	onDeleteField: (fieldId: string) => void;
}

export function FieldList({
	fields,
	selectedField,
	onSelectField,
	onDeleteField,
}: FieldListProps) {
	return (
		<div className="w-1/3 flex-shrink-0 h-[60vh] flex flex-col">
			<h3 className="font-semibold mb-2">Существующие поля</h3>
			<ul className="space-y-2 overflow-y-auto flex-1">
				{fields.map((field) => (
					<li
						key={field.id}
						className={`${
							field.id === selectedField?.id
								? "bg-orange-100"
								: ""
						} flex items-center justify-between p-2 border rounded-md hover:bg-gray-100 hover:cursor-pointer mr-4`}
						onClick={() => onSelectField(field)}
					>
						<div className="flex flex-col">
							<span
								className="truncate font-medium"
								title={field.displayName}
							>
								{field.displayName}
							</span>
							<span className="text-xs text-muted-foreground">
								{field.name} (
								{[
									field.type,
									field.isRequired && "Required",
									field.isUnique && "Unique",
									field.defaultValue && "DefaultValue",
								]
									.filter(Boolean)
									.join(", ")}
								)
							</span>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={(e) => {
								e.stopPropagation();
								onDeleteField(field.id);
							}}
							disabled={field.isSystem}
							className="hover:bg-gray-300"
							title={
								field.isSystem
									? "Системное поле нельзя удалить"
									: "Удалить поле"
							}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</li>
				))}
			</ul>
		</div>
	);
}
