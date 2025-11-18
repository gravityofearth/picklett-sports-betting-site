"use client"

import AvatarCrop from "@/components/AvatarCrop"
import { useUser } from "@/store"
import { showToast, validateUsername } from "@/utils"
import axios, { AxiosError } from "axios"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

export default function Settings() {
    const [sendingRequest, setSendingRequest] = useState(false)
    const [isChangingEmail, setChangingEmail] = useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const { username: currentUsername, fullname: currentFullName, email: currentEmail, emailVerified, oddstype: currentOddstype, avatar, setToken } = useUser()
    const [isError, setError] = useState(false)
    const [newUsername, setNewUsername] = useState(currentUsername)
    const [newEmail, setNewEmail] = useState("")
    const [newFullname, setNewFullname] = useState(currentFullName)
    const [oddstype, setOddstype] = useState<"decimal" | "american">(currentOddstype)
    useEffect(() => { setOddstype(currentOddstype) }, [currentOddstype])
    useEffect(() => { setNewEmail(currentEmail) }, [currentEmail])

    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [avatarFile, setAvatarFile] = useState<File>()

    const handleUsername = async () => {
        if (!newUsername || !currentUsername || newUsername.trim() === currentUsername.trim()) return
        setSendingRequest(true)
        axios.put(`/api/profile/username`, { newUsername: newUsername.trim() }, { headers: { token: localStorage.getItem("jwt") } })
            .then(({ data: { token } }) => {
                setToken(token)
                showToast("Updated username successfully!", "success")
            })
            .catch((e: AxiosError) => {
                showToast(e.response?.statusText || "Unknown Error", "error")
            }).finally(() => setSendingRequest(false))
    }
    const handleFullname = async () => {
        if (!newFullname || newFullname.trim() === currentFullName?.trim()) return
        setSendingRequest(true)
        axios.put(`/api/profile/fullname`, { fullname: newFullname.trim() }, { headers: { token: localStorage.getItem("jwt") } })
            .then(({ data: { token } }) => {
                setToken(token)
                showToast("Updated fullname successfully!", "success")
            })
            .catch((e: AxiosError) => {
                showToast(e.response?.statusText || "Unknown Error", "error")
            }).finally(() => setSendingRequest(false))
    }
    const handleChangeEmail = async () => {
        if (!isChangingEmail) {
            setChangingEmail(true)
            return
        }
        if (!newEmail || newEmail.trim() === currentEmail?.trim()) return
        if (!/^.+@.+\..+$/.test(newEmail)) {
            showToast("Input Correct Email", "warn")
            return
        }
        setSendingRequest(true)
        axios.put(`/api/profile/email`, { email: newEmail.trim() }, { headers: { token: localStorage.getItem("jwt") } })
            .then(({ data: { token } }) => {
                setToken(token)
                showToast("Verification email sent to your email address", "success")
            })
            .catch((e: AxiosError) => {
                showToast(e.response?.statusText || "Unknown Error", "error")
            }).finally(() => {
                setSendingRequest(false)
                setChangingEmail(false)
            })
    }
    const handleOddstype = async (oddstype: "decimal" | "american") => {
        setOddstype(oddstype)
        setSendingRequest(true)
        axios.put(`/api/profile/oddstype`, { oddstype }, { headers: { token: localStorage.getItem("jwt") } })
            .then(({ data: { token } }) => {
                setToken(token)
                showToast("Updated Odds Type successfully!", "success")
            })
            .catch((e: AxiosError) => {
                showToast(e.response?.statusText || "Unknown Error", "error")
            }).finally(() => setSendingRequest(false))
    }
    const handlePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) return
        if (newPassword !== confirmPassword) {
            showToast("Password not matching", "warn")
            return
        }
        setSendingRequest(true)
        axios.put(`/api/profile/password`, { currentPassword, newPassword }, { headers: { token: localStorage.getItem("jwt") } })
            .then(() => {
                showToast("Password changed successfully!", "success")
            })
            .catch((e: AxiosError) => {
                showToast(e.response?.statusText || "Unknown Error", "error")
            }).finally(() => setSendingRequest(false))
    }
    const file_ref = useRef<HTMLInputElement>(null)
    const handleAvatarClick = () => {
        setError(false)
        file_ref.current?.click()
    }
    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) {
            return;
        }
        setAvatarFile(files[0])
        event.target.value = ""
    }
    return (
        <div className="w-full flex justify-center">
            {avatarFile &&
                <div className="fixed left-0 right-0 top-0 bottom-0 flex justify-center bg-black z-50 overflow-y-auto">
                    <div className="w-3xl max-w-full bg-black p-4">
                        <AvatarCrop params={{
                            avatarFile,
                            closeModal: () => setAvatarFile(undefined),
                            callback: (data) => setToken(data.token),
                            api: "/api/profile/avatar",
                        }} />
                    </div>
                </div>
            }
            <div className="w-full max-w-2xl flex flex-col bg-linear-to-r from-[#101828] to-[#1E2939] border border-[#364153] rounded-2xl p-8 gap-8">
                <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-[26px] font-semibold">Account Setting</h1>
                        <p className="text-[18px] text-[#90A1B9]">Customize your account and security preferences</p>
                    </div>
                    {/* <div className="flex gap-1 items-center bg-[#00BC7D1A] border border-[#00BC7D33] text-[#00D492] px-3 py-2 rounded-lg">
                        <svg className="w-4 h-4 shrink-0"><use href="#svg-redeem" /></svg>
                        <span className="text-sm">Verified Account</span>
                    </div> */}
                </div>
                <div />
                <div className="w-full flex flex-col gap-6 ">
                    <div className="flex gap-5 items-center">
                        <svg className="w-4 h-4"><use href="#svg-user" /></svg>
                        <h2 className="text-xl">Profile Information</h2>
                    </div>
                    <div className="w-full grid grid-cols-5 max-md:grid-cols-1 gap-8">
                        <div className="flex flex-col col-span-2 max-md:col-span-1 gap-4">
                            <p className="text-sm text-[#D1D5DC]">Profile Picture</p>
                            <div className="flex flex-col gap-4 items-center">
                                <div className="w-24 h-24 relative rounded-full overflow-hidden flex justify-center items-center bg-[#FFFFFF33] bg-cover bg-center" style={{ backgroundImage: `url(/api/profile/avatar/${avatar})` }} >
                                    {avatar && !isError ?
                                        <Image onError={() => setError(true)} src={`/api/profile/avatar/${avatar}`} className="w-0" width={96} height={96} alt="avatar" /> :
                                        <svg className="w-8 h-8"><use href="#svg-user" /></svg>
                                    }
                                </div>
                                <div className="hidden">
                                    <input onChange={handleAvatarChange} type="file" name="file" ref={file_ref} />
                                </div>
                                <button onClick={handleAvatarClick} disabled={sendingRequest}
                                    className="w-fit flex gap-2 items-center py-3 px-4 bg-[#1E293980] border border-[#4A5565] rounded-lg cursor-pointer hover:bg-[#34405380] disabled:cursor-not-allowed">
                                    <svg className="w-4 h-4"><use href="#svg-upload" /></svg>
                                    <span className="text-sm text-[#D1D5DC]">Upload Photo</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col justify-between gap-4 w-full col-span-3 max-md:col-span-1">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="username" className="block text-sm text-[#D1D5DC]">Username</label>
                                <div className="flex justify-between items-center gap-3 text-sm">
                                    <div
                                        // id="username"
                                        // type="text"
                                        // value={newUsername || currentUsername || ""}
                                        // onChange={(e) => {
                                        //     if (!validateUsername(e.target.value.trim())) return
                                        //     setNewUsername(e.target.value.trim())
                                        // }}
                                        className="bg-[#1E293999] w-full border border-[#E5E5E566] rounded-md px-2 py-3"
                                    >{currentUsername}</div>
                                    {/* <button onClick={handleUsername} disabled={sendingRequest || !newUsername || !currentUsername || newUsername.trim() === currentUsername.trim()} className="w-25 bg-[#01A3DB] cursor-pointer hover:bg-[#0b6886] py-3 border border-[#01A3DB] rounded-md disabled:cursor-not-allowed disabled:bg-[#0b6886]">Save</button> */}
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label htmlFor="fullname" className="block text-sm text-[#D1D5DC]">Full Name</label>
                                <div className="flex justify-between items-center gap-3 text-sm">
                                    <input
                                        id="fullname"
                                        type="text"
                                        value={newFullname || currentFullName || ""}
                                        onChange={(e) => {
                                            setNewFullname(e.target.value)
                                        }}
                                        className="bg-[#1E293999] w-full border border-[#E5E5E566] rounded-md px-2 py-3"
                                    />
                                    <button onClick={handleFullname} disabled={sendingRequest || !newFullname || newFullname.trim() === currentFullName?.trim()} className="w-25 bg-[#01A3DB] cursor-pointer hover:bg-[#0b6886] py-3 border border-[#01A3DB] rounded-md disabled:cursor-not-allowed disabled:bg-[#0b6886]">Update</button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <label htmlFor="fullname" className="block text-sm text-[#D1D5DC]">Email</label>
                                    <div className="flex items-center gap-1">
                                        <svg className="w-6 h-6"><use href={emailVerified ? "#svg-success" : "#svg-expired"} /></svg>
                                        <span className="text-[14px]">{emailVerified ? "Verified" : "Not Verified"}</span>
                                    </div>
                                </div>
                                <div className={`flex max-md:flex-col ${isChangingEmail ? "flex-col" : ""} justify-between items-center gap-3 text-sm`}>
                                    <input
                                        id="email"
                                        type="email"
                                        disabled={!isChangingEmail}
                                        value={newEmail || currentEmail || ""}
                                        onChange={(e) => {
                                            setNewEmail(e.target.value)
                                        }}
                                        className="bg-[#1E293999] w-full border border-[#E5E5E566] rounded-md px-2 py-3"
                                    />
                                    <div className="flex items-center gap-2">
                                        <button onClick={handleChangeEmail} disabled={emailVerified || isChangingEmail && (sendingRequest || !newEmail || newEmail.trim() === currentEmail?.trim())} className="w-25 bg-[#01A3DB] cursor-pointer hover:bg-[#0b6886] py-3 border border-[#01A3DB] rounded-md disabled:cursor-not-allowed disabled:bg-[#0b6886]">
                                            {isChangingEmail ? "Update" : "Edit"}
                                        </button>
                                        {isChangingEmail &&
                                            <button onClick={() => {
                                                setChangingEmail(false)
                                                setNewEmail(currentEmail)
                                            }} className="w-25 bg-[#c21d1d] cursor-pointer py-3 rounded-md ">
                                                Cancel
                                            </button>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-full h-[1px] bg-linear-to-r from-[#00BFFF00] via-[#00BFFF4D] to-[#00BFFF00]" />
                <div className="w-full flex flex-col gap-6">
                    <div className="flex gap-5 items-center">
                        <svg className="w-4 h-4 fill-white"><use href="#svg-preference" /></svg>
                        <h2 className="text-xl">Preferences</h2>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="odd-format" className="block text-sm text-[#D1D5DC]">Odds Type</label>
                        <select value={oddstype} onChange={(e) => handleOddstype(e.target.value as ("decimal" | "american"))} name="odd-format" id="odd-format" className="border border-[#E5E5E566] rounded-md p-2 outline-none">
                            <option value="decimal">Decimal</option>
                            <option value="american">American</option>
                        </select>
                    </div>
                </div>
                {/* <div className="w-full h-[1px] bg-linear-to-r from-[#00BFFF00] via-[#00BFFF4D] to-[#00BFFF00]" />
                <div className="w-full flex flex-col gap-6">
                    <div className="flex gap-5 items-center">
                        <svg className="w-4 h-4"><use href="#svg-mail" /></svg>
                        <h2 className="text-xl">Email Address</h2>
                        <div className="flex gap-1 items-center bg-[#00BC7D1A] border border-[#00BC7D33] text-[#00D492] px-3 py-2 rounded-full">
                            <svg className="w-3 h-3"><use href="#svg-redeem" /></svg>
                            <span className="text-xs">Verified</span>
                        </div>
                    </div>
                    <div className="w-full flex max-md:flex-col justify-between items-center gap-3 text-sm">
                        <input type="text" className="bg-[#1E293999] w-full border border-[#E5E5E566] rounded-md px-2 py-3" />
                        <button className="w-40 max-md:w-full bg-[#01A3DB] cursor-pointer hover:bg-[#0b6886] py-3 border border-[#01A3DB] rounded-md">Change Email</button>
                    </div>
                </div> */}
                <div className="w-full h-[1px] bg-linear-to-r from-[#00BFFF00] via-[#00BFFF4D] to-[#00BFFF00]" />
                <div className="w-full flex flex-col gap-6">
                    <div className="flex gap-5 items-center">
                        <svg className="w-4 h-4"><use href="#svg-lock" /></svg>
                        <h2 className="text-xl">Password & Security</h2>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="current-password" className="block text-sm text-[#D1D5DC]">Current Password</label>
                        <div className="flex justify-between items-center w-full p-2 rounded-lg border border-[#E5E5E599]">
                            <input
                                id="current-password"
                                autoComplete="current-password"
                                type={showCurrentPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="bg-[#1E293999] w-full rounded-md px-2 py-1 text-sm"
                                required
                            />
                            <svg className="w-[18px] h-6 cursor-pointer" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                <use href={showCurrentPassword ? "#svg-password-hide" : "#svg-password-preview"} />
                            </svg>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="new-password" className="block text-sm text-[#D1D5DC]">New Password</label>
                        <div className="flex justify-between items-center w-full p-2 rounded-lg border border-[#E5E5E599]">
                            <input
                                id="new-password"
                                autoComplete="new-password"
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="bg-[#1E293999] w-full rounded-md px-2 py-1 text-sm"
                                required
                            />
                            <svg className="w-[18px] h-6 cursor-pointer" onClick={() => setShowNewPassword(!showNewPassword)}>
                                <use href={showNewPassword ? "#svg-password-hide" : "#svg-password-preview"} />
                            </svg>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="confirm-password" className="block text-sm text-[#D1D5DC]">Confirm Password</label>
                        <div className="flex justify-between items-center w-full p-2 rounded-lg border border-[#E5E5E599]">
                            <input
                                id="confirm-password"
                                autoComplete="new-password"
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-[#1E293999] w-full rounded-md px-2 py-1 text-sm"
                                required
                            />
                            <svg className="w-[18px] h-6 cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                <use href={showConfirmPassword ? "#svg-password-hide" : "#svg-password-preview"} />
                            </svg>
                        </div>
                    </div>
                    <button onClick={handlePassword} disabled={sendingRequest} className="w-40 bg-[#01A3DB] cursor-pointer hover:bg-[#0b6886] py-3 border border-[#01A3DB] rounded-md disabled:cursor-not-allowed disabled:bg-[#005977]">
                        Change Password
                    </button>
                </div>
                {/* <div className="w-full h-[1px] bg-linear-to-r from-[#FB2C3600] via-[#FB2C364D] to-[#FB2C3600]" />
                <div className="w-full flex flex-col gap-6">
                    <div className="flex gap-5 items-center">
                        <div className="p-2 rounded-lg bg-linear-to-r from-[#FB2C36] to-[#E7000B]">
                            <svg className="w-4 h-4"><use href="#svg-warning" /></svg>
                        </div>
                        <h2 className="text-xl">Danger Zone</h2>
                    </div>
                    <div className="w-full flex flex-col gap-5 bg-[#FB2C3617] border border-[#FB2C3633] rounded-2xl p-4">
                        <div className="flex max-md:flex-col justify-between gap-4 items-end max-md:items-start">
                            <div className="flex flex-col gap-2">
                                <h2>Close Account</h2>
                                <p className="text-[#99A1AF] text-sm">Permanently delete your account and all associated data. this action cannot be undone.</p>
                            </div>
                            <button className="w-40 max-md:w-full bg-linear-to-r from-[#FB2C36] to-[#E7000B] cursor-pointer hover:bg-[#0b6886] py-2 rounded-md">Close Account</button>
                        </div>
                    </div>
                </div> */}
            </div>
        </div >
    )
}