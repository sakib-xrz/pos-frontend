"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  Users,
  Receipt,
  Settings,
  LogOut,
  Menu,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: <Tag className="mr-2 h-4 w-4" />,
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: <ShoppingBag className="mr-2 h-4 w-4" />,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: <Receipt className="mr-2 h-4 w-4" />,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: <Users className="mr-2 h-4 w-4" />,
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: <Settings className="mr-2 h-4 w-4" />,
  },
  {
    href: "/change-password",
    label: "Change Password",
    icon: <Lock className="mr-2 h-4 w-4" />,
  },
];

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Navigation */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden fixed top-3 right-4 z-40"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <div className="py-4 border-b">
              <h2 className="text-xl font-bold px-4">Admin Panel</h2>
            </div>
            <nav className="flex-1 py-4">
              <ul className="space-y-1 px-2">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center px-2 py-2 rounded-md hover:bg-gray-100"
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="p-4 border-t">
              <Button
                variant="destructive"
                className="w-full justify-start px-2"
                onClick={() => router.push("/logout")}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r">
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center h-16 flex-shrink-0 px-4 border-b">
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-2 py-2 rounded-md hover:bg-gray-100"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex-shrink-0 flex border-t p-4">
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={() => router.push("/logout")}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
