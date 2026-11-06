import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Suthra Punjab | Beat QR Management",
  description: "Sanitation beat management, QR access and public complaint registration.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
