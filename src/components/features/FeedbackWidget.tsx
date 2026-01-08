"use client";

import { useState, useActionState } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { submitFeedbackAction } from "@/actions/feedback";
import { ActionState } from "@/lib/types";

const MIN_CHARS = 10;
const MAX_CHARS = 2000;

/**
 * FeedbackWidget: Fixed floating button with animated popup.
 * Lives in bottom-left corner, opens feedback form on click.
 * Uses toast for success feedback instead of in-place state.
 */
export const FeedbackWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [charCount, setCharCount] = useState(0);

    const isTooShort = charCount > 0 && charCount < MIN_CHARS;

    // Close popup and reset
    const handleClose = () => {
        setIsOpen(false);
        setCharCount(0);
    };

    // Wrap action to handle success with toast (no useEffect needed)
    const handleSubmit = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
        const result = await submitFeedbackAction(prevState, formData);
        if (result?.success) {
            toast.success("Thanks for your feedback!");
            handleClose();
        }
        return result;
    };

    const [state, formAction, isPending] = useActionState(handleSubmit, null);

    return (
        <>
            {/* Floating Button - always rendered, animated via motion */}
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
                    "w-11 h-11 rounded-full shadow-lg",
                    "bg-carbon text-white",
                    "flex items-center justify-center",
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
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
