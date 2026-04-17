import { cn } from "@/lib/utils"
import { Info } from "lucide-react"

interface FormFieldProps {
    label?: string
    tooltip?: string
    error?: string
    children: React.ReactNode
    className?: string
}

export const FormField = ({ label, tooltip, error, children, className }: FormFieldProps) => {
    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            {label && (
                <div className="ml-1 flex items-center gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-carbon/60">
                        {label}
                    </label>
                    {tooltip && (
                        <span className="relative inline-flex items-center group/tooltip">
                            <button
                                type="button"
                                aria-label={`More information about ${label.toLowerCase()}`}
                                className="inline-flex items-center rounded-sm text-carbon/40 transition-colors hover:text-carbon/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-carbon/20"
                            >
                                <Info className="w-3.5 h-3.5" />
                            </button>
                            <span
                                role="tooltip"
                                className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 hidden w-56 max-w-[calc(100vw-2rem)] break-words rounded-lg bg-carbon p-3 text-left text-[11px] leading-relaxed text-[#FAFAFA] shadow-xl normal-case tracking-normal group-hover/tooltip:block group-focus-within/tooltip:block sm:left-1/2 sm:w-64 sm:-translate-x-1/2"
                            >
                                {tooltip}
                                <span className="absolute top-full left-3 border-[5px] border-transparent border-t-carbon sm:left-1/2 sm:-translate-x-1/2" />
                            </span>
                        </span>
                    )}
                </div>
            )}
            {children}
            {error && <p className="text-xs font-medium text-coral ml-1 mt-1">{error}</p>}
        </div>
    )
}
