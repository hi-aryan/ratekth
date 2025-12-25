"use client"

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { getFlashMessage } from "@/lib/messages";

/**
 * NotificationListener
 * 
 * A global observer that watches the URL for 'success' or 'error' parameters.
 * If found, it triggers a toast and removes the parameter from the URL.
 */
function Listener() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const successKey = searchParams.get("success");
        const errorKey = searchParams.get("error");

        if (successKey) {
            const message = getFlashMessage(successKey);
            if (message) {
                toast.success(message);
                cleanUrl("success");
            }
        }

        if (errorKey) {
            const message = getFlashMessage(errorKey);
            if (message) {
                toast.error(message);
                cleanUrl("error");
            }
        }
    }, [searchParams]);

    /**
     * Removes the query parameter from the URL bar without refreshing the page.
     * Prevents the toast from re-firing on page reloads.
     */
    const cleanUrl = (paramName: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete(paramName);

        const queryString = params.toString();
        const newPath = pathname + (queryString ? `?${queryString}` : "");

        window.history.replaceState(null, "", newPath);
    };

    return null;
}

export const NotificationListener = () => {
    return (
        <Suspense fallback={null}>
            <Listener />
        </Suspense>
    );
};
