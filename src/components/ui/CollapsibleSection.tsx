"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface CollapsibleSectionProps {
    title: string;
    count?: number;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

/**
 * CollapsibleSection: A simple toggle section with smooth animations.
 * Uses CSS grid trick for height animation without fixed heights.
 */
export const CollapsibleSection = ({
    title,
    count,
    children,
    defaultOpen = false,
}: CollapsibleSectionProps) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div>
            {/* Toggle Header */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-6 py-4 rounded-lg transition-all duration-150 hover:bg-blue/3 active:scale-[0.95]"
            >
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-carbon">{title}</h3>
                    {count !== undefined && (
                        <span className="text-sm font-black text-blue bg-blue/10 py-0.5 px-2 rounded-lg">
                            {count}
                        </span>
                    )}
                </div>
                <ChevronDown
                    className={`w-5 h-5 text-carbon/40 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            {/* Collapsible Content - grid-rows trick for smooth height animation */}
            <div
                className={`grid transition-all duration-200 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
            >
                <div className="overflow-hidden">
                    <div className="px-6 pb-6">{children}</div>
                </div>
            </div>
        </div>
    );
};
