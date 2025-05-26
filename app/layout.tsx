import type { Metadata } from "next";
import "./globals.css";
import GlobalProvider from "@/components/shared/global-provider";

export const metadata: Metadata = {
  title: "Dokannama - Complete Point of Sale Solution",
  description:
    "A versatile, web-based Point of Sale (POS) system designed to serve multiple industries with customizable workflows. Currently optimized for restaurants and pharmacies, with scalable architecture to support any retail or service business in the future.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <GlobalProvider>{children}</GlobalProvider>
      </body>
    </html>
  );
}
