import { toast } from "react-toastify";

/**
 * Show a success toast notification
 */
export const showSuccessToast = (message: string): void => {
    toast.success(message, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });
};

/**
 * Show an error toast notification
 */
export const showErrorToast = (message: string): void => {
    toast.error(message, {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });
};

/**
 * Show an info toast notification
 */
export const showInfoToast = (message: string): void => {
    toast.info(message, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    });
};
