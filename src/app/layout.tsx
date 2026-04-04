import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grad School Decision Calculator",
  description: "Compare grad school options using weighted scoring and confidence intervals",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
