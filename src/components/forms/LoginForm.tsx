"use client"

import { useTransition } from "react"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginAction } from "@/actions/auth"
import { loginSchema, LoginInput } from "@/lib/validation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { FormField } from "@/components/ui/FormField"
import { Alert } from "@/components/ui/Alert"
import { FormFooterLink } from "@/components/ui/FormFooterLink"

export const LoginForm = () => {
    const [isPending, startTransition] = useTransition()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get("callbackUrl")

    const form = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" }
    })

    const onSubmit = (data: LoginInput) => {
        startTransition(async () => {
            const formData = new FormData()
            formData.append("email", data.email)
            formData.append("password", data.password)
            if (callbackUrl) formData.append("callbackUrl", callbackUrl)

            const result = await loginAction(null, formData)

            if (result?.fieldErrors) {
                Object.entries(result.fieldErrors).forEach(([field, errors]) => {
                    if (errors?.[0]) {
                        form.setError(field as keyof LoginInput, { message: errors[0] })
                    }
                })
            } else if (result?.error) {
                form.setError("root", { message: result.error })
            }
        })
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
                label="KTH Email"
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

            <FormField
                label="Password"
                error={form.formState.errors.password?.message}
            >
                <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    {...form.register("password")}
                />
            </FormField>

            {form.formState.errors.root && (
                <Alert variant="error">{form.formState.errors.root.message}</Alert>
            )}

            <Button type="submit" size="lg" loading={isPending} className="w-full">
                Login
            </Button>

            <FormFooterLink
                text="Don't have an account?"
                linkText="Register"
                href="/register"
            />
        </form>
    )
}
