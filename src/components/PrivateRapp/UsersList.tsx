'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { FixedSizeList as List } from 'react-window'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Menu } from '@headlessui/react'
import { AiOutlineDown, AiOutlineCheck } from 'react-icons/ai'
import axios from 'axios'
import { getAccessResults } from 'payload'
type User = {
  id: string
  name: string
  email: string
  avatarUrl?: string
}
type SelectedUser = {
  email: string
  access: boolean
  permissions: string[]
}

interface UsersListProps {
  users: User[]
  access?: any
  formDatas?: any
  setFormData?: any
  sendInvitationsRef?: any
  selectedUsers: Record<string, SelectedUser>
  setSelectedUsers: React.Dispatch<React.SetStateAction<Record<string, SelectedUser>>>
  isSending: boolean
  setIsSending: React.Dispatch<React.SetStateAction<boolean>>
}

const permissionsOptions = [
  { label: 'Read', value: 'read' },
  { label: 'Update', value: 'update' },
]

function UsersList({
  users,
  formDatas,
  setFormData,
  sendInvitationsRef,
  selectedUsers,
  setSelectedUsers,
  isSending,
  setIsSending,
}: UsersListProps) {
  // const [selectedUsers, setSelectedUsers] = useState<{
  //   [userId: string]: { email: string; access: boolean; permissions: string[] }
  // }>({})
  // const [isSending, setIsSending] = useState(false)
  const handleCheckboxChange = useCallback(
    (userId: string) => {
      setSelectedUsers((prevSelected) => {
        const user = prevSelected[userId] || {
          email: users.find((u) => u.id === userId)?.email || '',
          permissions: [],
        }
        const newAccess = !user.access

        return {
          ...prevSelected,
          [userId]: {
            ...user,
            access: newAccess,
            permissions: newAccess ? ['read'] : [],
          },
        }
      })
    },
    [users],
  )

  const handlePermissionsChange = useCallback((userId: string, permission: string) => {
    setSelectedUsers((prevSelected) => {
      const userPermissions = prevSelected[userId]?.permissions || []
      const isSelected = userPermissions.includes(permission)

      const updatedPermissions = isSelected
        ? userPermissions.filter((p) => p !== permission)
        : [...userPermissions, permission]

      return {
        ...prevSelected,
        [userId]: {
          ...prevSelected[userId],
          permissions: updatedPermissions,
        },
      }
    })
  }, [])

  const sendInvitations = useCallback(async () => {
    console.log('imrun')
    try {
      // if (Object.keys(selectedUsers).length === 0) {
      //   toast.error('Please select at least one user to send an invitation.')
      //   return
      // }

      const selectedToAccess = Object.entries(selectedUsers)
        .filter(([_, user]) => user.access)
        .map(([userId, user]) => ({
          userId,
          email: user.email,
          permissions: user.permissions,
        }))

      // if (selectedToAccess.length === 0) {
      //   toast.error('Please select at least one user to send an invitation.')
      //   return
      // }

      setIsSending(true)
      // Step 2: Update Local Permissions

      const usersAccessData = selectedToAccess.map((user) => ({
        userId: user.userId,
        getAccess: user.permissions,
      }))

      setFormData((prev) => ({
        ...prev,
        access: usersAccessData,
      }))

      try{
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/privateRapps`, {
          method: 'POST',
          body: JSON.stringify({
            ...formDatas,
            access: usersAccessData,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        var result = await response.json()
        var rappId = result.doc.id;

        if (result.doc) {
          toast.success('Ai App Crated Successfully!')
        } else {
          throw new Error(result.error || 'Failed to create app.')
        }

      } catch(error){
        console.log("error in creating app", error)
      }

      if(selectedToAccess?.length > 0){
        const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/privateRapps/updateAccessUsers`, {
          method: 'POST',
          body: JSON.stringify({
            rappId,
            usersAccessData,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
  
        if (result.doc) {
          toast.success('Permissions updated successfully!')
        } else {
          throw new Error(result.error || 'Failed to update permissions.')
        }
  
        console.log('selectedToAccess', selectedToAccess)
  
        // Assuming this step is for local state updates or preparation
        setFormData((prev) => ({
          ...prev,
          access: usersAccessData,
        }))
  
        // Step 1: Send Invitations
        const promises = selectedToAccess.map(async (user) => {
          let allInvitationsSuccessful = true
  
          try {
            // Wait for all user invitations to be processed
            await Promise.all(
              selectedToAccess.map(async (user) => {
                await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate delay to get gmail spam prevention
  
                const response = await fetch('/api/sendPrivateRappsAccess', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: user.email }),
                })
  
                const result = await response.json()
                if (!result.success) {
                  allInvitationsSuccessful = false
                  throw new Error(result.error || 'Unknown error')
                }
              }),
            )
  
            if (allInvitationsSuccessful) {
              toast.success('Invitations sent successfully!')
            } else {
              toast.error('Some invitations failed.')
            }
          } catch (error) {
            console.error('Error sending invitations:', error)
            toast.error('Some invitations failed.')
          }
        })
  
        await Promise.all(promises)
      }

      
    } catch (error) {
      console.error('Error processing invitations and permissions:', error)
      toast.error('An error occurred while processing invitations and permissions.')
    } finally {
      setIsSending(false)
    }
  }, [selectedUsers])

  useEffect(() => {
    sendInvitationsRef.current = sendInvitations
  }, [selectedUsers])

  const renderRow = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const user = users[index]

      return (
        <div
          style={style}
          className="flex items-center border-b border-gray-700 hover:bg-indigo-600 cursor-pointer transition-colors"
        >
          <div className="w-1/12 p-2 text-center text-gray-100">{index + 1}</div>
          <div className="w-4/12 p-2 text-gray-100">{user.email}</div>
          <div className="w-2/12 p-2 text-center">
            <Checkbox
              checked={selectedUsers[user.id]?.access || false}
              onCheckedChange={() => handleCheckboxChange(user.id)}
              className="border-white"
            />
          </div>
          <div className="w-4/12 p-2 text-center">
            <Menu as="div" className="relative inline-block text-left">
              <Menu.Button
                className={`inline-flex justify-center w-full rounded-md border border-indigo-800 shadow-sm px-4 py-2 ${
                  selectedUsers[user.id]?.access
                    ? 'bg-indigo-600'
                    : 'bg-gray-500 cursor-not-allowed'
                } text-sm font-medium text-white`}
                disabled={!selectedUsers[user.id]?.access}
              >
                Permissions
                <AiOutlineDown className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
              </Menu.Button>
              <Menu.Items className="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-indigo-600 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"  onClick={(e) => e.stopPropagation()}>
                <div className="py-1 ">
                  {permissionsOptions.map((option) => (
                    <Menu.Item key={option.value}>
                      {({ active }) => (
                        <div
                          onClick={(e) => {
                            if (option.value !== 'read') {
                              handlePermissionsChange(user.id, option.value)
                            }
                          }}
                          className={`${
                            active ? 'bg-indigo-600 text-white' : 'text-white'
                          } flex items-center px-4 py-2 text-sm cursor-pointer`}
                        >
                          <Checkbox
                            checked={selectedUsers[user.id]?.permissions.includes(option.value)}
                            onClick={(e) => {
                              handlePermissionsChange(user.id, option.value)
                            }}
                            // onCheckedChange={() => handlePermissionsChange(user.id, option.value)}
                            className="mr-2"
                            disabled={option.value === 'read'}
                          />
                          {option.label}
                        </div>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Menu>
          </div>
        </div>
      )
    },
    [users, selectedUsers, handleCheckboxChange, handlePermissionsChange],
  )

  return (
    <div className="container max-w-full mx-auto p-6 bg-indigo-700 shadow-lg rounded-lg overflow-hidden select-none">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-white">Users List</h2>
        <p className="text-sm text-gray-100 mt-1">Select users to send invitations</p>
      </div>

      <div className="overflow-x-auto">
        {/* Table Header */}
        <div className="flex items-center bg-indigo-800 p-2">
          <div className="w-1/12 text-center font-semibold text-gray-200">#</div>
          <div className="w-4/12 font-semibold text-gray-200">Email</div>
          <div className="w-2/12 text-center font-semibold text-gray-200">Invite</div>
          <div className="w-4/12 text-center font-semibold text-gray-200">Permissions</div>
        </div>
        {/* Render rows with react-window */}
        <List height={400} itemCount={users.length} itemSize={60} width="100%">
          {renderRow}
        </List>
      </div>

      <div className="p-6 flex justify-between items-center border-t border-gray-700 bg-indigo-600">
        <p className="text-sm text-gray-100">
          {Object.values(selectedUsers).filter((user) => user.access).length} user
          {Object.values(selectedUsers).filter((user) => user.access).length !== 1 ? 's' : ''}{' '}
          selected
        </p>
        {/* <Button
          onClick={sendInvitations}
          disabled={
            Object.values(selectedUsers).filter((user) => user.access).length === 0 || isSending
          }
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
        >
          {isSending ? 'Sending Invitations...' : `Send Invitations`}
        </Button> */}
      </div>
    </div>
  )
}

export default React.memo(UsersList)
