"use client"

import { useActionState } from "react"
import { registerAction } from "@/actions/auth"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { FormField } from "@/components/ui/FormField"
import { Program } from "@/lib/types"
import Link from "next/link"

/**
 * Component Props: RegisterFormProps
 * defines the data required for this UI component to function.
 * ensures that the parent (Page) passes the correct 'programs' list.
 */
interface RegisterFormProps {
    programs: Program[]
}

export const RegisterForm = ({ programs }: RegisterFormProps) => {
    const [state, action, isPending] = useActionState(registerAction, null)

    return (
        <form action={action} className="space-y-4">
            <FormField
                label="KTH Email"
                error={state?.fieldErrors?.email?.[0]}
            >
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="user@kth.se"
                    required
                />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    />
                </FormField>
            </div>

            <FormField
                label="Your Academic Program"
                error={state?.fieldErrors?.programId?.[0]}
            >
                <select
                    id="programId"
                    name="programId"
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all text-sm"
                    required
                >
                    <option value="">Select your program...</option>
                    {programs.map((p) => (
                        <option key={p.id} value={p.id}>
                            [{p.code}] {p.name}
                        </option>
                    ))}
                </select>
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
                Create Account
            </Button>

            <p className="text-center text-xs text-slate-500">
                Already have an account?{" "}
                <Link href="/login" className="text-slate-900 font-semibold hover:underline">
                    Login
                </Link>
            </p>
        </form>
    )
}
