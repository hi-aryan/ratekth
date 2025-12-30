"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { requestPasswordResetAction } from "@/actions/auth"
import { kthEmailSchema } from "@/lib/validation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { FormField } from "@/components/ui/FormField"
import { Alert } from "@/components/ui/Alert"

const forgotPasswordSchema = z.object({ email: kthEmailSchema })
type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const ForgotPasswordForm = () => {
    const [isPending, startTransition] = useTransition()
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    
    const form = useForm<ForgotPasswordInput>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" }
    })

    const onSubmit = (data: ForgotPasswordInput) => {
        startTransition(async () => {
            const formData = new FormData()
            formData.append("email", data.email)
            
            const result = await requestPasswordResetAction(null, formData)
            
            if (result?.success) {
                setSuccessMessage(result.message ?? "Check your email!")
            } else if (result?.error) {
                form.setError("root", { message: result.error })
            }
        })
    }

    if (successMessage) {
        return <Alert variant="success">{successMessage}</Alert>
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
                label="Email"
                error={form.formState.errors.email?.message}
            >
                <Input
                    type="email"
                    placeholder="user@kth.se"
                    autoComplete="email"
                    required
                    {...form.register("email")}
                />
            </FormField>

            {form.formState.errors.root && (
                <Alert variant="error">{form.formState.errors.root.message}</Alert>
            )}

            <Button type="submit" loading={isPending}>
                Send Reset Link
            </Button>
        </form>
    )
}
