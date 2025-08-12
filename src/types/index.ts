export type LineType = {
    _id: string,
    question: string,
    yes: number,
    no: number,
    endsAt: number,
    result: string,
}
export type BetType = {
    username: string,
    // lineId: string,
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
    targetETH: number,
    targetUSDT: number,
    coinType: string,
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