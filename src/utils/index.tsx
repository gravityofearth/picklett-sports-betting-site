import Image from "next/image";
import { ReactNode } from "react";
import {  /*Bounce, */ ToastOptions, toast, Flip, ToastContent, } from "react-toastify";
import * as bitcoin from "bitcoinjs-lib"
import { NextResponse } from "next/server";

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
export const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || ""
export const RAPID_API_HEADERS = {
    "x-rapidapi-host": "pinnacle-odds.p.rapidapi.com",
    "x-rapidapi-key": process.env.RAPID_API_KEY || ""
}
export const VAULT_PRIV_KEYS = {
    "btc": process.env.VAULT_PRIV_KEY_BTC || "",
}
export const NATHAN_ADDRESS = {
    "btc": process.env.NATHAN_BTC_ADDRESS || "bc1qydglufze7p6at6cnwv83p2ndvls5mtujuwhp45",
}
export const CurrencyDict: { [K: string]: { element: ReactNode, availableNetworks: string[] } } = {
    "BTC": {
        element: <div className="flex items-center gap-2">
            <Image alt="bitcoin-image" src="https://s2.coinmarketcap.com/static/img/coins/64x64/1.png" width={20} height={16} className="shrink-0" />
            <span>BTC </span>
        </div>,
        availableNetworks: ["Bitcoin"],
    },
    // "USDT": {
    //   element: <>
    //     <Image alt="usdt-image" src="https://s2.coinmarketcap.com/static/img/coins/64x64/825.png" width={20} height={16} />
    //     <span>USDT</span>
    //   </>,
    //   availableNetworks: ["Ethereum"],
    // },
    // "ETH": {
    //   element: <>
    //     <svg className="w-3 h-3 shrink-0"><use href="#svg-deposit" /></svg>
    //     <span>ETH</span>
    //   </>,
    //   availableNetworks: ["Ethereum"],
    // },
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
export const validateDecimal = (val: string) => /^$|^-$|^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/.test(val)
export const validatedBtcAddress = (address: string) => {
    try {
        // Throws error if invalid address
        bitcoin.address.toOutputScript(address);
        return true;
    } catch (e) {
        return false;
    }
}
export function getCookieResponse({ response, token }: { response: NextResponse, token: string }) {
    response.cookies.set('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 1 day in seconds
        path: '/',
    })
    return response
}
export function decodeEntities(encodedStr: string) {
    return encodedStr.replace(/&#(\d+);/g, (match, dec) => {
        return String.fromCharCode(dec);
    });
}