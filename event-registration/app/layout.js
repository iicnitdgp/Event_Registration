import { Inter } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/component/sessionwrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Event Registration System",
  description: "Manage events and registrations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <SessionWrapper>
        <body className={inter.className}>{children}</body>
      </SessionWrapper>
    </html>
  );
}