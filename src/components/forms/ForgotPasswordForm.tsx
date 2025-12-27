"use client"

import { useActionState } from "react"
import { requestPasswordResetAction } from "@/actions/auth"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { FormField } from "@/components/ui/FormField"
import { Alert } from "@/components/ui/Alert"

export const ForgotPasswordForm = () => {
    const [state, action, isPending] = useActionState(requestPasswordResetAction, null)

    return (
        <form action={action} className="space-y-4">
            <FormField label="Email">
                <Input
                    id="forgot-email"
                    name="email"
                    type="email"
                    placeholder="user@kth.se"
                    required
                    autoComplete="email"
                />
            </FormField>

            {state?.error && (
                <Alert variant="error">{state.error}</Alert>
            )}

            {state?.success && (
                <Alert variant="success">{state.message}</Alert>
            )}

            <Button type="submit" loading={isPending}>
                Send Reset Link
            </Button>
        </form>
    )
}
