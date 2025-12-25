"use client"

import { useActionState } from "react"
import { loginAction } from "@/actions/auth"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { FormField } from "@/components/ui/FormField"
import Link from "next/link"

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

            <FormField
                label="Password"
                error={state?.fieldErrors?.password?.[0]}
            >
                <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                />
            </FormField>

            {state?.error && !state.fieldErrors && (
                <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                    {state.error}
                </p>
            )}
            {state?.success && (
                <p className="text-sm font-medium text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                    {state.message}
                </p>
            )}

            <Button type="submit" loading={isPending}>
                Login
            </Button>

            <p className="text-center text-xs text-slate-500">
                Don't have an account?{" "}
                <Link href="/register" className="text-slate-900 font-semibold hover:underline">
                    Register
                </Link>
            </p>
        </form>
    )
}
