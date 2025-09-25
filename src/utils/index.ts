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
export const AFFILIATE_REWARD_SECRET = 'O5I5g9w5ho7DKybR4BVWUSsnu61cSF0vQy';
export const RAPID_API_HEADERS = {
    "x-rapidapi-host": "pinnacle-odds.p.rapidapi.com",
    "x-rapidapi-key": "bb098fd68cmsh83e565bc253ae75p1faf32jsn1d85a040ff50"
}
export function convertTimestamp2HumanReadablePadded(timestampDiff: number) {
    const rawTotalSeconds = Math.floor(timestampDiff / 1000);
    let totalSeconds = Math.abs(rawTotalSeconds)
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

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}${rawTotalSeconds < 0 ? " ago" : ""}`
}
export const convertAmerican2DecimalOdds = (americanOdds: number): number => {
    // Convert American odds to decimal
    if (americanOdds >= 100) {
        return Number((americanOdds / 100 + 1).toFixed(2))
    }
    if (americanOdds <= -100) {
        return Number((100 / Math.abs(americanOdds) + 1).toFixed(2))
    }
    return 2
}

export const convertDecimal2AmericanOdds = (decimalOdds: number): number => {
    if (decimalOdds >= 2) {
        return Math.floor((decimalOdds - 1) * 100)
    }
    if (decimalOdds > 1) {
        return Math.ceil(-100 / (decimalOdds - 1))
    }
    return -100
}
export function generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
export const validateCurrency = (val: string) => /^$|^-$|^-?(0|[1-9][0-9]*)(\.[0-9]{0,2})?$/.test(val)
export const validateEthAddress = (val: string) => /^0x[0-9a-fA-F]{40}$/.test(val)
export const validateEthTx = (val: string) => /^0x[0-9a-fA-F]{64}$/.test(val)
export const validateUsername = (val: string) => /^[a-z][_0-9a-z]*$/.test(val)