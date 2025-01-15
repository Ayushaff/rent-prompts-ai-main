'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation' // Import useParams for accessing slug
import EditPrompts from '@/components/EditPrompts'
import LivePreview from '@/components/LivePreview'
import { CheckedState } from '@radix-ui/react-checkbox'
import { useUser } from '@/providers/User'
import { useRouter } from 'next/navigation'
interface Variable {
  name: string
  displayName: string
  description: string
  placeholder?: string
  type: string
  allowMultiple?: boolean
  id: string
  options?: string[] // Adjust type if options have a defined structure
}

interface Access {
  userId: {
    id: string
    name: string
    balance: number
    role: string
    domain: string
    members: any[] // Adjust type if members have a defined structure
    associatedWith: string
    rappAccess: any[]
    publicRapps: any[]
    privateRapps: any[]
    apiKey: string | null
    email: string
    createdAt: string
    updatedAt: string
    loginAttempts: number
  }
  getAccess: string[]
  id: string
}

interface RappData {
  imageinput: CheckedState | undefined
  settings: any
  id: string
  modelId: string
  userprompt: string
  systemprompt: string
  negativeprompt: string
  systemVariables: Variable[] // Adjust type if system variables have a structure
  promptVariables:Variable[]
  negativeVariables: Variable[]
  access: Access[]
}
const EditPromptsPage = () => {
  const user = useUser();
  const router = useRouter()
  const params = useParams()
  console.log('params:', params)
  const slug = params?.slug

  const [rappData, setRappData] = useState<RappData | null>(null)
  const [formData, setFormData] = useState(new FormData())
  const [variables, setVariables] = useState<Variable[]>([])
  useEffect(() => {
    if (!user) {
      return router.push("/auth/signIn");
      }
    if (slug) {
      const fetchRappData = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/api/privateRapps/getPromptBySlug/${slug}`,
          )
          if (response.ok) {
            const data = await response.json()
            console.log("response data:", data)
            setRappData(data.rappData)
            const form = new FormData()
            Object.keys(data).forEach((key) => {
              form.append(key, data[key])
            })
            setFormData(form)
          }
        } catch (error) {
          console.error('Error fetching rapp data:', error)
        }
      }

      fetchRappData()
    }
  }, [slug, user])
  console.log('Rapp data:', rappData)
  // Handle form submission (sending form data to the backend)
  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      const response = await fetch('/api/editprompts', {
        method: 'POST',
        body: formData,
      })
      if (response.ok) {
        // Handle successful form submission (e.g., show a success message)
        alert('Form submitted successfully!')
      } else {
        alert('Error submitting the form.')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }
  const handleVariablesChange = (newVariables: any[]) => {
    console.log('running handleVariablesChange')
    setVariables(newVariables)
  }
  const handleVariableChange = (id: string, field: string, value: any) => {
    console.log("running handleVariableChange")
    setVariables((prevVariables) =>
      prevVariables.map((variable) =>
        variable.id === id ? { ...variable, [field]: value } : variable,
      ),
    )
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="md:w-4/12">
        <EditPrompts
          formData={rappData}
          setFormData={setRappData}
          selectedModel={rappData?.modelId}
          onVariablesChange={handleVariablesChange}
        />
      </div>
      <div className="md:w-8/12">
        <LivePreview
          variables={variables}
          onVariableChange={handleVariableChange}
          formData={rappData}
          currentStep={2}
        />
      </div>
    </div>
  )
}

export default EditPromptsPage
