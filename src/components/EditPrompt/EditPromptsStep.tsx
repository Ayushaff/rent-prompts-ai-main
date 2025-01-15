import React, { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ChevronDown, ChevronRight, Info } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

interface Step2PromptInputsProps {
  formData
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  selectedModel: any;
}

const EditPromptsStep: React.FC<Step2PromptInputsProps> = ({
  formData,
  setFormData,
  selectedModel,
}) => {
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => setSettingsOpen(!isSettingsOpen);

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      imageinput: checked,
    }));
  };

  const handleSettingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let settingValue: any;

    if (type === "checkbox") {
      settingValue = (e.target as HTMLInputElement).checked;
    } else if (type === "number") {
      settingValue = Number(value);
    } else {
      settingValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [name]: settingValue,
      },
    }));
  };

  const handleStatusChange = (value) => {
    const status = value.toLowerCase(); // Ensure value is saved in lowercase
    setFormData((prev) => ({
      ...prev,
      status,
    }));
    setIsOpen(false);
  };

  const handlePromptChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    type: string
  ) => {
    const inputText = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [type]: inputText,
    }));

    // Extract variables from the current prompt
    const variablePattern = /\$[a-zA-Z_]\w*/g
    const matches = new Set(inputText.match(variablePattern) || [])

    setFormData((prev) => {
      const existingVariables =
        type === 'systemprompt'
          ? prev.systemVariables || []
          : type === 'userprompt'
            ? prev.promptVariables || []
            : prev.negativeVariables || []

      // Filter out variables no longer in the prompt
      const retainedVariables = existingVariables.filter((variable) => matches.has(variable.name))

      // Identify new variables not yet in retainedVariables
      const newVariables = Array.from(matches)
        .filter(
          (variable) => !retainedVariables.some((existingVar) => existingVar.name === variable),
        )
        .map((variable) => ({
          identifier: `${type}-${Date.now()}-${Math.random()}`, // Unique identifier
          name: variable,
          displayName: variable,
          description: `Description for ${variable}`,
          placeholder: `Enter ${variable}`,
          type: 'string', // Default type
          allowMultiple: false,
          options: ["option1", "option2"],
          value: '',
        }))

      // Combine retained and new variables
      const updatedVariables = [...retainedVariables, ...newVariables]

      return {
        ...prev,
        systemVariables: type === 'systemprompt' ? updatedVariables : prev.systemVariables,
        promptVariables: type === 'userprompt' ? updatedVariables : prev.promptVariables,
        negativeVariables: type === 'negativeprompt' ? updatedVariables : prev.negativeVariables,
      }
    })
  }

  const renderSettingInput = (setting: any) => {
    const { name, description, type, options, allowMultiple } = setting;

    switch (type) {
      case "integer":
        return (
          <div className="mb-4 w-full" key={name}>
            <div className="flex gap-1 items-center">
              <Label className="text-lg">{name}</Label>
              {description && (
                <div className="relative">
                  <div className="group -mt-3">
                    <Info className="w-3 h-3 text-yellow-400 cursor-pointer z-20" />
                    <div className="absolute z-40 left-full top-1/2 transform -translate-y-1/2 ml-2 w-40 sm:w-60 p-2 bg-gray-800 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <p className="italic text-sm text-yellow-400/[0.6] break-words whitespace-normal">
                        {description || "Click on an option to select it."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Input
              type="number"
              name={name}
              value={formData.settings[name] || ""}
              onChange={handleSettingChange}
            />
          </div>
        );
      case "boolean":
        return (
          <div className="mb-4 flex items-center gap-2" key={name}>
            <Checkbox
              className="h-6 w-6"
              checked={formData.settings[name] || false}
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
            <div className="flex gap-1 items-center">
              <Label className="text-lg">{name}</Label>
              {description && (
                <div className="relative">
                  <div className="group -mt-3">
                    <Info className="w-3 h-3 text-yellow-400 cursor-pointer z-20" />
                    <div className="absolute z-40 left-full top-1/2 transform -translate-y-1/2 ml-2 w-40 sm:w-60 p-2 bg-gray-800 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <p className="italic text-sm text-yellow-400/[0.6] break-words whitespace-normal">
                        {description || "Click on an option to select it."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
        case 'select':
          return (
            <div className="mb-4 w-full" key={name}>
              <div className="flex gap-1 items-center">
                <Label className="text-lg">{name}</Label>
                {description && (
                  <div className="relative">
                    <div className="group -mt-3">
                      <Info className="w-3 h-3 text-yellow-400 cursor-pointer z-20" />
                      <div className="absolute z-40 left-full top-1/2 transform -translate-y-1/2 ml-2 w-40 sm:w-60 p-2 bg-gray-800 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <p className="italic text-sm text-yellow-400/[0.6] break-words whitespace-normal">
                          {description || 'Click on an option to select it.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
        
              <div className="flex flex-wrap gap-2 mt-2">
                {options?.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      const selected = formData.settings[name] || [];
                      const isSelected = selected.includes(option);
                      const updatedSelection = isSelected
                        ? selected.filter((item) => item !== option)
                        : [...selected, option];
        
                      setFormData((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          [name]: allowMultiple ? updatedSelection : [option],
                        },
                      }));
                    }}
                    className={`cursor-pointer border rounded-lg px-3 py-2 bg-gradient-to-br from-black/[0.3] via-black/[0.1] to-black/[0.4] break-normal whitespace-normal break-all ${
                      formData.settings[name]?.includes(option)
                        ? 'bg-indigo-900 border-muted-foreground border-opacity-40 text-white'
                        : 'bg-indigo-700'
                    }`}
                  >
                    {option}
                  </div>
                ))}
              </div>
            </div>
          );

      case "string":
      default:
        return (
          <div className="mb-4 w-full" key={name}>
            <div className="flex gap-1 items-center">
              <Label className="text-lg">{name}</Label>
              {description && (
                <div className="relative">
                  <div className="group -mt-3">
                    <Info className="w-3 h-3 text-yellow-400 cursor-pointer z-20" />
                    <div className="absolute z-40 left-full top-1/2 transform -translate-y-1/2 ml-2 w-40 sm:w-60 p-2 bg-gray-800 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <p className="italic text-sm text-yellow-400/[0.6] break-words whitespace-normal">
                        {description || "Click on an option to select it."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Input
              type="text"
              name={name}
              value={formData.settings[name] || ""}
              onChange={handleSettingChange}
            />
          </div>
        );
    }
  };

  return (
    <div className="w-full flex flex-col gap-8">
      <div className="w-full relative flex flex-row gap-8">
        <div className="w-full flex flex-col rounded-lg justify-between p-4 md:px-8 md:py-7 border-2 border-muted-foreground bg-indigo-700">
          <div className="w-full flex flex-col">
            {/* Show System Prompt if available */}
            {/* {selectedModel?.systemprompt && ( */}
              <div className="mb-4">
                <Label className="text-lg font-semibold mb-3">
                  System Prompt:
                </Label>
                <Textarea
                  name="systemPrompt"
                  value={formData?.systemprompt}
                  onChange={(e) => handlePromptChange(e, "systemprompt")}
                  placeholder="Write your system prompt here..."
                  rows={5}
                  cols={50}
                />
              </div>
            {/* )} */}

            {/* User Prompt */}
            <div className="mb-4">
              <Label className="text-lg font-semibold mb-3">User Prompt:</Label>
              <Textarea
                name="userPrompt"
                value={formData?.userprompt}
                onChange={(e) => handlePromptChange(e, "userprompt")}
                placeholder="Write your user prompt here..."
                rows={5}
                cols={50}
              />
            </div>

            {/* Show Negative Prompt if available */}
            {/* {selectedModel?.negativeprompt && ( */}
              <div className="mb-4">
                <Label className="text-lg font-semibold mb-3">
                  Negative Prompt:
                </Label>
                <Textarea
                  name="negativePrompt"
                  value={formData?.negativeprompt}
                  onChange={(e) => handlePromptChange(e, "negativeprompt")}
                  placeholder="Write your negative prompt here..."
                  rows={5}
                  cols={50}
                />
              </div>
            {/* )} */}

            {/* Accept Image Input */}
            {/* {selectedModel?.imageinput && ( */}
              <div className="mb-4 items-center flex gap-2">
                <Checkbox
                  checked={formData?.imageinput}
                  onCheckedChange={handleCheckboxChange}
                  className="w-6 h-6"
                />
                <Label className="text-xl font-semibold">
                  Accept Image as Input
                </Label>
              </div>
            {/* )} */}

            {/*Status*/}
            {/* <div className="mb-4">
              <div className="relative">
                <Button
                  id="dropdownHoverButton"
                  onClick={() => setIsOpen((prev) => !prev)}
                  variant="blue"
                  className="w-full"
                  type="button"
                >
                  <div className="flex flex-row justify-between items-center w-full">
                    <div>
                      {formData.status.charAt(0).toUpperCase() +
                        formData.status.slice(1) || "Select Status"}
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
                      {["approved", "pending", "denied"].map((status) => (
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
              </div>
            </div> */}

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
                <div className="bg-indigo-600 text-white p-4 rounded-b-lg pt-1 space-y-4">
                  {formData?.settings ? (
                    <div>
                      {Object.keys(formData.settings).map((key) => {
                        const setting = formData.settings[key]
                        if (typeof setting === 'object' && setting.name) {
                          return (
                            <div
                              key={setting.id}
                              className="p-3 rounded-lg bg-indigo-700 hover:bg-indigo-800 transition-colors duration-300"
                            >
                              {renderSettingInput(setting)}
                            </div>
                          )
                        }
                        return null // Ignore invalid fields
                      })}
                    </div>
                  ) : (
                    <p className="text-white italic">No settings available.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditPromptsStep
