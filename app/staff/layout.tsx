"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Home, LogOut, Menu, Lock, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentUser } from "@/redux/features/auth/authSlice";

const navItems = [
  {
    href: "/staff/pos",
    label: "POS",
    icon: <Home className="mr-2 h-4 w-4" />,
  },
  {
    href: "/staff/orders",
    label: "Orders",
    icon: <ShoppingBag className="mr-2 h-4 w-4" />,
  },
  {
    href: "/change-password",
    label: "Change Password",
    icon: <Lock className="mr-2 h-4 w-4" />,
  },
];

export default function StaffLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const user = useCurrentUser();

  const isActive = (href: string) => {
    if (href === "/change-password") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Navigation */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed top-3 right-4 z-40 print:hidden"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <div className="py-4 border-b">
              <h2 className="text-xl font-bold px-4">Staff Panel</h2>
            </div>
            <nav className="flex-1 py-4">
              <ul className="space-y-1 px-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center px-2 py-2 rounded-md transition-colors ${
                        isActive(item.href)
                          ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                          : "hover:bg-gray-100 border-l-4 border-transparent"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="p-4 border-t">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gray-300 text-gray-700 uppercase">
                      {user?.email?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-700 font-medium truncate max-w-[150px]">
                      {user?.email}
                    </span>
                    <span className="text-xs text-gray-500">Staff</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/logout")}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation */}
      {/* <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center h-16 flex-shrink-0 px-4 border-b">
            <h1 className="text-xl font-bold">Staff Panel</h1>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-2 py-2 rounded-md transition-colors ${
                  isActive(item.href)
                    ? "bg-blue-100 text-blue-700 border-l-4 border-blue-500"
                    : "hover:bg-gray-100 border-l-4 border-transparent"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex-shrink-0 flex border-t p-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gray-300 text-gray-700 uppercase">
                    {user?.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-700 font-medium truncate max-w-[150px]">
                    {user?.email}
                  </span>
                  <span className="text-xs text-gray-500">Staff</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/logout")}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div> */}

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
