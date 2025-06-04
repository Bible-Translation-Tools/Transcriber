import { ShowWhen } from "@components/utils/ShowWhen.tsx";
import { Chip } from "@mui/material";
import React from "react";
import { BookOption } from "@components/navigation/BookDropdown.tsx";

interface BookItemProps {
	handleBookClick: (book: string) => void;
	option: BookOption;
	inProgress: boolean;
}

export const BookItem: React.FC<BookItemProps> = ({
	handleBookClick,
	option,
	inProgress,
}) => {
	return (
		<button
			type="button"
			className="flex-start p-2 hover:bg-gray-100 cursor-pointer text-left"
			onClick={() => handleBookClick(option.value)}
		>
			<div className="flex justify-between">
				<div>{option.label}</div>

				<ShowWhen when={inProgress}>
					<Chip variant={"outlined"} label={"In Progress"} />
				</ShowWhen>
			</div>
		</button>
	);
};
