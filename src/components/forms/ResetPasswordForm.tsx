"use client"

import { useActionState } from "react"
import { resetPasswordAction } from "@/actions/auth"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { FormField } from "@/components/ui/FormField"
import { Alert } from "@/components/ui/Alert"

interface ResetPasswordFormProps {
    token: string
}

export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
    const [state, action, isPending] = useActionState(resetPasswordAction, null)

    return (
        <form action={action} className="space-y-4">
            {/* Hidden token field */}
            <input type="hidden" name="token" value={token} />

            <FormField
                label="New Password"
                error={state?.fieldErrors?.password?.[0]}
            >
                <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                />
            </FormField>

            <FormField
                label="Confirm Password"
                error={state?.fieldErrors?.confirmPassword?.[0]}
            >
                <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                />
            </FormField>

            {state?.error && !state.fieldErrors && (
                <Alert variant="error">{state.error}</Alert>
            )}

            <Button type="submit" loading={isPending}>
                Reset Password
            </Button>
        </form>
    )
}
