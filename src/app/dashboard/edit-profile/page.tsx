"use client";

import { ChangePasswordForm, EditProfileForm } from "@/features/dashboard";

export default function EditProfilePage() {
	return (
		<div className="container py-2">
			<h1 className="text-3xl font-bold mb-10 text-foreground">
				Редактирование профиля
			</h1>

			<div className="flex flex-col md:flex-row md:items-start justify-start gap-8 w-full">
				<div className="w-full md:w-1/2">
					<EditProfileForm />
				</div>

				<div className="w-full md:w-1/2">
					<ChangePasswordForm />
				</div>

				<div className="w-full md:w-1/2">
					<p>выйти со всех устройств</p>
				</div>
			</div>
		</div>
	);
}
