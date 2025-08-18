export type LineType = {
    _id: string,
    question: string,
    yes: number,
    no: number,
    endsAt: number,
    result: "yes" | "no" | "pending" | null,
    createdAt: string,
    openedBy: string,
}
export type LineCardAdminType = {
    yes_decimal: string;
    no_decimal: string;
    yes_american: string;
    no_american: string;
    endsAtStr: string;
    oddsFormat: "american" | "decimal";
    changed: number;
    winning_side: string;
}
export type LineCardUserType = {
    amount: string;
    side: "yes" | "no" | null,
    oddsFormat: "american" | "decimal",
}
export type BetType = {
    username: string,
    lineId?: string,
    amount: number,
    side: "yes" | "no",
    status: "pending" | "win" | "lose",
    question: string,
    result: "pending" | "yes" | "no",
    lineData: {
        yes: number,
        no: number,
    },
    createdAt: string,
}
export type DepositType = {
    _id: string,
    username: string,
    sender: string,
    depositAmount: string,
    dedicatedWallet: string,
    tx: string,
    createdAt: string,
    result: "initiated" | "verifying" | "failed" | "success",
    reason?: string,
}
export type WithdrawType = {
    _id: string,
    userbalance?: number,
    username: string,
    wallet: string,
    amount: number,
    tx: string,
    createdAt: string,
    result: "requested" | "failed" | "success",
    reason?: string,
}
export type LeaderType = { username: string; winstreak: number }
export type AffiliateRewardType = {
    startsAt: number,
    endsAt: number,
    timestamp: number,
    referrer: string,
    revenue: number,
    earning: number,
    totalBets: number,
    detail: {
        amount: number,
        referee: string
    }[],
}