import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Rubik, Karla } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-rubik",
  display: "swap",
});

const karla = Karla({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-karla",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CampusStay — Student housing, minus the chaos",
    template: "%s · CampusStay",
  },
  description:
    "CampusStay connects students, landlords and administrators in one trusted platform: verified listings, real-time vacancies, online booking, rent tracking and maintenance management.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${rubik.variable} ${karla.variable}`}>
      <body className="bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}
