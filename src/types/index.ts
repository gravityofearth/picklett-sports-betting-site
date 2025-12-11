export type OddsType = "money_line" | "spreads" | "totals" | "team_total"
export type LineType = {
    _id: string,
    sports: string,
    leagueName: string,
    home: string,
    away: string,
    startsAt: number,
    status: 'pending' | 'live' | 'finished' | 'cancelled',
    createdAt: string,
    odds: any,
}
export type WrappedLineType = { league: string, data: LineType[] }
export type BetSlipType = {
    lineId: string,
    unit: string,
    num: string,
    oddsName: string,
    point: string,
    team_total_point: string,
    description: string,
    value: string,
    hash: string,
    home: string,
    away: string,
    index: number,
    leagueName: string,
    amount: string,
    sports: string,
    startsAt: number,
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
export type BetResultType = "win" | "lose" | "draw" | "cancelled"
export type BetType = {
    username: string,
    lineId: string,
    unit: string,
    num: string,
    description: string,
    oddsName: string,
    point: string,
    team_total_point: number,
    value: number,
    index: number,
    amount: number,
    result: "pending" | BetResultType,
    lineData: {
        sports: string,
        leagueName: string,
        home: string,
        away: string,
        startsAt: Number,
        status: "pending" | "live" | "finished" | "cancelled",
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
export type ClansInWarType = {
    clanId: string,
    members: string[],
    wins: number,
    bets: number,
    title: string,
    icon: string,
}
export type PendingBetsType = { username: string }[]
export type WarType = {
    _id: string,
    type: string,
    prize: number,
    stake: number,
    slots: number,
    clans?: ClansInWarType[],
    pendingBets: PendingBetsType,
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
    sports: string,
    league: string,
    home: string,
    away: string,
    amount: number,
    result: string,
    updatedAt: string,
}
export const ODDS_UNIT_TYPES = [
    "odds_regular",
    "odds_corners",
    "odds_sets",
    "odds_games",
    "odds_points",
    "odds_bookings",
    "odds_daily_total"
] as const;
export type OddsUnitType = typeof ODDS_UNIT_TYPES[number];
export function isOddsUnitType(value: string): value is OddsUnitType {
    return ODDS_UNIT_TYPES.includes(value as OddsUnitType);
}