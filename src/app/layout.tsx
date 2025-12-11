import type { Metadata } from "next";
import { GoogleTagManager } from '@next/third-parties/google';
import "./globals.css";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import SVGs from "@/components/SVG";
import { GlobalContextProvider } from "@/store";
import { patchConsole } from "@/utils/patch";
patchConsole()

export const metadata: Metadata = {
  title: "Picklett Sports Betting",
  description: "A sports betting website that offers a seamless gateway for users to place bets and access betting services.",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <GoogleTagManager gtmId="GTM-PGCC8HSF" />
      <head><link href="https://fonts.cdnfonts.com/css/euclid-circular-b" rel="stylesheet"></link></head>
      <body
        className={`antialiased`} style={{ fontFamily: "Euclid Circular B, Segoe UI" }}
      >
        <GlobalContextProvider>
          <SVGs />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss={false}
            draggable
            pauseOnHover
            theme="colored"
          />
          {children}
        </GlobalContextProvider>
      </body>
    </html>
  );
}
