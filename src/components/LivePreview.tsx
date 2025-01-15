import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'
import { Info, PlusCircle, SquarePen } from 'lucide-react'
import { Input } from './ui/input'
import Image from 'next/image'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
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
interface PromptData {
  imageinput: CheckedState | undefined
  systemprompt: string
  userprompt: string
  negativeprompt: string
  variablesToAdd: Variable[]
}
interface LivePreviewProps {
  formData: any
  currentStep: number
  variables: any[]
  onVariableChange: (id: string, field: string, value: any) => void
}

const LivePreview: React.FC<LivePreviewProps> = ({
  formData,
  currentStep,
  variables,
  onVariableChange,
}) => {
  useEffect(() => {
    formData
  }, [formData])
  const [inputValues, setInputValues] = useState({
    uploadedImage: null as File | null,
  })
  // console.log("variables", variables);
  const [isEditing, setIsEditing] = useState(false)
  const [editableVariable, setEditableVariable] = useState<any | null>(null)
  const [data, setData] = useState('')
  const [loading, setLoading] = useState(false)
  const [running, setRunning] = useState(false)
  const [hasRun, setHasRun] = useState(false)
  const [promptData, setPromptData] = useState<PromptData>({
    imageinput: undefined,
    systemprompt: '',
    userprompt: '',
    negativeprompt: '',
    variablesToAdd: [],
  })

  const rappId = formData?.id

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInputValues({ ...inputValues, [e.target.name]: e.target.value })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setInputValues({ ...inputValues, uploadedImage: e.target.files[0] })
    }
  }
  useEffect(() => {
    if (!formData) return

    const variablesToAdd = variables.map((variable) => ({
      id: variable.id,
      name: variable.name,
      displayName: variable.displayName,
      type: variable.dataType,
      description: variable.description,
      placeholder: variable.placeholder,
    }))

    const systemVar = variablesToAdd.filter((variable) => variable.id.includes('systemprompt'))
    const userVar = variablesToAdd.filter(
      (variable) =>
        variable.id.includes('prompt') &&
        !variable.id.includes('systemprompt') &&
        !variable.id.includes('negativeprompt'),
    )
    const negetiveVar = variablesToAdd.filter((variable) => variable.id.includes('negativeprompt'))
    console.log(systemVar)

    formData.promptVariables = userVar
    formData.systemVariables = systemVar
    formData.negativeVariables = negetiveVar

    // Create the new data structure
    const newDataStructure = {
      systemprompt: formData.systemprompt,
      userprompt: formData.userprompt,
      negativeprompt: formData.negativeprompt,
      variablesToAdd,
      imageinput: formData.imageinput,
    }

    setPromptData(newDataStructure)

    console.log('Updated promptData:', newDataStructure)
  }, [variables, formData])
  console.log('variables', variables)

  const handleSave = async () => {
    setLoading(true)

    try {
      console.log('promptData', promptData)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/privateRapps/updatePrompts/${rappId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(promptData),
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to save: ${response.statusText}`)
      }
      if (response.status === 200) {
        const result = await response.json()
        toast.success('Prompts saved successfully')
        console.log('Saved prompts:', result)
      }
    } catch (err: any) {
      console.error('Error saving prompts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setRunning(true)
    setHasRun(true);

    const variablesToSend =
      Array.isArray(variables) && variables.length > 0
        ? variables.map((variable) => ({
            name: variable.name,
            value: variable.value,
          }))
        : []

    try {
      console.log('formData uuserpro', formData.userprompt)

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/privateRapps/run`, {
        method: 'POST',
        body: JSON.stringify({
          userPrompt: formData.userprompt,
          systemPrompt: formData.systemprompt,
          negetivePrompt: formData.negativeprompt,
          model: formData.modelId,
          variables: variablesToSend,
          settings: formData.settings,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const res = await response.json()

      const purchaseRapp = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/privateRapps/purchase`,
        {
          method: 'POST',
          body: JSON.stringify({
            modelId: formData.model,
          }),
        },
      )

      if (response.ok) {
        setData(res.data.result)
        toast.success('Rapp run successfully')
      } else {
        toast.error(res.error)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setRunning(false)
    }
  }

  const openEditModal = (variable: any) => {
    setEditableVariable(variable)
    setIsEditing(true)
  }

  const saveVariableChanges = () => {
    if (editableVariable) {
      onVariableChange(editableVariable.id, 'displayName', editableVariable.displayName)
      onVariableChange(editableVariable.id, 'dataType', editableVariable.dataType)
      onVariableChange(editableVariable.id, 'description', editableVariable.description)
      onVariableChange(editableVariable.id, 'placeholder', editableVariable.placeholder)
    }
    setIsEditing(false) // Close modal after saving
  }

  const handleModalInputChange = (field: string, value: any) => {
    setEditableVariable({ ...editableVariable, [field]: value })
  }

  const handleVariableChange = (field: string, value: string) => {
    if (editableVariable) {
      setEditableVariable((prev) => prev && { ...editableVariable, [field]: value })
    }
  }

  const renderPreviewContent = () => {
    switch (currentStep) {
      case 2:
        return (
          <div className="space-y-4">
            <form className="space-y-4 ">
              {/* Display variables as editable fields */}
              {variables.length === 0 && (
                <Card className="bg-indigo-900 border-2 border-indigo-700">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <PlusCircle className="w-12 h-12 text-indigo-400 mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">No Variables Added Yet</h2>
                    <p className="text-indigo-200 mb-4">
                      Start by adding variables to customize your prompt.
                    </p>
                  </CardContent>
                </Card>
              )}
              {variables.map((variable) => (
                <div key={variable.id} className="mb-4 relative">
                  <div className="right-0 top-2 text-[14px] absolute text-gray-300/70">
                    {variable.id.includes('systemprompt') ? (
                      <span>system prompt</span>
                    ) : variable.id.includes('negativeprompt') ? (
                      'negetive prompt'
                    ) : (
                      'userprompt'
                    )}
                  </div>
                  <div className="w-full">
                    <div className="flex gap-4 items-center mb-2">
                      {/* Checkbox with label on the right */}
                      {variable.dataType === 'checkbox' && (
                        <div className="flex gap-3 items-center mb-3">
                          <Checkbox
                            checked={variable.value === 'on'}
                            onChange={(e) =>
                              onVariableChange(
                                variable.id,
                                'value',
                                (e.target as HTMLInputElement).checked ? 'on' : 'off',
                              )
                            }
                            className="border rounded-lg"
                          />
                          <div className="flex gap-1 items-center">
                            <Label className="text-lg">{variable.displayName}</Label>
                            <div className="relative">
                              <div className="group -mt-3">
                                <Info className="w-3 h-3 text-yellow-400 cursor-pointer z-20" />
                                <div className="absolute z-40 left-full top-1/2 transform -translate-y-1/2 ml-2 w-40 sm:w-60 p-2 bg-gray-800 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  <p className="italic text-sm text-yellow-400/[0.6] break-normal whitespace-normal">
                                    {variable.description ||
                                      'Click on the edit icon to edit the variable and description.'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <button
                              type="button" // Prevent form submission
                              className="bg-white rounded-lg text-indigo-500 p-0.5 ml-2"
                              onClick={(e) => {
                                e.preventDefault() // Prevent form submission
                                openEditModal(variable)
                              }}
                            >
                              <SquarePen className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Text and Number input */}
                      {(variable.dataType === 'text' || variable.dataType === 'number') && (
                        <div className="flex flex-col w-full mb-3">
                          <div className="flex gap-1 items-center">
                            <Label className="text-lg">{variable.displayName}</Label>
                            <div className="relative">
                              <div className="group -mt-3">
                                <Info className="w-3 h-3 text-yellow-400 cursor-pointer z-20" />
                                <div className="absolute z-40 left-full top-1/2 transform -translate-y-1/2 ml-2 w-40 sm:w-60 p-2 bg-gray-800 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  <p className="italic text-sm text-yellow-400/[0.6] break-normal whitespace-normal">
                                    {variable.description ||
                                      'Click on the edit icon to edit the variable and description.'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button" // Prevent form submission
                              className="bg-white rounded-lg text-indigo-500 p-0.5 ml-2"
                              onClick={(e) => {
                                e.preventDefault() // Prevent form submission
                                openEditModal(variable)
                              }}
                            >
                              <SquarePen className="w-3 h-3" />
                            </button>
                          </div>

                          <Input
                            type={variable.dataType}
                            value={variable.value}
                            placeholder={variable.placeholder || `Enter ${variable.dataType}`}
                            className="border rounded-lg"
                            onChange={(e) => onVariableChange(variable.id, 'value', e.target.value)}
                          />
                        </div>
                      )}

                      {/* Radio Buttons in Card Format */}
                      {variable.dataType === 'radio' && (
                        <div className="flex flex-col">
                          <div className="flex gap-1 items-center mb-2">
                            <Label className="text-lg">{variable.displayName}</Label>
                            <div className="relative">
                              <div className="group -mt-3">
                                <Info className="w-3 h-3 text-yellow-400 cursor-pointer z-20" />
                                <div className="absolute z-40 left-full top-1/2 transform -translate-y-1/2 ml-2 w-40 sm:w-60 p-2 bg-gray-800 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  <p className="italic text-sm text-yellow-400/[0.6] break-normal whitespace-normal">
                                    {variable.description ||
                                      'Click on the edit icon to edit the variable and description.'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <button
                              type="button" // Prevent form submission
                              className="bg-white rounded-lg text-indigo-500 p-0.5 ml-2"
                              onClick={(e) => {
                                e.preventDefault() // Prevent form submission
                                openEditModal(variable)
                              }}
                            >
                              <SquarePen className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex gap-4">
                            {/* Example radio options */}
                            {['Option 1', 'Option 2', 'Option 3'].map((option, index) => (
                              <Label
                                key={index}
                                className={`cursor-pointer px-3 py-2 border rounded-lg ${
                                  variable.value === option
                                    ? 'border-2 border-white bg-indigo-900 rounded-xl'
                                    : 'border-2 border-muted-foreground bg-indigo-600 rounded-xl'
                                }`}
                                onClick={() => onVariableChange(variable.id, 'value', option)}
                              >
                                <input
                                  type="radio"
                                  value={option}
                                  checked={variable.value === option}
                                  className="hidden"
                                />
                                <span>{option}</span>
                              </Label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Range input */}
                      {variable.dataType === 'range' && (
                        <div className="flex flex-col w-full">
                          <div className="flex gap-1 items-center mb-2">
                            <Label className="text-lg">{variable.displayName}</Label>
                            <div className="relative">
                              <div className="group -mt-3">
                                <Info className="w-3 h-3 text-yellow-400 cursor-pointer z-20" />
                                <div className="absolute z-40 left-full top-1/2 transform -translate-y-1/2 ml-2 w-40 sm:w-60 p-2 bg-gray-800 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  <p className="italic text-sm text-yellow-400/[0.6] break-normal whitespace-normal">
                                    {variable.description ||
                                      'Click on the edit icon to edit the variable and description.'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <button
                              type="button" // Prevent form submission
                              className="bg-white rounded-lg text-indigo-500 p-0.5 ml-2"
                              onClick={(e) => {
                                e.preventDefault() // Prevent form submission
                                openEditModal(variable)
                              }}
                            >
                              <SquarePen className="w-3 h-3" />
                            </button>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={variable.value}
                            onChange={(e) => onVariableChange(variable.id, 'value', e.target.value)}
                            className="border rounded-lg w-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Conditional image upload */}
              {formData?.imageinput && (
                <div>
                  <label htmlFor="imageUpload" className="block text-lg font-semibold">
                    Upload Image
                  </label>
                  <input
                    id="imageUpload"
                    name="imageUpload"
                    type="file"
                    onChange={handleImageUpload}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              )}
            </form>
            {inputValues.uploadedImage && (
              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-md bg-indigo-800 h-96">
                  <Image
                    src={URL.createObjectURL(inputValues.uploadedImage)}
                    alt="Uploaded"
                    className="max-w-full max-h-full object-contain mt-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            )}
            {hasRun && (
              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-md bg-indigo-800 h-96">
                  {typeof data === 'string' ? (
                    // Display text when data is a string
                    <p className="text-white break-words overflow-auto whitespace-pre-wrap h-full">
                      {data}
                    </p>
                  ) : (
                    // Display image when data is an object or a URL (or your image condition)
                    <div className="h-full flex flex-col justify-center items-center">
                      <Image
                        src={data} // If 'data' is a URL or image source
                        alt="Uploaded"
                        className="max-w-full max-h-full object-contain mt-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {loading ? (
              <Button variant="blue" className="ml-auto text-lg" disabled={loading}>
                Saving...
              </Button>
            ) : (
              <Button variant="blue" className="ml-auto text-lg" onClick={handleSave}>
                Save Changes
              </Button>
            )}

            <div className="text-center">
              {running ? (
                <Button variant="blue" className="ml-auto text-lg" disabled={loading}>
                  Running...
                </Button>
              ) : (
                <Button variant="blue" className="ml-auto text-lg" onClick={handleSubmit}>
                  Run
                </Button>
              )}
            </div>

            {isEditing && editableVariable && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-indigo-600 p-4 rounded-lg w-96">
                  <h2 className="text-xl font-semibold mb-4">Edit Variable</h2>
                  <div className="mb-2">
                    <Label className="block font-semibold">Display Name:</Label>
                    <Input
                      type="text"
                      value={editableVariable.displayName}
                      onChange={(e) => handleVariableChange('displayName', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div className="mb-2">
                    <Label className="block font-semibold">Data Type:</Label>
                    <select
                      value={editableVariable.dataType}
                      onChange={(e) => handleVariableChange('dataType', e.target.value)}
                      className="w-full p-2 border bg-indigo-800 rounded-md"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="radio">Radio</option>
                      <option value="range">Range</option>
                    </select>
                  </div>
                  <div className="mb-2">
                    <Label className="block font-semibold">Description:</Label>
                    <Input
                      type="text"
                      value={editableVariable.description}
                      onChange={(e) => handleVariableChange('description', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div className="mb-2">
                    <Label className="block font-semibold">Placeholder:</Label>
                    <Input
                      type="text"
                      value={editableVariable.placeholder}
                      onChange={(e) => handleVariableChange('placeholder', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button variant="blue" onClick={saveVariableChanges}>
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Rapp Title:</h3>
            <p>{formData?.name || 'No title defined.'}</p>
            <h3 className="text-lg font-semibold">Description:</h3>
            <p>{formData?.description || 'No description provided yet.'}</p>
            <h3 className="text-lg font-semibold">Price:</h3>
            <p>{formData?.price || 'No price defined.'}</p>
          </div>
        )
      default:
        return <p>No preview available for this step.</p>
    }
  }

  return (
    <div className="w-full p-4 md:px-8 md:py-4 border-2 border-muted-foreground rounded-lg bg-indigo-700 text-white">
      {renderPreviewContent()}
    </div>
  )
}

export default LivePreview
