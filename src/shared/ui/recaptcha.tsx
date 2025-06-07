"use client";

import ReCAPTCHA from "react-google-recaptcha";

interface RecaptchaComponentProps {
	onRecaptchaChange: (token: string | null) => void;
	onRecaptchaError?: (error: string) => void;
	sitekey: string;
	recaptchaRef: React.RefObject<ReCAPTCHA>;
}

export const RecaptchaComponent: React.FC<RecaptchaComponentProps> = ({
	onRecaptchaChange,
	onRecaptchaError,
	sitekey,
	recaptchaRef,
}) => {
	return (
		<ReCAPTCHA
			ref={recaptchaRef}
			sitekey={sitekey}
			onChange={(token) => {
				onRecaptchaChange(token);
			}}
			onExpired={() => {
				console.log("ReCAPTCHA token expired.");
				onRecaptchaChange(null);
				if (recaptchaRef.current) {
					recaptchaRef.current.reset();
					console.log("ReCAPTCHA widget reset on token expiration.");
				}
			}}
			onErrored={() => {
				console.error("ReCAPTCHA error.");
				onRecaptchaChange(null);
				if (onRecaptchaError) {
					onRecaptchaError(
						"Ошибка CAPTCHA. Пожалуйста, попробуйте еще раз."
					);
				}
				if (recaptchaRef.current) {
					recaptchaRef.current.reset();
					console.log("ReCAPTCHA widget reset on error.");
				}
			}}
		/>
	);
};
