import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const HEADER_HEIGHT = "64px";
const TOAST_MARGIN_TOP = "16px";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Create Next App",
	description: "Generated by create next app",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[url('/images/welcome-bg.jpg')] bg-cover bg-center`}
			>
				{children}
				<Toaster
					richColors
					position="top-right"
					style={{
						top: `calc(${HEADER_HEIGHT} + ${TOAST_MARGIN_TOP})`,
					}}
				/>
			</body>
		</html>
	);
}
