import { DirectoryField } from "./types";
import { FIELD_TYPES, UPDATABLE_FIELDS } from "./edit-fields-constants";

export type CreateFieldDto = {
	name: string;
	displayName: string;
	type: (typeof FIELD_TYPES)[number];
	isRequired?: boolean;
	isUnique?: boolean;
	defaultValue?: string;
	isSystem: boolean;
};

export type UpdateFieldDto = {
	name?: string;
	displayName?: string;
	type?: (typeof FIELD_TYPES)[number];
	isRequired?: boolean;
	isUnique?: boolean;
	defaultValue?: string | null;
};

export interface FieldStats {
	fieldValuesCount: number;
	hasRelatedRecords: boolean;
	hasDefaultValue: boolean;
}

export interface FieldWithStats extends DirectoryField {
	stats?: FieldStats;
}

export interface EditFieldsDialogProps {
	directoryId: string;
	fields: DirectoryField[];
	onRefetchFields: () => Promise<void>;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onFieldsChange?: (fields: DirectoryField[]) => void;
}

export interface ReorderFieldsDto {
	id: string;
	sortOrder: number;
}

// Экспорты для удобства использования
export type { DirectoryField } from "./types";
export { FIELD_TYPES, UPDATABLE_FIELDS };
