"use client"
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
}
const GlobalContext = createContext<StoreType>({ username: null, role: null, ref: null, balance: 0, token: "", setToken: () => { }, winstreak: 0, fullname: "", oddstype: "decimal", avatar: "" })
const GlobalContextProvider = ({ children }: { children: ReactNode }) => {

    const [username, setUsername] = useState<string | null>(null)
    const [fullname, setFullname] = useState<string>("")
    const [avatar, setAvatar] = useState<string>("")
    const [role, setRole] = useState<string | null>(null)
    const [ref, setRef] = useState<string | null>(null)
    const [winstreak, setWinstreak] = useState<number>(0)
    const [balance, setBalance] = useState<number>(0)
    const [token, setToken] = useState<string>("")
    const [oddstype, setOddstype] = useState<"decimal" | "american">("decimal")
    const pathname = usePathname()
    const router = useRouter()
    useEffect(() => {
        setToken(localStorage.getItem("jwt")!)
    }, [])
    useEffect(() => {
        // const regex = /^\/deposit\/[a-f0-9]{24}(?:\/result)?$/;
        localStorage.setItem("jwt", token)
        if (/* !regex.test(pathname) &&  */ pathname !== "/register" && !window.location.href.includes("redirect") && (token === "LOGOUT" || token === "null")) {
            router.push(["admin", "manager", "login"].some(v => window.location.href.includes(v)) ? `/login` : `/login?redirect=${window.location.href}`)
            return
        }
        const decodedToken: any = jwt.decode(token)
        setBalance(decodedToken?.balance || 0)
        setUsername(decodedToken?.username)
        setRole(decodedToken?.role)
        setRef(decodedToken?.ref)
        setWinstreak(decodedToken?.winstreak)
        setFullname(decodedToken?.fullname)
        setOddstype(decodedToken?.oddstype)
        setAvatar(decodedToken?.avatar)

    }, [token, pathname])
    return (
        <GlobalContext.Provider value={{ username, role, ref, balance, token, setToken, winstreak, fullname, oddstype, avatar }}>
            {children}
        </GlobalContext.Provider>
    )
}
export default GlobalContextProvider
export const useUser = () => ({ //TODO: Remove this
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
})