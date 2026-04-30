import type { User } from 'firebase/auth';
import { useState } from 'react';
import { useHeadlessResource } from '../lib/useResource';

interface DeleteRunButtonProps {
    deleteHref: string;
    allItemsComplete: boolean;
    user: User;
    onDelete?: () => void;
}

export function DeleteRunButton({ deleteHref, allItemsComplete, user, onDelete }: DeleteRunButtonProps) {
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    const { state, delete: deleteResource } = useHeadlessResource(deleteHref, user);
    const isDeleting = state.status === 'updating' && state.action === 'delete';
    const deleteError = state.status === 'error' ? state.error.message : null;

    const handleDeleteClick = () => {
        if (allItemsComplete) {
            // All items complete - delete immediately
            performDelete();
        } else {
            // Show confirmation dialog
            setIsConfirmDialogOpen(true);
        }
    };

    const performDelete = async () => {
        setIsConfirmDialogOpen(false);
        try {
            await deleteResource();
            onDelete?.();
        } catch (error) {
            // Error is handled by the hook state
        }
    };

    const handleConfirmDelete = () => {
        performDelete();
    };

    const handleCancelDelete = () => {
        setIsConfirmDialogOpen(false);
    };

    return (
        <>
            <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-red-300 hover:border-red-400"
            >
                {isDeleting ? 'Deleting...' : 'Delete'}
            </button>

            {deleteError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700 font-semibold text-sm">Delete failed</p>
                    <p className="text-red-600 text-sm mt-1">{deleteError}</p>
                </div>
            )}

            {isConfirmDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-6">
                        <h2 className="text-base font-semibold text-gray-800 mb-2">Delete run?</h2>
                        <p className="text-gray-600 text-sm mb-6">
                            This run has incomplete items. Delete anyway?
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={handleCancelDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
