"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { SearchBar } from "@/components/ui/SearchBar"
import Link from "next/link"

interface MobileSidebarProps {
    isAuthenticated: boolean
    logoutAction?: () => Promise<void>
}

/**
 * MobileSidebar: Toggle button + overlay sidebar for mobile view.
 * Contains nav actions + search + info. Only visible on mobile.
 */
export const MobileSidebar = ({ isAuthenticated, logoutAction }: MobileSidebarProps) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleClose = () => setIsOpen(false)

    return (
        <>
            {/* Toggle Button - visible only on mobile */}
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden p-2 rounded-lg hover:bg-carbon/5 active:scale-95 transition-all"
                aria-label="Open menu"
            >
                <Menu className="w-6 h-6 text-carbon" />
            </button>

            {/* Overlay */}
            <div
                className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${isOpen ? "visible pointer-events-auto" : "invisible pointer-events-none delay-200"
                    }`}
            >
                {/* Backdrop - touch-action:none prevents scroll-through on mobile */}
                <div
                    className={`absolute inset-0 bg-carbon/20 backdrop-blur-sm transition-opacity duration-300 touch-action-none ${isOpen ? "opacity-100" : "opacity-0"
                        }`}
                    onClick={handleClose}
                    aria-hidden="true"
                    style={{ touchAction: "none" }}
                />

                {/* Sidebar Panel - overscroll-behavior prevents scroll chaining */}
                <div
                    className={`absolute right-0 top-0 h-full w-72 bg-white shadow-xl transition-transform duration-300 ease-in-out transform overflow-y-auto overscroll-contain ${isOpen ? "translate-x-0" : "translate-x-full"
                        }`}
                >
                    {/* Header with close button */}
                    <div className="flex items-center justify-between p-4 border-b border-carbon/10">
                        <span className="text-sm font-medium text-carbon/60">Menu</span>
                        <button
                            onClick={handleClose}
                            className="p-2 rounded-lg hover:bg-carbon/5 active:scale-95 transition-all"
                            aria-label="Close menu"
                        >
                            <X className="w-5 h-5 text-carbon" />
                        </button>
                    </div>

                    {/* Nav Actions */}
                    <div className="p-4 border-b border-carbon/10 space-y-3">
                        {isAuthenticated ? (
                            <>
                                <Link href="/review/new" onClick={handleClose} className="block">
                                    <Button className="w-full">Write Review</Button>
                                </Link>
                                {logoutAction && (
                                    <form action={logoutAction}>
                                        <Button type="submit" className="w-full">
                                            Logout
                                        </Button>
                                    </form>
                                )}
                            </>
                        ) : (
                            <Link href="/login" onClick={handleClose} className="block">
                                <Button className="w-full">Sign In</Button>
                            </Link>
                        )}
                    </div>

                    {/* Search */}
                    <div className="p-4 border-b border-carbon/10">
                        <SearchBar />
                    </div>

                    {/* Info Section */}
                    <div className="p-4">
                        <p className="text-sm text-carbon/50 leading-relaxed">
                            Discover course reviews from KTH students.
                        </p>
                    </div>
                </div>
            </div>

        </>
    )
}
