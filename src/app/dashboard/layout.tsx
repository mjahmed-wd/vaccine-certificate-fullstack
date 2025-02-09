/* eslint-disable @next/next/no-img-element */
'use client';

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard" },
    ...(session?.user?.role === "ADMIN" 
      ? [
          { name: "Users", href: "/dashboard/users" },
          { name: "Vaccines", href: "/dashboard/vaccines" },
        ] 
      : []
    ),
    { name: "Certificates", href: "/dashboard/certificates" },
  ];

  const handleLogout = async () => {
    try {
      await signOut({
        callbackUrl: "/login",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-green-900 to-green-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo and Title - Left Side */}
            <div className="flex items-center flex-1">
              <Link href="/dashboard" className="flex items-center space-x-2 md:space-x-4">
                <img
                  src="/popular-logo.png"
                  alt="Hospital Logo"
                  className="h-10 w-10 md:h-12 md:w-12 object-contain"
                />
                <div className="text-white">
                  <div className="text-sm md:text-lg font-semibold leading-tight">POPULAR MEDICAL</div>
                  <div className="text-xs md:text-sm font-medium text-gray-300 hidden sm:block">HOSPITAL SYLHET</div>
                </div>
              </Link>
            </div>

            {/* Mobile Menu Button - Right Side */}
            <div className="flex lg:hidden pl-4">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-300 hover:text-white focus:outline-none"
                aria-label="Open menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Desktop Navigation and User Info */}
            <div className="hidden lg:flex flex-1 items-center justify-between">
              <div className="flex space-x-6 justify-center flex-1">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${
                      pathname === item.href
                        ? 'text-white border-b-2 border-white'
                        : 'text-gray-300 hover:text-white'
                    } px-2 py-4 text-sm font-medium transition-colors duration-200`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {session?.user?.firstName} {session?.user?.lastName}
                  </p>
                  <p className="text-xs font-light text-gray-300">
                    {session?.user?.role}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 text-white hover:bg-green-700 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`lg:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
            <div className="pt-2 pb-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? 'bg-green-800 text-white'
                      : 'text-gray-300 hover:bg-green-700 hover:text-white'
                  } block px-3 py-2 rounded-md text-base font-medium`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-green-700">
                <div className="px-3 py-2 text-sm text-gray-300">
                  Signed in as {session?.user?.firstName} {session?.user?.lastName}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-white hover:bg-green-700 rounded-md"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
} 