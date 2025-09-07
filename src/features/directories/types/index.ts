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
	values: DirectoryValue[];
}

export interface DirectoryField {
	id: string;
	directoryId: string;
	name: string;
	displayName: string;
	type: string;
	isSystem: boolean;
}

export interface DirectoryValue {
	id: string;
	directoryId: string;
	fieldId: string;
	value: string;
}

export interface DirectoryRelation {
	id: string;
	parentDirectoryId: string;
	childDirectoryId: string;
}
