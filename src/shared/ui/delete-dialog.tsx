import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Loader2 } from "lucide-react";

interface DeleteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isDeleting: boolean;
	entityTitle?: string;
	entityDescription?: string;
}

export function DeleteDialog({
	open,
	onOpenChange,
	onConfirm,
	isDeleting,
	entityTitle = "Удалить",
	entityDescription = "Этот объект будет удален",
}: DeleteDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{entityTitle}</DialogTitle>
					<DialogDescription>{entityDescription}</DialogDescription>
				</DialogHeader>
				<DialogFooter className="sm:justify-end">
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isDeleting}
					>
						Отмена
					</Button>
					<Button
						variant="destructive"
						onClick={onConfirm}
						disabled={isDeleting}
					>
						{isDeleting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Удаление...
							</>
						) : (
							"Удалить"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
