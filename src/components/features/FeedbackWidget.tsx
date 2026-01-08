"use client";

import { useState, useActionState } from "react";
import { MessageCircle, X, Send, Loader2, Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { submitFeedbackAction } from "@/actions/feedback";

const MIN_CHARS = 10;
const MAX_CHARS = 2000;

/**
 * FeedbackWidget: Fixed floating button with animated popup.
 * Lives in bottom-left corner, opens feedback form on click.
 */
export const FeedbackWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(submitFeedbackAction, null);
    const [charCount, setCharCount] = useState(0);

    const isSuccess = state?.success;
    const isTooShort = charCount > 0 && charCount < MIN_CHARS;

    // Reset form when closing
    const handleClose = () => {
        setIsOpen(false);
        setCharCount(0);
    };

    return (
        <div className="fixed bottom-6 left-6 z-50">
            {/* Floating Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        onClick={() => setIsOpen(true)}
                        className={cn(
                            "w-11 h-11 rounded-full shadow-lg",
                            "bg-carbon text-white",
                            "flex items-center justify-center",
                            "hover:scale-105",
                            "transition-transform"
                        )}
                        aria-label="Send feedback"
                    >
                        <MessageCircle className="w-5 h-5" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Popup Card */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className={cn(
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

                        {/* Content */}
                        <div className="p-4">
                            {!isSuccess ? (
                                <form action={formAction} className="space-y-3">
                                    <textarea
                                        name="content"
                                        placeholder="Suggestions, bugs, ideas..."
                                        rows={4}
                                        maxLength={MAX_CHARS}
                                        onChange={(e) => setCharCount(e.target.value.length)}
                                        className={cn(
                                            "w-full text-sm text-carbon placeholder:text-carbon/40",
                                            "bg-carbon/5 rounded-lg px-3 py-2.5 resize-none",
                                            "border border-transparent",
                                            "focus:border-carbon/20 focus:outline-none",
                                            "transition-colors"
                                        )}
                                        disabled={isPending}
                                        autoFocus
                                    />

                                    {/* Character count & hint */}
                                    <div className="flex items-center justify-between text-xs">
                                        <span className={cn(
                                            "transition-colors",
                                            isTooShort ? "text-coral" : "text-carbon/30"
                                        )}>
                                            {isTooShort
                                                ? `${MIN_CHARS - charCount} more characters needed`
                                                : `${charCount}/${MAX_CHARS}`
                                            }
                                        </span>
                                        <button
                                            type="submit"
                                            disabled={isPending || charCount < MIN_CHARS}
                                            className={cn(
                                                "group flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 ease-in-out",
                                                "bg-carbon text-white",
                                                "active:scale-95",
                                                "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
                                            )}
                                        >
                                            {isPending ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                                <Send className="w-3.5 h-3.5 transition-transform duration-200 ease-in-out group-hover:scale-115" />
                                            )}
                                            Send
                                        </button>
                                    </div>

                                    {/* Error messages */}
                                    {state?.error && (
                                        <p className="text-xs text-coral">{state.error}</p>
                                    )}
                                    {state?.fieldErrors?.content && (
                                        <p className="text-xs text-coral">{state.fieldErrors.content[0]}</p>
                                    )}
                                </form>
                            ) : (
                                /* Success State */
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center gap-2 py-4 text-center"
                                >
                                    <div className="w-10 h-10 rounded-full bg-green/10 flex items-center justify-center">
                                        <Check className="w-5 h-5 text-green" />
                                    </div>
                                    <p className="text-sm text-carbon">Thanks for your feedback!</p>
                                    <button
                                        onClick={handleClose}
                                        className="text-xs text-carbon/50 hover:text-carbon transition-colors"
                                    >
                                        Close
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
