"use client";

import {
	ChangePasswordForm,
	EditProfileForm,
	LogoutAllDeviceCard,
} from "@/features/dashboard";

export default function EditProfilePage() {
	return (
		<div className=" py-2 h-full w-full">
			<h1 className="text-3xl font-bold mb-10 text-foreground">
				Редактирование профиля
			</h1>

			<div className="flex flex-col md:flex-row md:items-stretch justify-between ">
				<div className="flex flex-col md:flex-row md:items-stretch justify-start gap-8">
					<EditProfileForm />
					<ChangePasswordForm />
				</div>
				<LogoutAllDeviceCard />
			</div>
		</div>
	);
}
