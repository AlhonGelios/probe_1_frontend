import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BACKEND_URL =
	process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000"; // Убедитесь, что это ваш реальный URL

export default async function middleware(request: NextRequest) {
	const pathname = request.nextUrl.pathname;

	const authRoutes = [
		"/forgot-password",
		"/reset-password",
		"/verify-email",
		"/welcome",
	];
	const isAuthRoute = authRoutes.some((route) => pathname === route);

	let isAuthenticated = false;

	try {
		const cookieHeader = request.headers.get("cookie");
		const apiUrl = `${BACKEND_URL}/api/auth/session-status`;
		const response = await fetch(apiUrl, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				...(cookieHeader && { Cookie: cookieHeader }),
			},
			credentials: "include",
		});

		if (response.ok) {
			const data = await response.json();
			isAuthenticated = data.isAuthenticated;
		} else {
			isAuthenticated = false;
		}
	} catch (error) {
		console.error("Ошибка при проверке статуса сессии с бэкенда:", error);
		isAuthenticated = false;
	}

	if (isAuthenticated && isAuthRoute) {
		const url = request.nextUrl.clone();
		url.pathname = "/dashboard";
		return NextResponse.redirect(url);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|_next/data|favicon.ico).*)"],
};
