'use client'

import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { useState, Suspense } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { authApi } from '@/lib/api'
import { getErrorMessage } from '@/lib/utils'

const schema = z
  .object({
    new_password: z
      .string()
      .min(12, 'Password must be at least 12 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    path: ['confirm_password'],
    message: 'Passwords do not match',
  })

type FormData = z.infer<typeof schema>

function PasswordResetForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') ?? ''

  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new link.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await authApi.resetPassword({ token, new_password: data.new_password })
      setDone(true)
    } catch (err: unknown) {
      const e = err as { response?: { data?: unknown } }
      setError(getErrorMessage(e?.response?.data ?? err))
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-sm text-red-500">Invalid reset link. Please request a new one.</p>
        <Link href="/forgot-password" className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700">
          Request new link
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <CheckCircle2 size={48} className="text-primary-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Password reset!</h1>
        <p className="mt-2 text-sm text-gray-500">
          Your password has been updated. You can now sign in.
        </p>
        <Button className="mt-6 w-full" onClick={() => router.push('/login')}>
          Go to Sign In
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <Link
          href="/login"
          className="mb-6 flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft size={14} /> Back to sign in
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Set new password</h1>
        <p className="mt-2 text-sm text-gray-500">
          Must be at least 12 characters with an uppercase letter and a number.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="New password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Min 12 chars, uppercase + number"
          leftIcon={<Lock size={15} />}
          rightIcon={
            <button type="button" onClick={() => setShowPassword((p) => !p)} className="text-gray-400 hover:text-gray-600">
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
          error={errors.new_password?.message}
          {...register('new_password')}
        />
        <Input
          label="Confirm new password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Repeat your password"
          leftIcon={<Lock size={15} />}
          error={errors.confirm_password?.message}
          {...register('confirm_password')}
        />
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Reset Password
        </Button>
      </form>
    </>
  )
}

export default function PasswordResetPage() {
  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-gray-100" />}>
          <PasswordResetForm />
        </Suspense>
      </div>
    </div>
  )
}
