"use client"

import { useEffect, Suspense } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";
import { getFlashMessage, FLASH_MESSAGE_OPTIONS, FlashMessageKey } from "@/lib/messages";

/**
 * NotificationListener
 * 
 * A global observer that watches the URL for 'success' or 'error' parameters.
 * If found, it triggers a toast and removes the parameter from the URL.
 */
function Listener() {
    const searchParams = useSearchParams();
    const pathname = usePathname();

    useEffect(() => {
        /**
         * Removes the query parameter from the URL bar without refreshing the page.
         * Prevents the toast from re-firing on page reloads.
         */
        const cleanUrl = (paramName: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete(paramName);
            const queryString = params.toString();
            window.history.replaceState(null, "", pathname + (queryString ? `?${queryString}` : ""));
        };

        const successKey = searchParams.get("success");
        const errorKey = searchParams.get("error");

        if (successKey) {
            const message = getFlashMessage(successKey);
            const options = FLASH_MESSAGE_OPTIONS[successKey as FlashMessageKey];
            if (message) {
                toast.success(message, options);
                cleanUrl("success");
            }
        }

        if (errorKey) {
            const message = getFlashMessage(errorKey);
            const options = FLASH_MESSAGE_OPTIONS[errorKey as FlashMessageKey];
            if (message) {
                toast.error(message, options);
                cleanUrl("error");
            }
        }
    }, [searchParams, pathname]);

    return null;
}

export const NotificationListener = () => {
    return (
        <Suspense fallback={null}>
            <Listener />
        </Suspense>
    );
};
