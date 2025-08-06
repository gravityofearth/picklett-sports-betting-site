export type LineType = {
    "_id": string,
    "question": string,
    "yes": number,
    "no": number,
    "endsAt": number,
    "result": string,
}
export type BetType = {
    "username": string,
    // "lineId": string,
    "amount": number,
    "side": "yes" | "no",
    "status": "pending" | "win" | "lose",
}