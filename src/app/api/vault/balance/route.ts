import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import { VAULT_PRIV_KEYS, JWT_SECRET } from "@/utils";
import { getVaultBalance } from "@/controller/withdraw";

import * as bitcoin from "bitcoinjs-lib"
import ECPairFactory from "ecpair"
import * as ecc from "tiny-secp256k1"
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import bs58 from 'bs58';
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('token') || '';
    const { role }: any = jwt.verify(token, JWT_SECRET)
    if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403, statusText: "Forbidden" });
    const { lockedPrice: lockedPriceBTC, vaultBalance: vaultBalanceBTC } = await getVaultBalance({ network: "Bitcoin" })
    const { lockedPrice: lockedPriceSOL, vaultBalance: vaultBalanceSOL } = await getVaultBalance({ network: "Solana" })

    const ECPair = ECPairFactory(ecc);
    const vault_btc_address = bitcoin.payments.p2wpkh({ pubkey: ECPair.fromWIF(VAULT_PRIV_KEYS.btc).publicKey }).address
    const vault_sol_address = Keypair.fromSecretKey(bs58.decode(VAULT_PRIV_KEYS.sol)).publicKey.toBase58()
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
                USD: Math.floor(vaultBalanceBTC / 10 ** 8 * lockedPriceBTC * 100) / 100,
                coin: vaultBalanceBTC / 10 ** 8,
              },
            }
          ]
        },
        {
          network: "Solana",
          address: vault_sol_address,
          currencies: [
            {
              currency: "SOL",
              amount: {
                USD: Math.floor(vaultBalanceSOL / LAMPORTS_PER_SOL * lockedPriceSOL * 100) / 100,
                coin: vaultBalanceSOL / LAMPORTS_PER_SOL,
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