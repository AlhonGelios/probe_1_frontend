// Типы полей, доступные для создания
export const FIELD_TYPES = [
	"STRING",
	"NUMBER",
	"DATE",
	"DATETIME",
	"BOOLEAN",
] as const;

// Поля, которые можно обновлять при редактировании
export const UPDATABLE_FIELDS = [
	"name",
	"displayName",
	"type",
	"isRequired",
	"isUnique",
] as const;

// Начальное состояние для нового поля
export const initialNewFieldState = {
	name: "",
	displayName: "",
	type: "STRING" as const,
	isRequired: false,
	isUnique: false,
	defaultValue: undefined,
	isSystem: false,
};
