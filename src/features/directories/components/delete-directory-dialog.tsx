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

interface DeleteDirectoryDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	isDeleting: boolean;
}

export function DeleteDirectoryDialog({
	open,
	onOpenChange,
	onConfirm,
	isDeleting,
}: DeleteDirectoryDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Удалить справочник</DialogTitle>
					<DialogDescription>
						Справочник и всё его содержимое будет полностью удалено
					</DialogDescription>
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
