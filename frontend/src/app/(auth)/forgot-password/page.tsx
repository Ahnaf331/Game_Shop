'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { authApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/utils'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError('')
    try {
      await authApi.forgotPassword(data.email)
      setSent(true)
    } catch (err: unknown) {
      const e = err as { response?: { data?: unknown } }
      setError(getErrorMessage(e?.response?.data ?? err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        {sent ? (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle2 size={48} className="text-primary-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Check your email</h1>
            <p className="mt-2 text-sm text-gray-500">
              We&apos;ve sent a password reset link to your email address.
            </p>
            <Link href="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700">
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <Link href="/login" className="mb-6 flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                <ArrowLeft size={14} /> Back to sign in
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
              <p className="mt-2 text-sm text-gray-500">
                Enter your email and we&apos;ll send a reset link.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                leftIcon={<Mail size={15} />}
                error={errors.email?.message}
                {...register('email')}
              />
              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Send Reset Link
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
