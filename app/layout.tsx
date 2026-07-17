import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Valorian — AI Business Analyst | Valora Advisory",
  description:
    "Valorian is Valora Advisory's internal AI Business Analyst workspace — capturing ideas, running client diagnostics and drafting proposals.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
