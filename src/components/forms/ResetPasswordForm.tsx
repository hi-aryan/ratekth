"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { resetPasswordAction } from "@/actions/auth"
import { resetPasswordSchema, ResetPasswordInput } from "@/lib/validation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { FormField } from "@/components/ui/FormField"
import { Alert } from "@/components/ui/Alert"

interface ResetPasswordFormProps {
    token: string
}

export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
    const [isPending, startTransition] = useTransition()
    
    const form = useForm<ResetPasswordInput>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { token, password: "", confirmPassword: "" }
    })

    const onSubmit = (data: ResetPasswordInput) => {
        startTransition(async () => {
            const formData = new FormData()
            formData.append("token", data.token)
            formData.append("password", data.password)
            formData.append("confirmPassword", data.confirmPassword)
            
            const result = await resetPasswordAction(null, formData)
            
            if (result?.fieldErrors) {
                Object.entries(result.fieldErrors).forEach(([field, errors]) => {
                    if (errors?.[0]) {
                        form.setError(field as keyof ResetPasswordInput, { message: errors[0] })
                    }
                })
            } else if (result?.error) {
                form.setError("root", { message: result.error })
            }
        })
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
                label="New Password"
                error={form.formState.errors.password?.message}
            >
                <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
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
                    autoComplete="new-password"
                    required
                    {...form.register("confirmPassword")}
                />
            </FormField>

            {form.formState.errors.root && (
                <Alert variant="error">{form.formState.errors.root.message}</Alert>
            )}

            <Button type="submit" loading={isPending}>
                Reset Password
            </Button>
        </form>
    )
}
