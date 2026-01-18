"use client";

import { useState, useActionState } from "react";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { submitFeedbackAction } from "@/actions/feedback";
import { ActionState } from "@/lib/types";

const MIN_CHARS = 10;
const MAX_CHARS = 2000;

interface FeedbackFormProps {
    /** Called after successful submission */
    onSuccess?: () => void;
}

/**
 * FeedbackForm: Reusable feedback form with textarea and submit button.
 * Used by FeedbackWidget (desktop) and MobileSidebar (mobile).
 */
export const FeedbackForm = ({ onSuccess }: FeedbackFormProps) => {
    const [charCount, setCharCount] = useState(0);

    const isTooShort = charCount > 0 && charCount < MIN_CHARS;

    const handleSubmit = async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
        const result = await submitFeedbackAction(prevState, formData);
        if (result?.success) {
            toast.success("Thanks for your feedback!");
            setCharCount(0);
            onSuccess?.();
        }
        return result;
    };

    const [state, formAction, isPending] = useActionState(handleSubmit, null);

    return (
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

            {/* Character count & submit */}
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
    );
};
