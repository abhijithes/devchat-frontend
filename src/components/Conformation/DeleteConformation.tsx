import { X, AlertTriangle } from "lucide-react";
import ReactDOM from "react-dom";
import "./modal.css";

interface DeleteConfirmationProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export const DeleteConfirmation = ({
  message,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteConfirmationProps) => {
  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[100000]">
      <div className="bg-white rounded-lg shadow-xl w-96 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-50 rounded-full">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Confirm</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isDeleting}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 bg-gray-50 rounded-b-lg">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors disabled:opacity-50"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isDeleting}
          >
            <span>{isDeleting ? "Removing..." : "Remove"}</span>
          </button>
        </div>
      </div>
    </div>
  );

  //  Renders modal outside any parent container
  return ReactDOM.createPortal(modalContent, document.body);
};

export default DeleteConfirmation;
