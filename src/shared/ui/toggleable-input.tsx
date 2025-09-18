import { useState } from "react";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Minimize2, TextInitial } from "lucide-react";
import { cn } from "@/shared/lib/utils";

type BaseInputProps = React.ComponentPropsWithoutRef<typeof Input>;
type BaseTextareaProps = React.ComponentPropsWithoutRef<typeof Textarea>;

export type ToggleableInputProps = {
	/** Текущее значение поля ввода */
	value: string;
	/** Обработчик изменения значения */
	onChange: (value: string) => void;
	/** Режим отображения (контролируемый извне) */
	mode?: "input" | "textarea";
	/** Обработчик смены режима */
	onModeChange?: (mode: "input" | "textarea") => void;
} & Omit<BaseInputProps, "value" | "onChange" | "type"> &
	Omit<BaseTextareaProps, "value" | "onChange">;

/**
 * Компонент переключаемого поля ввода между обычным input и textarea.
 *
 * @param props Свойства компонента.
 * @returns Компонент поля ввода с кнопкой переключения.
 */
export const ToggleableInput = (props: ToggleableInputProps) => {
	const {
		value,
		onChange,
		mode: externalMode,
		onModeChange,
		className,
		...rest
	} = props;

	const [internalMode, setInternalMode] = useState<"input" | "textarea">(
		"input"
	);
	const mode = externalMode ?? internalMode;

	const handleToggle = () => {
		const newMode = mode === "input" ? "textarea" : "input";
		if (onModeChange) {
			onModeChange(newMode);
		} else {
			setInternalMode(newMode);
		}
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		onChange(e.target.value);
	};

	return (
		<div className={cn("relative", className)}>
			{mode === "textarea" ? (
				<Textarea
					value={value}
					onChange={handleChange}
					className="pr-10"
					{...(rest as BaseTextareaProps)}
				/>
			) : (
				<Input
					type="text"
					value={value}
					onChange={handleChange}
					className="pr-10"
					{...(rest as BaseInputProps)}
				/>
			)}
			<button
				type="button"
				onClick={handleToggle}
				className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
				aria-label={
					mode === "input"
						? "Переключить в textarea"
						: "Переключить в input"
				}
			>
				{mode === "input" ? (
					<TextInitial size={16} />
				) : (
					<Minimize2 size={16} />
				)}
			</button>
		</div>
	);
};
