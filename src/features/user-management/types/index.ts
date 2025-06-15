// Типы для формы редактирования
export interface UserEditFormValues {
	userId: string;
	firstName: string;
	lastName: string;
	role: string; // Название роли
	roleExpiration: Date | null;
}

// Типы для фильтрации
export interface UserFilterState {
	role: string; // 'all' или конкретное имя роли
	firstName: string;
	lastName: string;
}
