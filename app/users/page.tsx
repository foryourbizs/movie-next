import React from 'react'

import { UserList } from '@/components/common/user-list'

export default function UsersPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <UserList />
      </div>
    </div>
  )
} 