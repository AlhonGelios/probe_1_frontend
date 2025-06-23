export const navItems = [
	{
		name: "Управление пользователями",
		href: "/users",
		roles: ["SUPER_ADMIN"],
	},
	{
		name: "Правила приёма",
		href: "/admission-rules",
		roles: ["ADVANCED_USER"],
	},
	{
		name: "Картотека",
		href: "/card-index",
		roles: ["ADVANCED_USER", "REGULAR_USER", "VIEWER"],
	},
	{
		name: "Статистика",
		href: "/statistics",
		roles: ["ADVANCED_USER"],
	},
];
