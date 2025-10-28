"use client"
import { useState, useEffect } from "react"
import { CurrencyDict, showToast, validateCurrency, validatedCryptoAddress } from "@/utils"
import axios, { AxiosError } from "axios"
import { useUser } from "@/store"
import { FilteringOption, FilteringSelect } from "@/components/FilteringSelect"
import { useRouter } from "next/navigation"
import { CircularIndeterminate } from "@/components/MUIs"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import { CoinDisplay } from "@/components/Miscellaneous"
import Link from "next/link"

export default function Withdraw({ params: { dpVsBt } }: {
    params: {
        dpVsBt: {
            deposit: number;
            bet: number;
        }
    }
}) {
    const { balance } = useUser()
    const [currency, setCurrency] = useState("BTC")
    const [network, setNetwork] = useState("Bitcoin")
    const [amount, setAmount] = useState("")
    const [address, setAddress] = useState("")
    const [txFee, setTxFee] = useState(0)
    const [gamecurrencyWithdraw, setGamecurrencyWithdraw] = useState(false)
    const [sendingRequest, setSendingRequest] = useState(false)
    const router = useRouter()
    useEffect(() => { setNetwork(CurrencyDict[currency]?.availableNetworks[0]) }, [currency])
    const handleWithdraw = () => {
        const withdrawAmount = Number.parseFloat(amount)
        if (!gamecurrencyWithdraw && !validatedCryptoAddress({ address, network })) {
            showToast("Enter address correctly!", "warn")
            return
        }
        if (Number.isNaN(withdrawAmount)) {
            showToast("Enter withdraw amount!", "warn")
            return
        }
        if (withdrawAmount < 20) {
            showToast("Minimum withdrawal amount $20", "warn")
            return
        }
        if (withdrawAmount > balance) {
            showToast("Insufficient balance for withdrawal", "warn")
            return
        }
        setSendingRequest(true)
        axios.post("/api/withdraw", {
            currency, network, address,
            amount: Number(amount),
        }, { headers: { token: localStorage.getItem("jwt") } }).then(({ status, data: { withdraw } }) => {
            if (status === 201) {
                showToast("Withdrawal request submitted successfully", "success")
                router.push(`/transactions/withdraw`)
            }
        }).catch((e: AxiosError) => {
            showToast(e.response?.statusText || "Unknown Error", "error")
        }).finally(() => setSendingRequest(false))
        setAddress("")
        setAmount("")
    }
    useEffect(() => {
        if (!network) return
        if (network === "Bitcoin") {
            axios.get("https://blockstream.info/api/fee-estimates")
                .then(({ data: feeRates }) => {
                    const feeRate = feeRates['6'] || feeRates['12'] || 1;
                    const inputCount = 3;
                    const outputCount = 2;
                    const estimatedVBytes = 10 + inputCount * 68 + outputCount * 31;
                    // 10 is an approximate overhead, adjust if needed.
                    const fee = Math.ceil(feeRate * estimatedVBytes);
                    axios.get("https://data-api.binance.vision/api/v3/ticker/price?symbol=BTCUSDT")
                        .then(({ data: { price: priceBTC } }: { data: { price: number } }) => {
                            setTxFee(Math.ceil(fee * priceBTC / 10 ** 6) / 100)
                        })
                })
        }
        if (network === "Solana") {
            axios.get("https://data-api.binance.vision/api/v3/ticker/price?symbol=SOLUSDT")
                .then(({ data: { price: priceSOL } }: { data: { price: number } }) => {
                    setTxFee(Math.ceil(5000 * priceSOL / LAMPORTS_PER_SOL * 100) / 100)
                })
        }
    }, [network])

    return (
        <div className="flex justify-center">
            <div className="w-full flex flex-col gap-6">
                <div className="flex justify-center">
                    <div className="w-lg p-8 max-md:p-4 bg-[#0E1B2F] border border-[#31415880] rounded-[10px] flex flex-col gap-6">
                        <div className="w-full flex justify-center gap-20 border-b border-white/10">
                            <Link href="/deposit" className="border-b text-center cursor-pointer select-none border-white/10">Deposit</Link>
                            <Link href="/withdraw" className="border-b text-center cursor-pointer select-none border-[#1475E1]">Withdraw</Link>
                        </div>
                        <div className="w-full flex flex-col gap-4">
                            {/* {!gamecurrencyWithdraw &&
            <div className="flex flex-col gap-2">
              <label htmlFor="senderAddress" className="block text-sm font-semibold">
                ETH address (<span className="text-[#FF7076]">In ETH network</span>)
              </label>
              <input
                id="senderAddress"
                type="text"
                value={wallet}
                onChange={(e) => setWallet(e.target.value.trim())}
                className="w-full p-2 border border-[#E5E5E566] rounded-lg disabled:text-[#E5E5E566] text-sm"
                placeholder="0x..."
              />
              <div className="flex gap-2 items-center">
                <svg className="w-4 h-4"><use href="#svg-i" /></svg>
                <p className="text-sm text-[#99A1AF]">Network: Ethereum Mainnet</p>
              </div>
            </div>
          }
          <div className="flex gap-2">
            <input 
              type="checkbox" 
              onClick={() => {
                setGamecurrencyWithdraw(prev => !prev)
                setWallet("")
              }}
              className="w-5 h-5 accent-[#01A3DB] checked:text-[white]"
            />
            <p className="text-sm">Request through gamecurrency</p>
          </div> */}
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-2">
                                    <div className="block text-sm">Currency</div>
                                    <FilteringSelect value={<CoinDisplay coin={currency} src={CurrencyDict[currency].url} />}>
                                        {
                                            Object.keys(CurrencyDict).map((currency, i) =>
                                                <FilteringOption key={i} onClick={() => setCurrency(currency)} value={<CoinDisplay coin={currency} src={CurrencyDict[currency].url} />} />
                                            )
                                        }
                                    </FilteringSelect>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="block text-sm">Network</div>
                                    <FilteringSelect value={network || "Select Network"}>
                                        {CurrencyDict[currency]?.availableNetworks.map((net) => <FilteringOption key={net} onClick={() => setNetwork(net)} value={net} />)}
                                    </FilteringSelect>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="flex gap-1">
                                        <span className="block text-sm">Amount</span>
                                        <span className="text-[#EB2444]">*</span>
                                    </label>
                                    <div className="flex items-center rounded-lg border border-[#E5E5E566] bg-[#0D111B] p-2">
                                        <span className="text-sm">$</span>
                                        <input
                                            id="withdrawAmount"
                                            type="text"
                                            value={amount}
                                            onChange={(e) => {
                                                const v = e.target.value
                                                if (v === "" || validateCurrency(v)) {
                                                    setAmount(v)
                                                } else if (v === ".") {
                                                    setAmount("0.")
                                                }
                                            }}
                                            className="w-full px-2 border border-gray-300 text-sm border-none disabled:text-[#E5E5E566]"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-amber-600">
                                        <span>(Minimum Withdrawal: $20)</span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <button onClick={() => setAmount((balance / 4).toFixed(2).toString())} className={`w-full p-2 rounded-sm font-medium cursor-pointer ${amount === (balance / 4).toFixed(2).toString() ? "bg-[#1475E1]" : "bg-white/10"}`}>25%</button>
                                        <button onClick={() => setAmount((balance / 2).toFixed(2).toString())} className={`w-full p-2 rounded-sm font-medium cursor-pointer ${amount === (balance / 2).toFixed(2).toString() ? "bg-[#1475E1]" : "bg-white/10"}`}>50%</button>
                                        <button onClick={() => setAmount((balance * 0.75).toFixed(2).toString())} className={`w-full p-2 rounded-sm font-medium cursor-pointer ${amount === (balance * 0.75).toFixed(2).toString() ? "bg-[#1475E1]" : "bg-white/10"}`}>75%</button>
                                        <button onClick={() => setAmount(balance.toFixed(2).toString())} className={`w-full p-2 rounded-sm font-medium cursor-pointer ${amount === balance.toFixed(2).toString() ? "bg-[#1475E1]" : "bg-white/10"}`}>MAX</button>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="flex gap-1">
                                        <span className="block text-sm">Address</span>
                                        <span className="text-[#EB2444]">*</span>
                                    </label>
                                    <div className="flex items-center rounded-lg border border-[#E5E5E566] bg-[#0D111B] p-2">
                                        <input
                                            id="recipientAddress"
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value.trim())}
                                            className="w-full disabled:text-[#E5E5E566] text-sm"
                                        />
                                        <svg onClick={() => {
                                            navigator?.clipboard?.readText().then(text => {
                                                setAddress(text)
                                            }).catch(err => {
                                                console.error('Failed to read clipboard contents: ', err);
                                            });

                                        }} className="w-4 h-4 cursor-pointer"><use href="#svg-paste" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 items-start w-full p-3 border border-white/20 bg-[#0D111B]/60 rounded-xl">
                                <svg className="w-4 h-4"><use href="#svg-i" /></svg>
                                <p className="w-full text-xs text-white/70">Wagering requirements are in place to comply with our Anti-Money Laundering (AML) policy. To withdraw funds, you must wager at least 1x the total amount of your deposit. If you need any assistance or have questions, our support team is here to help.</p>
                            </div>
                            <div className="flex flex-col gap-4 text-sm p-4 rounded-lg bg-black/10">
                                <div className="flex justify-between gap-4 items-center">
                                    <span>Requested Amount</span>
                                    <span className="font-medium">${Number(amount).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between gap-4 items-center">
                                    <span>Transaction Fee</span>
                                    <span className="font-medium">${(txFee + Number(amount) * 0.01).toFixed(2)}</span>
                                </div>
                                <div className="border-b border-[#E5E5E566] border-dashed"></div>
                                <div className="flex justify-between items-center gap-1">
                                    <span>You will receive</span>
                                    <span className="font-medium">${Math.max(Number(amount) * 0.99 - txFee, 0).toFixed(2)}</span>
                                </div>
                            </div>
                            {dpVsBt.bet < dpVsBt.deposit &&
                                <div className="flex flex-col gap-2 w-full p-6 border border-[#FF6467] bg-linear-to-r from-[#FF64671A] to-[#FF64671A]">
                                    <p className="text-[#ff7664] text-sm">Your bet amount is less than your deposit. You can request a withdrawal only after placing bets totaling your deposited amount.</p>
                                </div>
                            }
                            {sendingRequest ?
                                <div className="w-full flex justify-center"><CircularIndeterminate /></div> :
                                <button onClick={handleWithdraw} className="w-full p-4 bg-[#1475E1] hover:bg-[#3384e0] cursor-pointer disabled:cursor-not-allowed disabled:bg-[#01A3DB44] border border-[#364153] rounded-[10px] text-sm font-semibold" disabled={sendingRequest || (dpVsBt.bet < dpVsBt.deposit)}>
                                    Request Withdrawal
                                </button>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}