'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { supabase } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Logo } from '@/components/ui/logo'
import { Icon } from '@/components/ui/icons'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEmailSent, setIsEmailSent] = useState(false)

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      setIsLoading(true)
      setError(null)

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })

      if (error) {
        setError(error.message)
        return
      }

      setIsEmailSent(true)
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <Logo size="lg" className="justify-center mb-6" />
            <div className="rounded-full bg-primary/10 p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Icon name="mail" className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-serif tracking-tight text-foreground">
              Check your email
            </h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              We've sent a password reset link to your email address. Please check your inbox and click the link to reset your password.
            </p>
          </div>

          <Card className="p-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Didn't receive the email? Check your spam folder or
            </p>
            <Button
              variant="outline"
              onClick={() => setIsEmailSent(false)}
              className="w-full"
            >
              Send another email
            </Button>
          </Card>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link
                href="/auth/signin"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Logo size="lg" className="justify-center mb-6" />
          <h1 className="text-3xl font-serif tracking-tight text-foreground">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <Card className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4">
                  <div className="flex items-center">
                    <Icon name="alert-circle" className="h-4 w-4 text-destructive mr-2" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter your email"
                        autoComplete="email"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Icon name="loader-2" className="mr-2 h-4 w-4 animate-spin" />
                    Sending email...
                  </div>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link
                href="/auth/signin"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}