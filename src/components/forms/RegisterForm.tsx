"use client"

import { useActionState } from "react"
import { registerAction } from "@/actions/auth"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { FormField } from "@/components/ui/FormField"
import { Alert } from "@/components/ui/Alert"
import { FormFooterLink } from "@/components/ui/FormFooterLink"
import { AcademicSelector } from "@/components/features/AcademicSelector"
import { Program } from "@/lib/types"

/**
 * Component Props: RegisterFormProps
 * Receives both base programs and master's degrees from the page.
 */
interface RegisterFormProps {
    basePrograms: Program[]
    mastersDegrees: Program[]
}

export const RegisterForm = ({ basePrograms, mastersDegrees }: RegisterFormProps) => {
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

            <AcademicSelector
                basePrograms={basePrograms}
                mastersDegrees={mastersDegrees}
                fieldErrors={{
                    programId: state?.fieldErrors?.programId,
                    mastersDegreeId: state?.fieldErrors?.mastersDegreeId,
                    specializationId: state?.fieldErrors?.specializationId,
                }}
            />

            {state?.error && !state.fieldErrors && (
                <Alert variant="error">{state.error}</Alert>
            )}

            <Button type="submit" loading={isPending}>
                Create Account
            </Button>

            <FormFooterLink
                text="Already have an account?"
                linkText="Login"
                href="/login"
            />
        </form>
    )
}
