"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "./input";
import { cn } from "../lib/utils";

export type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement>;

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
	({ className, ...props }, ref) => {
		const [showPassword, setShowPassword] = React.useState(false);

		return (
			<div className="relative">
				<Input
					type={showPassword ? "text" : "password"}
					className={cn("pr-10", className)}
					ref={ref}
					{...props}
				/>
				<button
					type="button" // Важно: type="button", чтобы не отправлять форму
					onClick={() => setShowPassword((prev) => !prev)}
					className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400 focus:outline-none"
					aria-label={
						showPassword ? "Hide password" : "Show password"
					}
				>
					{showPassword ? (
						<EyeOff className="h-4 w-4" />
					) : (
						<Eye className="h-4 w-4" />
					)}
				</button>
			</div>
		);
	}
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
