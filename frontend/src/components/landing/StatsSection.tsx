'use client'

import { motion } from 'framer-motion'
import { Gamepad2, Users, Star, Zap } from 'lucide-react'

const stats = [
  { icon: Gamepad2, value: '500+', label: 'Games Available', color: 'bg-primary-100 text-primary-600' },
  { icon: Users, value: '10K+', label: 'Happy Gamers', color: 'bg-blue-100 text-blue-600' },
  { icon: Star, value: '4.9/5', label: 'Average Rating', color: 'bg-yellow-100 text-yellow-600' },
  { icon: Zap, value: '< 1min', label: 'Delivery Time', color: 'bg-violet-100 text-violet-600' },
]

export function StatsSection() {
  return (
    <section className="border-b border-gray-100 bg-white py-14">
      <div className="page-container">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map(({ icon: Icon, value, label, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
