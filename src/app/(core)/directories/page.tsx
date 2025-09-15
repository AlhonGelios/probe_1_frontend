import DictAsidePanel from "@/features/directories/components/aside-panel-directories";

export default function DictionariesPage() {
	return (
		<div className="flex flex-col md:flex-row w-full gap-10">
			<div className="flex grow items-stretch max-w-1/6 md:w-[300px] transition-all duration-300 relative">
				<DictAsidePanel />
			</div>
			<div className="bg-card -mx-4 p-6 border rounded-lg shadow-sm justify-self-stretch grow">
				<div className="flex justify-between items-center mb-4">
					<div>
						<h2 className="text-2xl font-bold">
							Выберите справочник для отоброжения его содержимого
						</h2>
						<p className="text-muted-foreground mt-1"></p>
					</div>
				</div>
			</div>
		</div>
	);
}
