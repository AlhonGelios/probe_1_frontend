export interface UserFilterState {
	role: string;
	search: string;
}

export interface Role {
	id: string;
	name: string;
	displayName: string;
	description: string | null;
}
