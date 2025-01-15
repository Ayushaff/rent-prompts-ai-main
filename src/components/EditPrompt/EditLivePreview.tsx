import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import Image from "next/image";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Trash } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import EditVariableForm from "./RenderPreviewForm";

interface LivePreviewProps {
  formData: any;
  currentStep: number;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

interface Variable {
  name: string;
  identifier: string;
  displayName: string;
  description?: string;
  placeholder?: string;
  type: "string" | "number" | "boolean" | "select";
  options?: string[];
  allowMultiple?: boolean;
  value: any;
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
  imageinput: boolean
  settings: any
  id: string
  model: string
  prompt: string
  systemprompt: string
  negativeprompt: string
  systemVariables: Variable[] // Adjust type if system variables have a structure
  promptVariables: Variable[]
  negativeVariables: Variable[]
  access: Access[]
}

const EditLivePreview: React.FC<LivePreviewProps> = ({
  formData,
  currentStep,
  setFormData,
}) => {
  const [inputValues, setInputValues] = useState({
    uploadedImage: null as File | null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editableVariable, setEditableVariable] = useState<any | null>(null);
  const [data, setData] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedOptions, setSelectedOptions] = React.useState<{
    [key: string]: { [key: string]: string[] }; // [variableType]: { [variableId]: selectedOptions[] }
  }>({
    systemVariables: {},
    promptVariables: {},
    negativeVariables: {},
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setInputValues({ ...inputValues, uploadedImage: e.target.files[0] });
    }
  };

  // Function to handle changes in input fields
  const handleValueChange = (variable: Variable, newValue: any) => {

    // Clone the formData object to avoid mutation
    const updatedFormData = { ...formData };

    // Helper function to update the variable value directly in formData
    const updateVariableValue = (variables: Variable[]) =>
      variables.map((v) =>
        v.identifier === variable.identifier
          ? { ...v, value: newValue } // Update value for the matching variable
          : v
      );

    // Update the respective arrays in formData
    if (formData.promptVariables) {
      updatedFormData.promptVariables = updateVariableValue(
        formData.promptVariables
      );
    }
    if (formData.systemVariables) {
      updatedFormData.systemVariables = updateVariableValue(
        formData.systemVariables
      );
    }
    if (formData.negativeVariables) {
      updatedFormData.negativeVariables = updateVariableValue(
        formData.negativeVariables
      );
    }

    // Update formData state
    setFormData(updatedFormData);
  };

  const handleSelectOption = (variable: Variable, option: string) => {
    // Clone the current formData to avoid direct mutation
    const updatedFormData = { ...formData };

    // Helper function to update the variable in the specific array
    const updateVariableValue = (variables: Variable[]) =>
      variables.map((v) =>
        v.identifier === variable.identifier
          ? {
              ...v,
              value: variable.allowMultiple
                ? v.value?.includes(option)
                  ? v.value.filter((item: string) => item !== option) // Remove if already selected
                  : [...(v.value || []), option] // Add if not selected
                : [option],
            } // Single select: Replace with the new option
          : v
      );

    // Update the respective arrays in formData
    if (formData.promptVariables) {
      updatedFormData.promptVariables = updateVariableValue(
        formData.promptVariables
      );
    }
    if (formData.systemVariables) {
      updatedFormData.systemVariables = updateVariableValue(
        formData.systemVariables
      );
    }
    if (formData.negativeVariables) {
      updatedFormData.negativeVariables = updateVariableValue(
        formData.negativeVariables
      );
    }

    // Update formData state
    setFormData(updatedFormData);

    // Update selectedOptions state using the new structure
    const updatedSelectedOptions = { ...selectedOptions };

    // Ensure that the variable type exists in updatedSelectedOptions
    if (!updatedSelectedOptions[variable.type]) {
      updatedSelectedOptions[variable.type] = {};
    }

    // Ensure the identifier exists for this variable type
    if (!updatedSelectedOptions[variable.type][variable.identifier]) {
      updatedSelectedOptions[variable.type][variable.identifier] = [];
    }

    // Handle updating selected options based on whether multiple selections are allowed
    if (variable.allowMultiple) {
      // If option is already selected, remove it, else add it
      if (updatedSelectedOptions[variable.type][variable.identifier]?.includes(option)) {
        updatedSelectedOptions[variable.type][variable.identifier] = updatedSelectedOptions[variable.type][variable.identifier].filter(
          (selectedOption) => selectedOption !== option
        );
      } else {
        updatedSelectedOptions[variable.type][variable.identifier] = [
          ...updatedSelectedOptions[variable.type][variable.identifier],
          option,
        ];
      }
    } else {
      // Single selection: Only one option can be selected at a time
      updatedSelectedOptions[variable.type][variable.identifier] = [option];
    }

    // Update the selectedOptions state
    setSelectedOptions(updatedSelectedOptions);

  };

  const rappId = formData?.id
  const promptData = {
    prompt: formData?.userprompt,
    systemprompt: formData?.systemprompt,
    negativeprompt: formData?.negativeprompt,

    imageinput: formData?.imageinput,
    // model: formData.model,
    promptVariables: formData?.promptVariables,
    systemVariables: formData?.systemVariables,
    negativeVariables: formData?.negativeVariables,
    // settings: formData.settings,
  }

  const handleSave = async () => {
    setSaving(true)

    const validateVariablesList = (variables, type) => {
      for (let i = 0; i < variables.length; i++) {
        const error = validateVariable(variables[i])
        if (error) {
          return `${type} ${error}`
        }
      }
      return null
    }

    const promptError = validateVariablesList(formData.promptVariables, 'Prompt Variable')
    const systemError = validateVariablesList(formData.systemVariables, 'System Variable')
    const negativeError = validateVariablesList(formData.negativeVariables, 'Negative Variable')

    if (promptError || systemError || negativeError) {
      toast.error(
        'Validation Error: Please check the variables for any missing or required fields.',
      )
      setError(
        `Validation Error:\n${promptError || ''}\n${systemError || ''}\n${negativeError || ''}`,
      )
      setSaving(false)
      return
    }

    setError('')

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
        toast.error("Error in updating prompts")
      }

      if (response.status === 200) {
        const result = await response.json()
        toast.success('Prompts saved successfully')
      }
    } catch (err: any) {
      console.error('Error saving prompts:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    setLoading(true);

    const variablesToSend = formData.promptVariables
      .concat(formData.systemVariables, formData.negativeVariables)
      .map((variable) => ({
        name: variable.name,
        value: variable.value,
      }));
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/privateRapps/run`,
        {
          method: "POST",
          body: JSON.stringify({
            userPrompt: formData.userprompt,
            systemPrompt: formData.systemprompt,
            negetivePrompt: formData.negativeprompt,
            model: formData.modelId,
            variables: variablesToSend,
            settings: formData.settings,
            rappId: formData.id,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const res = await response.json();

      if(response.ok){
        const purchaseRapp = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/privateRapps/purchase`,
          {
            method: "POST",
            body: JSON.stringify({
              modelId: formData.modelId,
            }),
          }
        );

        const result = await purchaseRapp.json();

        if (purchaseRapp?.ok) {
          setData(res?.data?.result);
          toast.success("Rapp run successfully");
        } else {
          toast.error(result?.message);
          setData("Oops, something went wrong.😟");
        }
      } else{
        toast.error(res?.message);
        setData("Oops, something went wrong.😟");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setData("Oops, something went wrong.😟");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (variable: any) => {
    setEditableVariable(variable);
    setIsEditing(true);
  };

  const validateVariable = (variable: any) => {
    if (!variable?.displayName?.trim()) return 'Display Name is required.'
    if (!variable?.type) return 'Data Type is required.'
    if (!variable?.description?.trim()) return 'Description is required.'
    if (
      variable?.type !== 'boolean' &&
      variable?.type !== 'select' &&
      !variable?.placeholder.trim()
    )
      return 'Placeholder is required.'
    if (variable?.type === 'select') {
      if (!variable?.options || !Array.isArray(variable?.options)) {
        return 'Options must be an array.'
      }
      if (variable?.options?.length === 0) {
        return 'Options cannot be empty.'
      }
      if (variable?.options?.some((option) => !option?.trim())) {
        return 'Options cannot contain empty values.'
      }
      // Convert options to lowercase and check for duplicates
      const uniqueOptions = new Set(variable?.options?.map((opt) => opt?.trim().toLowerCase()))
      if (uniqueOptions.size !== variable?.options?.length) {
        return 'Options cannot be similar.'
      }
    }
    return null
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateVariable(editableVariable);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Update formData with the edited variable
    setFormData((prevFormData) => {
      const updatedPromptVariables = prevFormData.promptVariables.map(
        (variable) =>
          variable.identifier === editableVariable.identifier
            ? editableVariable
            : variable
      );
      const updatedSystemVariables = prevFormData.systemVariables.map(
        (variable) =>
          variable.identifier === editableVariable.identifier
            ? editableVariable
            : variable
      );
      const updatedNegativeVariables = prevFormData.negativeVariables.map(
        (variable) =>
          variable.identifier === editableVariable.identifier
            ? editableVariable
            : variable
      );

      return {
        ...prevFormData,
        promptVariables: updatedPromptVariables,
        systemVariables: updatedSystemVariables,
        negativeVariables: updatedNegativeVariables,
      };
    });

    setError("");
    setIsEditing(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditableVariable((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOptionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newOptions = [...editableVariable.options];
    newOptions[index] = e.target.value;
    setEditableVariable((prev) => ({
      ...prev,
      options: newOptions,
    }));
  };

  const addOption = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault(); // Prevent the popup from closing when adding an option
    setEditableVariable((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const removeOption = (
    index: number,
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault(); // Prevent the popup from closing when removing an option
    const newOptions = [...editableVariable.options];
    newOptions.splice(index, 1);
    setEditableVariable((prev) => ({
      ...prev,
      options: newOptions,
    }));
  };

  const renderPreviewContent = () => {
    switch (currentStep) {
      case 2:
        return (
          <div className="space-y-4">
            <EditVariableForm
              onValueChange={handleValueChange}
              onSelectChange={handleSelectOption}
              openEditModal={openEditModal}
              handleImageUpload={handleImageUpload}
              formData={formData}
              selectedOptions={selectedOptions}
            />

            <div className="mt-6 space-y-4">
              <div className="p-4 rounded-md bg-indigo-800 h-96">
                {typeof data === "string" ? (
                  <p className="text-white break-words  whitespace-pre-wrap h-full">
                    {data}
                  </p>
                ) : (
                  <div className="h-full flex flex-col justify-center items-center">
                    <Image
                      src={data}
                      alt="Uploaded"
                      className="max-w-full max-h-full object-contain mt-2 border border-gray-300 rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="text-center">
              <div className="flex justify-center space-x-4">
                {saving ? (
                  <Button
                    variant="blue"
                    className="text-lg px-6 py-2 text-white rounded-md  transition-all duration-300 ease-in-out shadow-lg"
                    disabled={saving}
                  >
                    Saving...
                  </Button>
                ) : (
                  <Button
                    variant='green'
                    className="text-lg px-6 py-2   text-white rounded-md transition-all duration-300 ease-in-out shadow-lg"
                    onClick={handleSave}
                  >
                    Save Changes
                  </Button>
                )}

                {loading ? (
                  <Button
                    variant="blue"
                    className="text-lg px-6 py-2 text-white rounded-md transition-all duration-300 ease-in-out shadow-lg"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    Running...
                  </Button>
                ) : (
                  <Button
                    variant={"outline"}
                    className="text-lg px-6 py-2 text-white rounded-md transition-all duration-300 ease-in-out shadow-lg"
                    onClick={handleSubmit}
                  >
                    Run
                  </Button>
                )}
              </div>
            </div>

            {isEditing && editableVariable && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-indigo-600 mx-4 p-4 rounded-lg w-96">
                  <h2 className="text-xl font-semibold mb-4">Edit Variable</h2>
                  <form onSubmit={onSubmit}>
                    <div className="mb-2 space-y-1">
                      <Label className="block font-semibold ml-1">
                        Display Name:
                      </Label>
                      <Input
                        type="text"
                        name="displayName"
                        value={editableVariable.displayName}
                        className="w-full p-2 border rounded-md"
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="mb-2 space-y-1">
                      <Label className="block font-semibold ml-1">
                        Data Type:
                      </Label>
                      <select
                        name="type"
                        value={editableVariable.type}
                        className="w-full p-2 border bg-indigo-800 rounded-md"
                        onChange={handleInputChange}
                        required
                      >
                        <option value="" disabled>
                          Select Data Type
                        </option>
                        <option value="string">Text</option>
                        <option value="number">Number</option>
                        <option value="boolean">Checkbox</option>
                        <option value="select">Select</option>
                      </select>
                    </div>

                    <div className="mb-2 space-y-1">
                      <Label className="block font-semibold ml-1">
                        Description:
                      </Label>
                      <Input
                        type="text"
                        name="description"
                        value={editableVariable.description}
                        className="w-full p-2 border rounded-md"
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    {/* Conditionally render based on type */}
                    {editableVariable.type !== "boolean" &&
                      editableVariable.type !== "select" && (
                        <div className="mb-2 space-y-1">
                          <Label className="block font-semibold ml-1">
                            Placeholder:
                          </Label>
                          <Input
                            type="text"
                            name="placeholder"
                            value={editableVariable.placeholder}
                            className="w-full p-2 border rounded-lg"
                            onChange={handleInputChange}
                            required={
                              editableVariable.type !== "boolean" &&
                              editableVariable.type !== "select"
                            }
                          />
                        </div>
                      )}

                    {editableVariable.type === "select" && (
                      <div className="mb-3 space-y-1">
                        <Label className="block font-semibold ml-1">
                          Options:
                        </Label>
                        <div className="flex justify-between">
                          <div className="space-y-1">
                            {editableVariable.options.map((option, index) => (
                              <div key={`option-${index}`} className="flex items-center space-x-2">
                                <Input
                                  type="text"
                                  value={option}
                                  onChange={(e) => handleOptionChange(e, index)}
                                  className="w-full p-2 border rounded-md"
                                />
                                <Button
                                  variant="red"
                                  onClick={(e) => removeOption(index, e)}
                                  className="text-md px-2 py-2"
                                >
                                  <Trash className="w-5 h-5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                          <Button
                            variant="blue"
                            onClick={addOption}
                            className="py-2 h-fit "
                          >
                            Add Option
                          </Button>
                        </div>
                      </div>
                    )}

                    {editableVariable.type === "select" && (
                      <div className="mb-4 flex items-center gap-1">
                        <Checkbox
                          className="h-6 w-6"
                          checked={editableVariable.allowMultiple}
                          onCheckedChange={(checked) =>
                            setEditableVariable((prev) => ({
                              ...prev,
                              allowMultiple: checked,
                            }))
                          }
                        />
                        <Label className="block font-semibold text-md ml-1">
                          Allow Multiple Select
                        </Label>
                      </div>
                    )}

                    {error && (
                      <p className="text-red-500 text-sm whitespace-normal max-w-full">{error}</p>
                    )}

                    <div className="mt-4 flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="w-full">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full p-4 md:px-8 md:py-4 border-2 border-muted-foreground rounded-lg bg-indigo-700 text-white">
      {renderPreviewContent()}
    </div>
  );
};

export default EditLivePreview;
