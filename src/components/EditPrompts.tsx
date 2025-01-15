import React, { useEffect, useState } from 'react'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Checkbox } from './ui/checkbox'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { CheckedState } from '@radix-ui/react-checkbox'

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
  promptVariables: Variable[]
  negativeVariables: Variable[]
  access: Access[]
}
interface Step2PromptInputsProps {
  formData: RappData|null
  setFormData: React.Dispatch<React.SetStateAction<any>>
  selectedModel: any // The selected model's data from Step 1
  onVariablesChange: (variables: any[]) => void
  // onValidationChange: (isValid: any) => void
}

const EditPrompts: React.FC<Step2PromptInputsProps> = ({
  formData,
  setFormData,
  selectedModel,
  onVariablesChange,
  // onValidationChange,
}) => {
  const [isSettingsOpen, setSettingsOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [variables, setVariables] = useState<any[]>([]) // Store extracted variables
  const [systemPromptVariables, setSystemPromptVariables] = useState<any[]>([])
  const [userPromptVariables, setUserPromptVariables] = useState<any[]>([])
  const [negativePromptVariables, setNegativePromptVariables] = useState<any[]>([])
  console.log("formData", formData)
  // useEffect(() => {
  //   // Validate fields only if they are available in selectedModel
  //   const requiredFieldsFilled = formData.prompt && formData.status

  //   onValidationChange(requiredFieldsFilled)
  // }, [formData.prompt, formData.status, onValidationChange, selectedModel])


  // Inside your component

// Inside your component
useEffect(() => {
  if (!formData) return;

  const extractVariablesFromPrompt = (
    prompt: string,
    type: string,
    variables: Variable[]
  ) => {
    const variablePattern = /\$[a-zA-Z_]\w*/g; // Match variables like $sys, $user
    const matches = new Set(prompt.match(variablePattern) || []); // Unique variables
  
    return Array.from(matches).map((variable, index) => {
      console.log('Checking variable:', variable);
  
      const matchingVariable = variables.find(
        (v) => v.name.toLowerCase() === variable.toLowerCase()
      );
  
      console.log('Matching variable:', matchingVariable); // Log the match
  
      return {
        id: `${type}-${Date.now()}-${index}`,
        name: variable,
        displayName: variable,
        dataType: 'text',
        description: matchingVariable?.description || '',
        placeholder: matchingVariable?.placeholder || '',
        value: '',
      };
    });
  };
  
  const promptVariables = formData.promptVariables || []; // Default to empty array if not provided
  const systemVariables = formData.systemVariables || [];
  const negativeVariables = formData.negativeVariables || [];

  const systemPromptVariables = formData.systemprompt
    ? extractVariablesFromPrompt(formData.systemprompt, 'systemprompt', systemVariables)
    : [];
  const userPromptVariables = formData.userprompt
    ? extractVariablesFromPrompt(formData.userprompt, 'userprompt', promptVariables)
    : [];
  const negativePromptVariables = formData.negativeprompt
    ? extractVariablesFromPrompt(formData.negativeprompt, 'negativeprompt', negativeVariables)
    : [];

  // Combine all extracted variables
  const allVariables = [
    ...systemPromptVariables,
    ...userPromptVariables,
    ...negativePromptVariables,
  ];

  // Update state or pass them to a callback function
  setSystemPromptVariables(systemPromptVariables);
  setUserPromptVariables(userPromptVariables);
  setNegativePromptVariables(negativePromptVariables);

  onVariablesChange(allVariables); // Notify parent component, if needed
}, [formData]);

  const toggleAccordion = () => setSettingsOpen(!isSettingsOpen)

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      imageinput: checked,
    }))
  }

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    let settingValue: any

    if (type === 'checkbox') {
      settingValue = (e.target as HTMLInputElement).checked
    } else if (type === 'number') {
      settingValue = Number(value)
    } else {
      settingValue = value
    }

    setFormData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [name]: settingValue,
      },
    }))
  }

  const handleStatusChange = (value) => {
    const status = value.toLowerCase() // Ensure value is saved in lowercase
    setFormData((prev) => ({
      ...prev,
      status,
    }))
    setIsOpen(false)
  }

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>, type: string) => {
    const inputText = e.target.value
    setFormData((prev) => ({
      ...prev,
      [type]: inputText,
    }))

    const variablePattern = /\$[a-zA-Z_]\w*/g
    const matches = new Set(inputText.match(variablePattern) || [])

    const newVariables = Array.from(matches).map((variable, index) => {
      
      return {
        id: `${type}-${Date.now()}-${index}`, // Unique ID for each variable
        name: variable,
        displayName: variable,
        dataType: 'text',
        description: '',
        placeholder: '',
        value: '',
      }
    })

    // Update variables for the specific prompt type
    if (type === 'systemprompt') {
      setSystemPromptVariables(newVariables)
    } else if (type === 'userprompt') {
      setUserPromptVariables(newVariables)
    } else if (type === 'negativeprompt') {
      setNegativePromptVariables(newVariables)
    }
  }

  const renderSettingInput = (setting: any) => {
    const { name, type, options } = setting

    switch (type) {
      case 'integer':
      case 'float':
        return (
          <div className="mb-4 w-full" key={name}>
            <Label>{name}</Label>
            <Input
              type="number"
              name={name}
              value={formData?.settings[name] || ''}
              onChange={handleSettingChange}
            />
          </div>
        )
      case 'boolean':
        return (
          <div className="mb-4 flex items-center gap-2" key={name}>
            <Checkbox
              checked={formData?.settings[name] || false}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    [name]: checked,
                  },
                }))
              }
            />
            <Label>{name}</Label>
          </div>
        )
      case 'arrayofstrings':
        return (
          <div className="mb-4 w-full" key={name}>
            <Label>{name}</Label>
            <select
              name={name}
              value={formData?.settings[name] || ''}
              onChange={handleSettingChange}
              className="w-full border-2 border-muted-foreground rounded-lg p-2"
            >
              <option value="" disabled>
                Select an option
              </option>
              {options?.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )
      case 'string':
      default:
        return (
          <div className="mb-4 w-full" key={name}>
            <Label>{name}</Label>
            <Input
              type="text"
              name={name}
              value={formData?.settings[name] || ''}
              onChange={handleSettingChange}
            />
          </div>
        )
    }
  }

  return (
    <div className="w-full flex flex-col gap-8">
      <div className="w-full relative flex flex-row gap-8">
        <div className="w-full flex flex-col rounded-lg justify-between p-4 md:px-8 md:py-7 border-2 border-muted-foreground bg-indigo-700">
          <div className="w-full flex flex-col">
            {/* Show System Prompt if available */}
            {/* {formData?.systemprompt && ( */}
              <div className="mb-4">
                <Label className="text-lg font-semibold mb-3">System Prompt:</Label>
                <Textarea
                  name="systemPrompt"
                  value={formData?.systemprompt}
                  onChange={(e) => handlePromptChange(e, 'systemprompt')}
                  placeholder="Write your system prompt here..."
                  rows={5}
                  cols={50}
                />
              </div>
            {/* )} */}

            {/* User Prompt */}
            {/* {formData?.userprompt && ( */}
              <div className="mb-4">
                <Label className="text-lg font-semibold mb-3">User Prompt:</Label>
                <Textarea
                  name="userPrompt"
                  value={formData?.userprompt}
                  onChange={(e) => handlePromptChange(e, 'userprompt')}
                  placeholder="Write your user prompt here..."
                  rows={5}
                  cols={50}
                />
              </div>
            {/* )} */}

            {/* Show Negative Prompt if available */}
            {/* {formData?.negativeprompt && ( */}
              <div className="mb-4">
                <Label className="text-lg font-semibold mb-3">Negative Prompt:</Label>
                <Textarea
                  name="negativePrompt"
                  value={formData?.negativeprompt}
                  onChange={(e) => handlePromptChange(e, 'negativeprompt')}
                  placeholder="Write your negative prompt here..."
                  rows={5}
                  cols={50}
                />
              </div>
            {/* )} */}

            {/* {/* Accept Image Input */}
            {/* {formData?.imageinput && ( */}
              <div className="mb-4 items-center flex gap-2">
                <Checkbox
                  checked={formData?.imageinput}
                  onCheckedChange={handleCheckboxChange}
                  className="w-6 h-6"
                />
                <Label className="text-xl font-semibold">Accept Image as Input</Label>
              </div>

            {/*Status*/}
            <div className="mb-4">
              {/* <Label className="text-lg font-semibold mb-3">Status:</Label>
              <select
                name="status"
                value={formData.status || ""}
                onChange={handleStatusChange}
                className="w-full border-2 border-muted-foreground rounded-lg p-2"
              >
                <option value="" disabled>
                  Select status
                </option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="denied">Denied</option>
              </select> */}

              {/* <div className="relative">
                <Button
                  id="dropdownHoverButton"
                  onClick={() => setIsOpen((prev) => !prev)}
                  variant="blue"
                  className="w-full"
                  type="button"
                >
                  <div className="flex flex-row justify-between items-center w-full">
                    <div>
                      {formData.status.charAt(0).toUpperCase() + formData.status.slice(1) ||
                        'Select Status'}
                    </div>
                    <ChevronDown />
                  </div>
                </Button>

                {isOpen && (
                  <div
                    id="dropdownHover"
                    className="absolute z-10 w-full bg-indigo-800 divide-y divide-gray-100 rounded-lg shadow"
                  >
                    <ul
                      className="py-2 text-sm text-primary dark:text-gray-200"
                      aria-labelledby="dropdownHoverButton"
                    >
                      {['approved', 'pending', 'denied'].map((status) => (
                        <li key={status}>
                          <button
                            onClick={() => handleStatusChange(status)}
                            className="block w-full text-left px-4 py-2 hover:text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-600 dark:hover:text-indigo-600"
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div> */}
            </div>

            {/* Advanced Settings */}
            <div>
              <button
                className="flex justify-between items-center w-full text-lg font-semibold bg-indigo-600 py-3 px-4 rounded-t-lg"
                onClick={toggleAccordion}
              >
                <span>Advanced Settings:</span>
                {isSettingsOpen ? (
                  <ChevronDown className="ml-2" />
                ) : (
                  <ChevronRight className="ml-2" />
                )}
              </button>
              {isSettingsOpen && (
                <div className="bg-indigo-600 p-4 rounded-b-lg pt-1">
                  {formData?.settings?.map((setting: any) => (
                    <div key={setting.name}>{renderSettingInput(setting)}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditPrompts
