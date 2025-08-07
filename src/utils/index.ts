import {  /*Bounce, */ ToastOptions, toast, Flip, ToastContent, } from "react-toastify";

const config: ToastOptions = {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    pauseOnFocusLoss: false,
    draggable: true,
    progress: undefined,
    theme: "dark",
    transition: Flip,
    // style: { padding: "1.5vw" },
};
export const showToast = (msg: ToastContent<unknown>, type: "info" | "error" | "success" | "warn", options?: ToastOptions) => {
    if (type === "info") {
        return toast.info(msg, { ...config, ...options });
    } else if (type === "success") {
        return toast.success(msg, { ...config, ...options });
    } else if (type === "warn") {
        return toast.warn(msg, { ...config, ...options });
    } else {
        // if (type === "error") {
        return toast.error(msg, { ...config, ...options });
    }
};
export const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secure-jwt-secret-key-change-this';
export function convertTimestamp2HumanReadablePadded(timestampDiff: number) {
    let totalSeconds = Math.floor(timestampDiff / 1000);
    if (totalSeconds <= 0) return "Ended"
    // const YEAR = 365 * 24 * 60 * 60;
    // const MONTH = 30 * 24 * 60 * 60;
    const DAY = 24 * 60 * 60;
    const HOUR = 60 * 60;
    const MINUTE = 60;

    // const years = Math.floor(totalSeconds / YEAR);
    // totalSeconds %= YEAR;

    // const months = Math.floor(totalSeconds / MONTH);
    // totalSeconds %= MONTH;

    // const days = Math.floor(totalSeconds / DAY);
    // totalSeconds %= DAY;

    const hours = Math.floor(totalSeconds / HOUR);
    totalSeconds %= HOUR;

    const minutes = Math.floor(totalSeconds / MINUTE);
    const seconds = totalSeconds % MINUTE;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
export const convertAmerican2DecimalOdds = (americanOdds: number): number => {
    // Convert American odds to decimal
    if (americanOdds > 0) {
        return Number((americanOdds / 100 + 1).toFixed(2))
    } else {
        return Number((100 / Math.abs(americanOdds) + 1).toFixed(2))
    }
}

export const convertDecimal2AmericanOdds = (decimalOdds: number): number => {
    if (decimalOdds > 2) {
        return Math.floor((decimalOdds - 1) * 100)
    } else {
        return Math.ceil(-100 / (decimalOdds - 1))
    }
}