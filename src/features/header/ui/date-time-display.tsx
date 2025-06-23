"use client";

import React, { useState, useEffect } from "react";

export function DateTimeDisplay() {
	const [currentDateTime, setCurrentDateTime] = useState(new Date());

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentDateTime(new Date());
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	const options: Intl.DateTimeFormatOptions = {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	};

	const formattedDateTime = currentDateTime.toLocaleDateString(
		"ru-RU",
		options
	);
	const [datePart, timePart] = formattedDateTime.split(
		/(\s\d{2}:\d{2}:\d{2})$/
	);

	return (
		<div className="text-lg font-medium">
			<div className="text-sm text-muted-foreground">{datePart}</div>
			<div className="text-xl font-semibold">{timePart}</div>
		</div>
	);
}
