import type { Metadata } from "next";
import localFont from "next/font/local";
import { WebSocketProvider } from "@/components/providers/websocket";
import "./globals.css";
import { ConnectionStatus } from "@/components/ui/connection-status";

const geistSans = localFont({
   src: "./fonts/GeistVF.woff",
   variable: "--font-geist-sans",
   weight: "100 900",
});
const geistMono = localFont({
   src: "./fonts/GeistMonoVF.woff",
   variable: "--font-geist-mono",
   weight: "100 900",
});

export const metadata: Metadata = {
   title: "Nursing Home",
   description: "Generated by create next app",
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html lang="en">
         <body className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}>
            <WebSocketProvider>
               {children}
               <ConnectionStatus />
            </WebSocketProvider>
         </body>
      </html>
   );
}
