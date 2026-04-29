'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'

const schema = z
  .object({
    first_name: z.string().min(1, 'First name is required').max(50),
    last_name: z.string().min(1, 'Last name is required').max(50),
    email: z.string().email('Enter a valid email address'),
    password: z
      .string()
      .min(12, 'Password must be at least 12 characters')
      .max(128, 'Password too long')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const { register: authRegister, isLoading, error, clearError } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const password = watch('password', '')
  const strength = password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password)
    ? 'strong'
    : password.length >= 8
    ? 'medium'
    : password.length > 0
    ? 'weak'
    : null

  const onSubmit = async (data: FormData) => {
    clearError()
    try {
      await authRegister({
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
      })
      toast.success('Account created! Welcome to GameShop.')
      router.push('/catalog')
    } catch {
      // error set in store
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-2 text-sm text-gray-500">Join thousands of gamers on GameShop</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First name"
              placeholder="Alex"
              leftIcon={<User size={15} />}
              error={errors.first_name?.message}
              {...register('first_name')}
            />
            <Input
              label="Last name"
              placeholder="Smith"
              error={errors.last_name?.message}
              {...register('last_name')}
            />
          </div>

          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            leftIcon={<Mail size={15} />}
            error={errors.email?.message}
            {...register('email')}
          />

          <div>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 12 characters"
              leftIcon={<Lock size={15} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
              error={errors.password?.message}
              {...register('password')}
            />
            {strength && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex flex-1 gap-1">
                  {['weak', 'medium', 'strong'].map((level, i) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        strength === 'strong'
                          ? 'bg-primary-500'
                          : strength === 'medium' && i < 2
                          ? 'bg-yellow-400'
                          : i === 0 && strength === 'weak'
                          ? 'bg-red-400'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span
                  className={`text-xs font-medium ${
                    strength === 'strong'
                      ? 'text-primary-600'
                      : strength === 'medium'
                      ? 'text-yellow-600'
                      : 'text-red-500'
                  }`}
                >
                  {strength}
                </span>
              </div>
            )}
          </div>

          <Input
            label="Confirm password"
            type="password"
            placeholder="••••••••••••"
            leftIcon={<Lock size={15} />}
            error={errors.confirm_password?.message}
            {...register('confirm_password')}
          />

          <Button type="submit" className="w-full" size="lg" loading={isLoading}>
            Create Account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary-600 hover:text-primary-700 transition-colors">
            Sign in
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-gray-400">
          By signing up, you agree to our{' '}
          <Link href="#" className="underline underline-offset-2">Terms</Link> and{' '}
          <Link href="#" className="underline underline-offset-2">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}
