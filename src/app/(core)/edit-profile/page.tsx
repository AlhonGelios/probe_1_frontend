"use client";

import {
	ChangePasswordForm,
	EditProfileForm,
	LogoutAllDeviceCard,
} from "@/features/profile";

export default function EditProfilePage() {
	return (
		<div className=" py-2 h-full w-full">
			<h1 className="text-3xl font-bold mb-10 text-foreground">
				Редактирование профиля
			</h1>

			<div className="w-full flex flex-col lg:flex-row lg:items-stretch justify-between gap-8">
				<div className="flex flex-col lg:flex-row lg:items-stretch justify-start gap-8">
					<EditProfileForm />
					<ChangePasswordForm />
				</div>
				<LogoutAllDeviceCard />
			</div>
		</div>
	);
}
