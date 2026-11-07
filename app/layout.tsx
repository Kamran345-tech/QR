import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Suthra Punjab | Beat QR Management",
  applicationName: "Suthra Punjab Beat QR Portal",
  description: "Official Suthra Punjab sanitation beat management portal, QR access and public complaint registration.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: ["/favicon.svg"],
    apple: ["/favicon.svg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
