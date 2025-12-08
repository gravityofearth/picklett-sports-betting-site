import {  /*Bounce, */ ToastOptions, toast, Flip, ToastContent, } from "react-toastify";
import * as bitcoin from "bitcoinjs-lib"
import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import crypto from 'crypto';

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
    "sol": process.env.VAULT_PRIV_KEY_SOL || "",
}
export const NATHAN_ADDRESS = {
    "btc": process.env.NATHAN_BTC_ADDRESS || "bc1qydglufze7p6at6cnwv83p2ndvls5mtujuwhp45",
    "sol": process.env.NATHAN_SOL_ADDRESS || "HEHeS2ED3wwXkb3GrDdsQHRiRuxFExq5r2AxLzPdxGjx",
}
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || ""
export const solana_connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, "confirmed");
export const CurrencyDict: { [K: string]: { url: string, availableNetworks: string[] } } = {
    "BTC": {
        url: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
        availableNetworks: ["Bitcoin"],
    },
    "SOL": {
        url: "https://s2.coinmarketcap.com/static/img/coins/64x64/5426.png",
        availableNetworks: ["Solana"],
    },
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
export const formatOddsValue = (value: number, odds_type: "decimal" | "american") => {
    if (odds_type == "decimal") {
        return `${value}${!value.toString().includes(".") ? ".0" : ""}`
    } else {
        return convertDecimal2AmericanOdds(value).toString()
    }
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
export const generateVerificationToken = () => {
    const token = crypto.randomBytes(32).toString('hex');
    return token
};
export const validateEmailAddress = (email: string) => /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9\-]+\.)+([a-zA-Z]{2,})$/.test(email)
export const validateCurrency = (val: string) => /^$|^-$|^-?(0|[1-9][0-9]*)(\.[0-9]{0,2})?$/.test(val)
export const validateEthAddress = (val: string) => /^0x[0-9a-fA-F]{40}$/.test(val)
export const validateEthTx = (val: string) => /^0x[0-9a-fA-F]{64}$/.test(val)
export const validateUsername = (val: string) => /^[a-z][_0-9a-z]*$/.test(val)
export const validateDecimal = (val: string) => /^$|^-$|^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/.test(val)
export const validatedCryptoAddress = ({ address, network }: { address: string, network: string }) => {
    if (network === "Bitcoin") return validatedBtcAddress(address)
    if (network === "Solana") return validatedSolAddress(address)
}
const validatedBtcAddress = (address: string) => {
    try {
        // Throws error if invalid address
        bitcoin.address.toOutputScript(address);
        return true;
    } catch (e) {
        return false;
    }
}
const validatedSolAddress = (address: string) => {
    try {
        const pubkey = new PublicKey(address);
        // Check if it's on the ed25519 curve
        return PublicKey.isOnCurve(pubkey.toBytes());
    } catch (error) {
        return false;
    }
}
export function getCookieResponse({ response, token }: { response: NextResponse, token: string }) {
    response.cookies.set('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 1 day in seconds
        path: '/',
    })
    return response
}
export function decodeEntities(encodedStr: string) {
    return encodedStr.replace(/&#(\d+);/g, (match, dec) => {
        return String.fromCharCode(dec);
    });
}
export const getWinRate = ({ wins, bets }: { wins: number, bets: number }) => `${Math.round(wins * 100 / Math.max(1, bets) * 10) / 10}%`
export const formatAgo = (ts: number) => {
    const mins = Math.floor((new Date().getTime() - ts) / 1000 / 60)
    if (mins === 0) return "Now"
    if (mins < 60) return `${mins} mins ago`
    const hs = Math.floor(mins / 60)
    if (hs < 24) return `${hs} ${hs > 1 ? "hours" : "hour"} ago`
    const days = Math.floor(hs / 24)
    if (days < 30) return `${days} ${days > 1 ? "days" : "day"} ago`
    const months = Math.floor(days / 30)
    return `${months} ${months > 1 ? "months" : "month"} ago`
}
export const xpStep = (xp: number) => {
    for (let step of [10000, 100000, 500000, 2000000]) {
        if (xp < step) return step
    }
    return 1
}
export const ODDS_TITLE: { [K: string]: string } = { "money_line": "To Win", "spreads": "Handicap", "totals": "Total", "team_total": "Team Total" }
export const formatOddsPointTitle = ({ team_total_point, point, index, oddsName, team }: { team_total_point: string, point: string, index: number, oddsName: string, team: string }) => {
    if (oddsName === "money_line") return ""
    const val = oddsName === "team_total" ? team_total_point : point
    const prefix = oddsName === "team_total" ? `${team} ` : ""
    if (oddsName === "spreads") {
        const num = Number(val) * ([1, -1][index])
        if (num === 0) return ["+0.0", "-0.0"][index]
        return `${prefix}${num > 0 ? "+" : "-"}${val.replace("-", "")}`
    } else {
        return `${prefix}${["Over", "Under"][index]} ${val}`
    }
}
export const sportsData: { id: number; label: string; sports: string; }[] = [
    { id: 1, label: "Soccer", sports: "soccer" },
    { id: 2, label: "Tennis", sports: "tennis" },
    { id: 3, label: "Basketball", sports: "basketball" },
    { id: 4, label: "Hockey", sports: "hockey" },
    { id: 5, label: "Volleyball", sports: "volleyball" },
    { id: 6, label: "Handball", sports: "handball" },
    { id: 7, label: "American Football", sports: "american-football" },
    { id: 8, label: "MMA", sports: "mixed-martial-arts" },
    { id: 9, label: "Baseball", sports: "baseball" },
    { id: 10, label: "E-sports", sports: "e-sports" },
    { id: 11, label: "Cricket", sports: "cricket" },
]
export const signHmac = (value: string) => {
    const hmac = crypto.createHmac('sha256', JWT_SECRET).update(value).digest('hex');
    return hmac.substring(0, 6)
}
export const signOdd = ({ eventId, period_num, oddsName, point, ou_ha, value }: { eventId: string, period_num: string, oddsName: string, point: string, ou_ha: string, value: string }) => {
    return signHmac(`${eventId}-${period_num}-${oddsName}-${point}-${ou_ha}-${value}`)
}
type Primitive = string | number | boolean | null | undefined;
type DiffResult = { [key: string]: DiffResult | { before: any, after: any } };
export function getObjectDiff<T extends Record<string, any>>(
    obj1: T,
    obj2: T,
    ignoredKeys: Set<string> = new Set()
) {
    const detailed_diff: DiffResult = {};
    const normal_diff: DiffResult = {};
    const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

    allKeys.forEach(key => {
        // Skip keys marked to be ignored
        if (ignoredKeys.has(key)) {
            return;
        }

        const val1 = obj1[key];
        const val2 = obj2[key];
        const areObjects = typeof val1 === 'object' && typeof val2 === 'object' && val1 !== null && val2 !== null;

        if (areObjects) {
            // Recursive call for nested objects
            const { detailed_diff: nested_detailed_diff, normal_diff: nested_normal_diff } = getObjectDiff(val1, val2, ignoredKeys);
            if (Object.keys(nested_detailed_diff).length > 0) {
                detailed_diff[key] = nested_detailed_diff;
                normal_diff[key] = nested_normal_diff
            }
        } else if (val1 !== val2) {
            // Record the difference for primitive types or references
            detailed_diff[key] = {
                before: val1,
                after: val2
            };
            normal_diff[key] = val2
        }
    });

    return { detailed_diff, normal_diff };
}
export function deleteUnnecessaryKeysAndRoundOdds(obj: any) {
    const unnecessaryKeys = ["line_id", "meta", "alt_line_id", "max", "number", "cutoff", "period_status"]
    const oddsValKeys = ["home", "away", "over", "under"]
    if (typeof obj !== "object" || obj === null) return
    Object.keys(obj).forEach(key => {
        if (unnecessaryKeys.includes(key)) {
            delete obj[key]
        }
        if (oddsValKeys.includes(key)) {
            obj[key] = Math.floor(obj[key] * 100) / 100
        }
    })
    Object.keys(obj).forEach(key => deleteUnnecessaryKeysAndRoundOdds(obj[key]))
}
export function signLineOdds(line: any) {
    const eventId = line.eventId
    const odds = JSON.parse(line.odds)
    for (let period_num in odds) {
        const period_odds = odds[period_num]
        const oddsNames = ["money_line", "spreads", "totals", "team_total"]
        for (let oddsName of oddsNames) {
            if (oddsName === "money_line") {
                const oddsContent = period_odds[oddsName];
                if (!oddsContent) continue
                ["home", "away"].forEach(ha => {
                    if (Object.keys(oddsContent).includes(ha)) {
                        oddsContent[`${ha}_hash`] = signOdd({ eventId, period_num, oddsName, point: "0", ou_ha: ha, value: oddsContent[ha] })
                    }
                })
            } else {
                for (let point in period_odds[oddsName]) {
                    const oddsContent = period_odds[oddsName][point]
                    if (!oddsContent) continue
                    const odds_keys = oddsName.includes("total") ? ["over", "under"] : ["home", "away"];
                    odds_keys.forEach(ou_ha => {
                        if (Object.keys(oddsContent).includes(ou_ha)) {
                            oddsContent[`${ou_ha}_hash`] = signOdd({ eventId, period_num, oddsName, point, ou_ha, value: oddsContent[ou_ha] })
                        }
                    })
                }
            }
        }
    }
    line.odds = JSON.stringify(odds)
}
export function extractTypicalOdds(line: any) {
    const eventId = line.eventId
    const odds = JSON.parse(line.odds)
    for (let num in odds) {
        const period_odds = odds[num]
        const description = period_odds["description"]
        const oddsNames = ["money_line", "spreads", "totals", "team_total"]
        for (let oddsName of oddsNames) {
            if (oddsName === "money_line") {
                const oddsContent = period_odds[oddsName];
                if (!oddsContent) continue
                const v1 = oddsContent["home"]
                const v2 = oddsContent["away"]
                const draw = oddsContent["draw"]
                if (!draw && v1 >= 1.8 && v2 >= 1.8) {
                    const h1 = signOdd({ eventId, period_num: num, oddsName, point: "0", ou_ha: "home", value: v1 })
                    const h2 = signOdd({ eventId, period_num: num, oddsName, point: "0", ou_ha: "away", value: v2 })
                    line.odds = JSON.stringify({
                        num, description, oddsName, point: "0", v1, v2,
                        h1, h2
                    })
                    return
                }
            } else {
                for (let point in period_odds[oddsName]) {
                    if (point.endsWith(".25") || point.endsWith(".75")) continue
                    const oddsContent = period_odds[oddsName][point]
                    if (!oddsContent) continue
                    const odds_key1 = oddsName.includes("total") ? "over" : "home"
                    const odds_key2 = oddsName.includes("total") ? "under" : "away"
                    const v1 = oddsContent[odds_key1]
                    const v2 = oddsContent[odds_key2]
                    const team_total_point = oddsContent["points"]
                    if (oddsName === "team_total" && (team_total_point.toString().endsWith(".25") || team_total_point.toString().endsWith(".75"))) continue
                    if (v1 >= 1.8 && v2 >= 1.8) {
                        const h1 = signOdd({ eventId, period_num: num, oddsName, point, ou_ha: odds_key1, value: v1 })
                        const h2 = signOdd({ eventId, period_num: num, oddsName, point, ou_ha: odds_key2, value: v2 })
                        line.odds = JSON.stringify({
                            num, description, oddsName, point, v1, v2, team_total_point,
                            h1, h2
                        })
                        return
                    }
                }
            }
        }
    }
    line.odds = ""
}