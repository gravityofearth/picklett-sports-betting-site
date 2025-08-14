"use client"
import jwt from "jsonwebtoken"
import { usePathname, useRouter } from "next/navigation";
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react";
type StoreType = {
    username: string | null,
    balance: number,
    token: string,
    setToken: Dispatch<SetStateAction<string>>,
}
const GlobalContext = createContext<StoreType>({ username: null, balance: 0, token: "", setToken: () => { } })
const GlobalContextProvider = ({ children }: { children: ReactNode }) => {

    const [username, setUsername] = useState<string | null>(null)
    const [balance, setBalance] = useState<number>(0)
    const [token, setToken] = useState<string>("")
    const pathname = usePathname()
    const router = useRouter()
    useEffect(() => {
        setToken(localStorage.getItem("jwt")!)
    }, [])
    useEffect(() => {
        const regex = /^\/deposit\/[a-f0-9]{24}(?:\/result)?$/;
        localStorage.setItem("jwt", token)
        if (!regex.test(pathname) && (token === "LOGOUT" || token === "null")) {
            router.push("/login")
            return
        }
        setBalance((jwt.decode(token) as any)?.balance || 0)
        setUsername((jwt.decode(token) as any)?.username)
    }, [token, pathname])
    return (
        <GlobalContext.Provider value={{ username, balance, token, setToken }}>
            {children}
        </GlobalContext.Provider>
    )
}
export default GlobalContextProvider
export const useUser = () => ({
    username: useContext(GlobalContext).username,
    balance: useContext(GlobalContext).balance,
    token: useContext(GlobalContext).token,
    setToken: useContext(GlobalContext).setToken,
})