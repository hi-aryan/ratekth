"use client"

import { useState } from "react"
import { Menu, X, GraduationCap, MessageCircle, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { WriteReviewButton } from "@/components/ui/WriteReviewButton"
import { SearchBar } from "@/components/ui/SearchBar"
import { SortDropdown } from "@/components/features/SortDropdown"
import { FeedFilterToggle } from "@/components/features/FeedFilterToggle"
import { FeedbackForm } from "@/components/forms/FeedbackForm"
import Link from "next/link"

interface MobileSidebarProps {
    isAuthenticated: boolean
}

/**
 * MobileSidebar: Toggle button + overlay sidebar for mobile view.
 * Contains nav actions + sort + search + feedback form. Only visible on mobile.
 */
export const MobileSidebar = ({ isAuthenticated }: MobileSidebarProps) => {
    const [isOpen, setIsOpen] = useState(false)
    const [showFeedback, setShowFeedback] = useState(false)

    const handleClose = () => {
        setIsOpen(false)
        setShowFeedback(false)
    }

    return (
        <>
            {/* Toggle Button - visible only on mobile */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="md:hidden p-2"
                aria-label="Open menu"
            >
                <Menu className="w-6 h-6" />
            </Button>

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

                {/* Sidebar Panel */}
                <div
                    className={`absolute right-0 top-0 h-full w-72 bg-white shadow-xl transition-transform duration-300 ease-in-out transform overflow-hidden ${isOpen ? "translate-x-0" : "translate-x-full"
                        }`}
                >
                    {/* Background Icon */}
                    <div className="absolute -bottom-20 -right-14 text-carbon opacity-[0.05] pointer-events-none select-none z-0 rotate-[-12deg]">
                        <GraduationCap className="w-80 h-80" strokeWidth={1} />
                    </div>

                    {/* Header with close button */}
                    <div className="flex items-center justify-between p-4 border-b border-carbon/10">
                        {showFeedback ? (
                            <button
                                onClick={() => setShowFeedback(false)}
                                className="flex items-center gap-1 text-sm text-carbon/60 hover:text-carbon transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back
                            </button>
                        ) : (
                            <span className="text-sm font-medium text-carbon/60"></span>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClose}
                            className="p-2"
                            aria-label="Close menu"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Feedback Form View */}
                    {showFeedback ? (
                        <div className="p-4">
                            <h3 className="text-sm font-medium text-carbon mb-3">Share Feedback</h3>
                            <FeedbackForm onSuccess={handleClose} />
                        </div>
                    ) : (
                        <>
                            {/* Nav Actions */}
                            <div className="p-4 border-b border-carbon/10 space-y-3">
                                {isAuthenticated ? (
                                    <>
                                        <WriteReviewButton onClick={handleClose} className="w-full" />
                                        <Link href="/account" onClick={handleClose} className="block">
                                            <Button size="lg" className="w-full">Account</Button>
                                        </Link>
                                    </>
                                ) : (
                                    <Link href="/login" onClick={handleClose} className="block">
                                        <Button showShine size="lg" className="w-full">Sign In</Button>
                                    </Link>
                                )}
                            </div>

                            {/* Filter & Sort */}
                            <div className="p-4 space-y-3">
                                {isAuthenticated && <FeedFilterToggle />}
                                <SortDropdown />
                            </div>
                            <div className="w-full border-b border-carbon/10" />
                            <div className="p-4">
                                <SearchBar />
                            </div>

                            {/* Feedback link at bottom */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-carbon/10 bg-white">
                                <button
                                    onClick={() => setShowFeedback(true)}
                                    className="flex items-center gap-2 text-sm text-carbon/50 hover:text-carbon transition-colors"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Share Feedback
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}
