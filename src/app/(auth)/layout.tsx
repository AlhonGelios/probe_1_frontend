import React from "react";

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex items-center justify-center w-full bg-[url('/images/welcome-bg.jpg')] bg-cover bg-center min-h-screen">
			{children}
		</div>
	);
}
