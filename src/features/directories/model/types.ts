export interface Directory {
	id: string;
	name: string;
	displayName: string;
	description?: string | null;
	isSystem: boolean;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	createdById?: string | null;
	updatedById?: string | null;
	fields: DirectoryField[];
	records: DirectoryRecord[];
	year: number;
}

export type FieldType = "STRING" | "NUMBER" | "BOOLEAN" | "DATE";

export interface DirectoryField {
	id: string;
	directoryId: string;
	name: string;
	displayName: string;
	type: FieldType;
	isSystem: boolean;
	isRequired: boolean;
	isUnique: boolean;
	defaultValue?: string | null;
	sortOrder: number;
}

export interface DirectoryRecord {
	id: string;
	directoryId: string;
	createdAt: string;
	updatedAt: string;
	createdById?: string | null;
	updatedById?: string | null;
	recordValue: DirectoryValue[];
}

export interface DirectoryValue {
	id?: string;
	fieldId: string;
	recordId: string;
	value: string;
	createdAt: string;
	updatedAt: string;
	createdById?: string | null;
	updatedById?: string | null;
}
