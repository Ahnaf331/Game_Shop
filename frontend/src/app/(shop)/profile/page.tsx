'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Lock, Star, LogOut } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/lib/api'
import { getErrorMessage, getInitials } from '@/lib/utils'
import { toast } from '@/store/toastStore'

const profileSchema = z.object({
  first_name: z.string().min(1, 'Required'),
  last_name: z.string().min(1, 'Required'),
  email: z.string().email(),
})

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Required'),
    new_password: z
      .string()
      .min(12, 'At least 12 characters')
      .regex(/[A-Z]/, 'Must contain uppercase')
      .regex(/[0-9]/, 'Must contain a number'),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

type ProfileData = z.infer<typeof profileSchema>
type PasswordData = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout, updateUser, isAuthenticated } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      email: user?.email ?? '',
    },
  })

  const passwordForm = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
  })

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center page-container">
        <h2 className="text-xl font-bold text-gray-900">Sign in to view your profile</h2>
        <Link href="/login"><Button>Sign In</Button></Link>
      </div>
    )
  }

  const onSaveProfile = async (data: ProfileData) => {
    setSaving(true)
    try {
      await authApi.updateProfile(data)
      updateUser(data)
      toast.success('Profile updated')
    } catch (err: unknown) {
      const e = err as { response?: { data?: unknown } }
      toast.error(getErrorMessage(e?.response?.data ?? err))
    } finally {
      setSaving(false)
    }
  }

  const onChangePassword = async (data: PasswordData) => {
    setChangingPassword(true)
    try {
      await authApi.changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      })
      toast.success('Password changed successfully')
      passwordForm.reset()
    } catch (err: unknown) {
      const e = err as { response?: { data?: unknown } }
      toast.error(getErrorMessage(e?.response?.data ?? err))
    } finally {
      setChangingPassword(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    router.push('/')
  }

  return (
    <div className="bg-gray-50/50">
      <div className="page-container py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">My Profile</h1>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left sidebar */}
          <div className="space-y-4">
            {/* Avatar card */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary-500 text-xl font-bold text-white">
                {getInitials(user.first_name, user.last_name)}
              </div>
              <p className="font-semibold text-gray-900">{user.first_name} {user.last_name}</p>
              <p className="text-sm text-gray-400">{user.email}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5">
                <Star size={13} className="text-primary-500 fill-primary-500" />
                <span className="text-sm font-semibold text-primary-700">{user.points_balance} points</span>
              </div>
            </div>

            {/* Quick links */}
            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              {[
                { href: '/orders', icon: User, label: 'Order History' },
                { href: '/inventory', icon: Star, label: 'My Library' },
                { href: '/subscriptions', icon: Lock, label: 'Subscription' },
              ].map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <Icon size={15} className="text-gray-400" />
                  {label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors mt-1 border-t border-gray-100 pt-3"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Profile form */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <h2 className="mb-5 font-semibold text-gray-900">Personal Information</h2>
              <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First name"
                    error={profileForm.formState.errors.first_name?.message}
                    {...profileForm.register('first_name')}
                  />
                  <Input
                    label="Last name"
                    error={profileForm.formState.errors.last_name?.message}
                    {...profileForm.register('last_name')}
                  />
                </div>
                <Input
                  label="Email address"
                  type="email"
                  error={profileForm.formState.errors.email?.message}
                  {...profileForm.register('email')}
                />
                <div className="flex justify-end">
                  <Button type="submit" loading={saving} size="sm">Save Changes</Button>
                </div>
              </form>
            </div>

            {/* Password form */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <h2 className="mb-5 font-semibold text-gray-900">Change Password</h2>
              <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
                <Input
                  label="Current password"
                  type="password"
                  placeholder="••••••••••••"
                  error={passwordForm.formState.errors.current_password?.message}
                  {...passwordForm.register('current_password')}
                />
                <Input
                  label="New password"
                  type="password"
                  placeholder="At least 12 characters"
                  hint="Min 12 chars, one uppercase, one number"
                  error={passwordForm.formState.errors.new_password?.message}
                  {...passwordForm.register('new_password')}
                />
                <Input
                  label="Confirm new password"
                  type="password"
                  placeholder="••••••••••••"
                  error={passwordForm.formState.errors.confirm_password?.message}
                  {...passwordForm.register('confirm_password')}
                />
                <div className="flex justify-end">
                  <Button type="submit" loading={changingPassword} size="sm">Update Password</Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
