"use client"

import { useRef, useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registerAction } from "@/actions/auth"
import { registerFormSchema, type RegisterFormInput } from "@/lib/validation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { FormField } from "@/components/ui/FormField"
import { Alert } from "@/components/ui/Alert"
import { FormFooterLink } from "@/components/ui/FormFooterLink"
import { AcademicSelector } from "@/components/features/AcademicSelector"
import { Program } from "@/lib/types"

interface RegisterFormProps {
    basePrograms: Program[]
    mastersDegrees: Program[]
}

interface AcademicFieldErrors {
    programId?: string[]
    mastersDegreeId?: string[]
    specializationId?: string[]
}

export const RegisterForm = ({ basePrograms, mastersDegrees }: RegisterFormProps) => {
    const formRef = useRef<HTMLFormElement>(null)
    const [isPending, startTransition] = useTransition()
    const [academicErrors, setAcademicErrors] = useState<AcademicFieldErrors>({})
    
    const form = useForm<RegisterFormInput>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: { email: "", password: "", confirmPassword: "" }
    })

    const onSubmit = form.handleSubmit(() => {
        if (!formRef.current) return
        const formData = new FormData(formRef.current)
        setAcademicErrors({})
        
        startTransition(async () => {
            const result = await registerAction(null, formData)
            
            if (result?.fieldErrors) {
                const { programId, mastersDegreeId, specializationId, ...formErrors } = result.fieldErrors
                
                setAcademicErrors({ programId, mastersDegreeId, specializationId })
                
                Object.entries(formErrors).forEach(([field, errors]) => {
                    if (errors?.[0]) {
                        form.setError(field as keyof RegisterFormInput, { message: errors[0] })
                    }
                })
            } else if (result?.error) {
                form.setError("root", { message: result.error })
            }
        })
    })

    return (
        <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
            <FormField
                label="KTH Email"
                error={form.formState.errors.email?.message}
            >
                <Input
                    type="email"
                    placeholder="user@kth.se"
                    required
                    {...form.register("email")}
                />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    label="Password"
                    error={form.formState.errors.password?.message}
                >
                    <Input
                        type="password"
                        placeholder="••••••••"
                        required
                        {...form.register("password")}
                    />
                </FormField>

                <FormField
                    label="Confirm Password"
                    error={form.formState.errors.confirmPassword?.message}
                >
                    <Input
                        type="password"
                        placeholder="••••••••"
                        required
                        {...form.register("confirmPassword")}
                    />
                </FormField>
            </div>

            <AcademicSelector
                basePrograms={basePrograms}
                mastersDegrees={mastersDegrees}
                fieldErrors={academicErrors}
            />

            {form.formState.errors.root && (
                <Alert variant="error">{form.formState.errors.root.message}</Alert>
            )}

            <Button type="submit" size="lg" loading={isPending} className="w-full">
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
