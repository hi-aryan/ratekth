"use client"

interface PermanentSelectionWarningProps {
    isConfirmed: boolean
    onConfirmChange: (confirmed: boolean) => void
    disabled?: boolean
    children?: React.ReactNode
}

/**
 * Reusable warning + confirmation checkbox for permanent selections.
 * Used by AccountMastersForm and AccountProgramSpecForm.
 */
export const PermanentSelectionWarning = ({
    isConfirmed,
    onConfirmChange,
    disabled = false,
    children
}: PermanentSelectionWarningProps) => {
    return (
        <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/60 rounded-xl space-y-4 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100/50 rounded-lg shrink-0">
                    <svg
                        className="w-5 h-5 text-amber-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                </div>
                <div>
                    <h4 className="font-bold text-amber-900 text-sm mb-1">Confirm Permanently</h4>
                    <p className="text-sm text-amber-800/80 leading-relaxed">
                        {children || (
                            <>
                                This selection is <strong>permanent</strong>. Once saved, you cannot 
                                change it without contacting support.
                            </>
                        )}
                    </p>
                </div>
            </div>

            <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer group select-none">
                    <input
                        type="checkbox"
                        checked={isConfirmed}
                        onChange={(e) => onConfirmChange(e.target.checked)}
                        disabled={disabled}
                        className="peer w-5 h-5 text-blue rounded border-carbon/30 focus:ring-blue transition-colors cursor-pointer"
                    />
                    <span className="text-sm font-medium text-carbon group-hover:text-black transition-colors">
                        I understand and want to save this selection
                    </span>
                </label>
            </div>
        </div>
    )
}
