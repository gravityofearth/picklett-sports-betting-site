"use client"
import { ProgressProvider } from '@bprogress/next/app';
import { UserClanType } from "@/types";
import axios from "axios";
import jwt from "jsonwebtoken"
import { usePathname, useRouter } from "next/navigation";
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react";
type StoreType = {
    username: string | null,
    role: string | null,
    ref: string | null,
    balance: number,
    token: string,
    setToken: Dispatch<SetStateAction<string>>,
    winstreak: number,
    fullname: string,
    oddstype: "decimal" | "american",
    avatar: string,
    clan: UserClanType | undefined,
    email: string,
    emailVerified: boolean,
    lineCount: { sports: string; count: number; }[],
}
const GlobalContext = createContext<StoreType>({ username: null, role: null, ref: null, balance: 0, token: "", setToken: () => { }, winstreak: 0, fullname: "", oddstype: "decimal", avatar: "", clan: undefined, email: "", emailVerified: false, lineCount: [] })
export const GlobalContextProvider = ({ children }: { children: ReactNode }) => {

    const [username, setUsername] = useState<string | null>(null)
    const [fullname, setFullname] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    const [emailVerified, setEmailVerified] = useState<boolean>(false)
    const [avatar, setAvatar] = useState<string>("")
    const [clan, setClan] = useState<UserClanType>()
    const [role, setRole] = useState<string | null>(null)
    const [ref, setRef] = useState<string | null>(null)
    const [winstreak, setWinstreak] = useState<number>(0)
    const [balance, setBalance] = useState<number>(0)
    const [token, setToken] = useState<string>("")
    const [oddstype, setOddstype] = useState<"decimal" | "american">("decimal")
    const pathname = usePathname()
    const router = useRouter()

    const [lineCount, setLineCount] = useState<{ sports: string; count: number; }[]>([])
    useEffect(() => {
        setToken(localStorage.getItem("jwt")!)
    }, [])
    useEffect(() => {
        // const regex = /^\/deposit\/[a-f0-9]{24}(?:\/result)?$/;
        localStorage.setItem("jwt", token)
        // if (/* !regex.test(pathname) &&  */ !["/register", "/home", "/winstreak"].includes(pathname) && !window.location.href.includes("redirect") && (token === "LOGOUT" || token === "null")) {
        //     router.push(["admin", "manager", "login"].some(v => window.location.href.includes(v)) ? `/login` : `/login?redirect=${window.location.href}`)
        //     return
        // }
        const decodedToken: any = jwt.decode(token)
        setBalance(decodedToken?.balance || 0)
        setUsername(decodedToken?.username)
        setRole(decodedToken?.role)
        setRef(decodedToken?.ref)
        setWinstreak(decodedToken?.winstreak)
        setFullname(decodedToken?.fullname)
        setOddstype(decodedToken?.oddstype)
        setAvatar(decodedToken?.avatar)
        setClan(decodedToken?.clan)
        setEmail(decodedToken?.email)
        setEmailVerified(decodedToken?.emailVerified)
    }, [token, pathname])
    useEffect(() => {
        axios.get(`/api/line/count`, { headers: { token: localStorage.getItem("jwt") } }).then(({ data }) => setLineCount(data))
    }, [pathname])
    return (
        <GlobalContext.Provider value={{ username, role, ref, balance, token, setToken, winstreak, fullname, oddstype, avatar, clan, email, emailVerified, lineCount }}>
            <ProgressProvider
                height="4px"
                color="#1475E1"
                options={{ showSpinner: false }}
                shallowRouting
            >
                {children}
            </ProgressProvider>
        </GlobalContext.Provider>
    )
}
export const useUser = () => ({
    username: useContext(GlobalContext).username,
    role: useContext(GlobalContext).role,
    ref: useContext(GlobalContext).ref,
    balance: useContext(GlobalContext).balance,
    token: useContext(GlobalContext).token,
    setToken: useContext(GlobalContext).setToken,
    winstreak: useContext(GlobalContext).winstreak,
    fullname: useContext(GlobalContext).fullname,
    oddstype: useContext(GlobalContext).oddstype,
    avatar: useContext(GlobalContext).avatar,
    clan: useContext(GlobalContext).clan,
    email: useContext(GlobalContext).email,
    emailVerified: useContext(GlobalContext).emailVerified,
    lineCount: useContext(GlobalContext).lineCount,
})