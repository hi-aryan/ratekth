"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { FeedbackForm } from "@/components/forms/FeedbackForm";

/**
 * FeedbackWidget: Fixed floating button with animated popup (desktop only).
 * Lives in bottom-left corner, opens feedback form on click.
 */
export const FeedbackWidget = () => {
    const [isOpen, setIsOpen] = useState(false);

    const handleClose = () => setIsOpen(false);

    return (
        <>
            {/* Floating Button - desktop only */}
            <motion.button
                initial={false}
                animate={{ 
                    scale: isOpen ? 0 : 1, 
                    opacity: isOpen ? 0 : 1 
                }}
                whileHover={{ scale: isOpen ? 0 : 1.05 }}
                whileTap={{ scale: isOpen ? 0 : 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={() => setIsOpen(true)}
                className={cn(
                    "fixed bottom-6 left-6 z-50",
                    "hidden md:flex", // Hide on mobile, show on desktop
                    "w-11 h-11 rounded-full shadow-lg",
                    "bg-carbon text-white",
                    "items-center justify-center",
                    isOpen && "pointer-events-none"
                )}
                aria-label="Send feedback"
            >
                <MessageCircle className="w-5 h-5" />
            </motion.button>

            {/* Popup Card */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className={cn(
                            "fixed bottom-6 left-6 z-50",
                            "hidden md:block", // Desktop only
                            "w-72 bg-white rounded-xl shadow-xl",
                            "border border-carbon/10",
                            "overflow-hidden"
                        )}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-carbon/10">
                            <span className="text-sm font-medium text-carbon">Share Feedback</span>
                            <button
                                onClick={handleClose}
                                className="text-carbon/40 hover:text-carbon transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="p-4">
                            <FeedbackForm onSuccess={handleClose} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
