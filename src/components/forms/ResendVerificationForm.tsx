"use client"

import { useActionState } from "react"
import { resendVerificationAction } from "@/actions/auth"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { FormField } from "@/components/ui/FormField"

export const ResendVerificationForm = () => {
    const [state, action, isPending] = useActionState(resendVerificationAction, null)

    return (
        <form action={action} className="space-y-4">
            <FormField label="Email">
                <Input
                    id="resend-email"
                    name="email"
                    type="email"
                    placeholder="user@kth.se"
                    required
                    autoComplete="email"
                />
            </FormField>

            {state?.error && (
                <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                    {state.error}
                </p>
            )}

            {state?.success && (
                <p className="text-sm font-medium text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
                    {state.message}
                </p>
            )}

            <Button type="submit" loading={isPending}>
                Resend Verification Email
            </Button>
        </form>
    )
}
