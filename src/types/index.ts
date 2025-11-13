export type SportsType = "Basketball" | "Soccer" | "Tennis" | "Baseball" | "Esports" | "Others"
export type OddsType = "money_line" | "spreads" | "totals" | "team_total"
export type LineType = {
    _id: string,
    question: string,
    sports: SportsType,
    league: string,
    event: string,
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
        event: string,
        league: string,
        sports: string,
    },
    createdAt: string,
}
export type DepositType = {
    _id: string,
    username: string,
    currency: string,
    network: string,
    depositAmount: number,
    lockedPrice: number,
    address: string,
    expiresAt: number,
    result: "initiated" | "expired" | "confirming" | "success",
    confirmations: number,
}
export type WithdrawType = {
    _id: string,
    userbalance?: number,
    username: string,
    currency: string,
    network: string,
    address: string,
    amount: number,
    tx: string,
    createdAt: string,
    result: "pending" | "failed" | "success",
    reason?: string,
}
export type LeaderType = {
    username: string;
    winstreak: number;
    wins: number;
    earns: number;
    avatar?: string;
}
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
export type RedemptionType = {
    code: string,
    amount: number,
    status: "pending" | "redeemed",
    username?: string
}
export type VaultBalanceType = {
    network: string,
    address: string,
    currencies: {
        currency: string,
        amount: {
            USD: number,
            coin: number,
        },
    }[]
}
export type ClanMemberType = {
    username: string,
    avatar: string,
    clan: {
        clanId: string,
        joined: boolean,
        role: string,
        contribution: number,
        timestamp: number,
    },
    bets: number,
    wins: number,
    earns: number,
}
export type ClanType = {
    _id: string,
    title: string,
    ownerUserName: string,
    description: string,
    icon: string,
    coffer: number,
    xp: number,
    level: number,
    wins: number,
    bets: number,
    members: ClanMemberType[],
}
export type UserClanType = {
    clanId: string,
    joined: boolean,
    role: string,
    contribution: number,
    timestamp: number,
}
export type WarType = {
    _id: string,
    type: string,
    prize: number,
    stake: number,
    slots: number,
    clans?: {
        clanId: string,
        members: string[],
        wins: number,
        bets: number,
        title: string, // $lookup
        icon: string,
    }[],
    startsAt: number,
    minMembers: number,
}
export type ClanTxType = {
    username?: string,
    warId?: string,
    amount: number,
    type: 'deposit' | 'tax' | 'distribute' | 'stake' | 'prize',
    timestamp: number,
}
export type WarFeedType = {
    username: string,
    avatar: string,
    event: string,
    amount: number,
    status: string,
    updatedAt: string,
}