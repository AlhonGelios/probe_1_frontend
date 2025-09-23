import {
	useEditFieldsState,
	UseEditFieldsStateProps,
	UseEditFieldsStateReturn,
} from "./use-edit-fields-state";
import {
	useEditFieldsHandlers,
	UseEditFieldsHandlersProps,
	UseEditFieldsHandlersState,
	UseEditFieldsHandlersActions,
	UseEditFieldsHandlersReturn,
} from "./use-edit-fields-handlers";
import { createChangedFields } from "./use-edit-fields-utils";

export { useEditFieldsState, useEditFieldsHandlers, createChangedFields };

// Экспорт типов
export type {
	UseEditFieldsStateProps,
	UseEditFieldsStateReturn,
	UseEditFieldsHandlersProps,
	UseEditFieldsHandlersState,
	UseEditFieldsHandlersActions,
	UseEditFieldsHandlersReturn,
};
