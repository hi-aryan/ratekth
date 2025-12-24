import { cn } from "@/lib/utils"

interface FormFieldProps {
    label?: string
    error?: string
    children: React.ReactNode
    className?: string
}

export const FormField = ({ label, error, children, className }: FormFieldProps) => {
    return (
        <div className={cn("space-y-1.5", className)}>
            {label && (
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">
                    {label}
                </label>
            )}
            {children}
            {error && <p className="text-xs font-medium text-rose-500 ml-1 mt-1">{error}</p>}
        </div>
    )
}
