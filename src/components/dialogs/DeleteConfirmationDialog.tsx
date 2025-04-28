import type React from "react";

interface DeleteConfirmationDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirmDelete: () => void;
	imageName: string;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
	isOpen,
	onClose,
	onConfirmDelete,
	imageName = "this image",
}) => {
	if (!isOpen) {
		return null;
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
			aria-labelledby="delete-confirmation-dialog-title"
			aria-modal="true"
		>
			<div className="relative w-full max-w-md p-6 bg-white rounded-md shadow-lg">
				<h2
					id="delete-confirmation-dialog-title"
					className="text-lg font-semibold text-gray-800"
				>
					Confirm Delete
				</h2>
				<div className="mt-4 text-gray-700">
					<p>
						Are you sure you want to delete{" "}
						<span className="font-medium">{imageName}</span>? This
						action cannot be undone.
					</p>
				</div>
				<div className="mt-6 flex justify-end space-x-2">
					<button
						type="button"
						onClick={onClose}
						className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={onConfirmDelete}
						className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
					>
						Delete
					</button>
				</div>
			</div>
		</div>
	);
};

export default DeleteConfirmationDialog;
