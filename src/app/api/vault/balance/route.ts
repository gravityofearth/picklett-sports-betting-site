import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { VAULT_PRIV_KEYS, JWT_SECRET } from "@/utils";
import { getVaultBalance } from "@/controller/withdraw";

import * as bitcoin from "bitcoinjs-lib"
import ECPairFactory from "ecpair"
import * as ecc from "tiny-secp256k1"
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('token') || '';
    const { role }: any = jwt.verify(token, JWT_SECRET)
    if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403, statusText: "Forbidden" });
    const { lockedPrice, vaultBalance } = await getVaultBalance({ network: "Bitcoin" })

    const ECPair = ECPairFactory(ecc);
    const vault_btc_address = bitcoin.payments.p2wpkh({ pubkey: ECPair.fromWIF(VAULT_PRIV_KEYS.btc).publicKey }).address
    return NextResponse.json({
      basets: new Date().getTime(),
      balances: [
        {
          network: "Bitcoin",
          address: vault_btc_address,
          currencies: [
            {
              currency: "BTC",
              amount: {
                USD: Math.floor(vaultBalance / 10 ** 8 * lockedPrice * 100) / 100,
                coin: vaultBalance / 10 ** 8,
              },
            }
          ]
        },
      ]
    }, { status: 200 })
  } catch (error: any) {
    console.error("Error processing get vault balance:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500, statusText: error.message });
  }
}