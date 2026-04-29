'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { authApi } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

function VerifyContent() {
  const params = useSearchParams()
  const router = useRouter()
  const token = params.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (!token) { setStatus('error'); return }
    authApi
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <div className="w-full max-w-md text-center">
      <div className="rounded-2xl border border-gray-100 bg-white p-10 shadow-sm">
        {status === 'loading' && (
          <>
            <Loader2 size={48} className="mx-auto animate-spin text-primary-500" />
            <p className="mt-4 text-gray-600">Verifying your email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 size={48} className="mx-auto text-primary-500" />
            <h1 className="mt-4 text-xl font-bold text-gray-900">Email verified!</h1>
            <p className="mt-2 text-sm text-gray-500">Your account is now active. Start exploring games.</p>
            <Button className="mt-6" onClick={() => router.push('/catalog')}>
              Browse Games
            </Button>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle size={48} className="mx-auto text-red-400" />
            <h1 className="mt-4 text-xl font-bold text-gray-900">Verification failed</h1>
            <p className="mt-2 text-sm text-gray-500">The link is invalid or has expired.</p>
            <Link href="/login">
              <Button variant="outline" className="mt-6">Go to Sign In</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  )
}
