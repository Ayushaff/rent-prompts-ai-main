import HeroDashboard from '@/components/Dashboard/HoverDevCard'
import MemberDashboard from '@/components/Dashboard/MemberDashboard'
import React from 'react'
import { cookies } from 'next/headers'
import { getUserRole } from '@/utilities/getSeverSideUserRole'
import { redirect } from 'next/navigation'

const Dashboard: React.FC = () => {
  const nextCookies = cookies()
  const role = getUserRole(nextCookies)

  if (!role || role === 'null') {
    redirect('/auth/signIn');
  }

  return (
    <div>
      {role === 'enterprise' && <HeroDashboard />}
      {role === 'member' && <MemberDashboard />}
      {role === 'professional' && <h1>Badmoshi nahi mittar XD</h1>}
      {role === 'admin' && <h1>Badmoshi nahi mittar XD</h1>}
      {role === 'user' && <h1>Welcome to the Dashboard</h1>}
    </div>
  )
}

export default Dashboard
