"use client"

import { useActionState } from "react"
import { loginAction } from "@/actions/auth"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { FormField } from "@/components/ui/FormField"

export const LoginForm = () => {
    const [state, action, isPending] = useActionState(loginAction, null)

    return (
        <form action={action} className="space-y-6">
            <FormField
                label="KTH Email"
                error={state?.fieldErrors?.email?.[0] || (state?.error && !state.fieldErrors ? state.error : undefined)}
            >
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="user@kth.se"
                    required
                    autoComplete="email"
                />
            </FormField>

            {state?.success && (
                <p className="text-sm font-medium text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                    {state.message}
                </p>
            )}

            <Button type="submit" loading={isPending}>
                Send Magic Link
            </Button>

            <p className="text-center text-xs text-slate-500">
                We'll send a login link to your KTH email. <br /> No password required.
            </p>
        </form>
    )
}
