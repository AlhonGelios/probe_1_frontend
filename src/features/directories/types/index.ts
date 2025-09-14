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

export interface DirectoryField {
	id: string;
	directoryId: string;
	name: string;
	displayName: string;
	type: string;
	isSystem: boolean;
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
