export const navItems = [
	{
		name: "Управление пользователями",
		href: "/dashboard/users",
		roles: ["SUPER_ADMIN"],
	},
	{
		name: "Правила приёма",
		href: "/dashboard/admission-rules",
		roles: ["ADVANCED_USER"],
	},
	{
		name: "Картотека",
		href: "/dashboard/card-index",
		roles: ["ADVANCED_USER", "REGULAR_USER", "VIEWER"],
	},
	{
		name: "Статистика",
		href: "/dashboard/statistics",
		roles: ["ADVANCED_USER"],
	},
];
