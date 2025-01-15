import { Info, SquarePen } from "lucide-react";
import React from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";

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

interface VariableFormProps {
  formData: {
    promptVariables: Variable[];
    systemVariables: Variable[];
    negativeVariables: Variable[];
    imageinput?: boolean;
  };
  openEditModal: (variable: Variable) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange: (variable: Variable, newValue: any) => void;
  onSelectChange: (variable: Variable, option: string) => void;
  selectedOptions: {
    [key: string]: { [key: string]: string[] }; };}

const EditVariableForm: React.FC<VariableFormProps> = ({
  formData,
  openEditModal,
  handleImageUpload,
  onValueChange,
  onSelectChange,
  selectedOptions
}) => {

  const renderVariableSection = (variables, label: string) => (
    <div>
      {variables?.map((variable) => (
          <div key={variable.identifier} className="mb-2 relative">
            <div className="w-full">
              <div className="flex gap-4 items-center mb-2">
                {/* String input */}
                {variable.type === "string" && (
                  <div className="flex flex-col w-full mb-3">
                    <div className="flex gap-1 items-center">
                      <Label className="text-lg">{variable.displayName}</Label>
                      <div className="relative">
                        <div className="group -mt-3">
                          <Info className="w-3 h-3 text-yellow-400 cursor-pointer z-20" />
                          <div className="absolute z-40 left-full top-1/2 transform -translate-y-1/2 ml-2 w-40 sm:w-60 p-2 bg-gray-800 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <p className="italic text-sm text-yellow-400/[0.6] break-normal whitespace-normal break-all">
                              {variable.description ||
                                "Click on the edit icon to edit the variable and description."}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button" // Prevent form submission
                        className="bg-white rounded-lg text-indigo-500 p-0.5 ml-2"
                        onClick={(e) => {
                          e.preventDefault(); // Prevent form submission
                          openEditModal(variable);
                        }}
                      >
                        <SquarePen className="w-3 h-3" />
                      </button>
                    </div>

                    <Input
                      type="text"
                      value={variable.value}
                      placeholder={
                        variable.placeholder || `Enter ${variable.displayName}`
                      }
                      className="border rounded-lg"
                      onChange={(e) => onValueChange(variable, e.target.value)}
                    />
                  </div>
                )}

                {/* Number input */}
                {variable.type === "number" && (
                  <div className="flex flex-col w-full mb-3">
                    <div className="flex gap-1 items-center">
                      <Label className="text-lg">{variable.displayName}</Label>
                      <div className="relative">
                        <div className="group -mt-3">
                          <Info className="w-3 h-3 text-yellow-400 cursor-pointer z-20" />
                          <div className="absolute z-40 left-full top-1/2 transform -translate-y-1/2 ml-2 w-40 sm:w-60 p-2 bg-gray-800 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <p className="italic text-sm text-yellow-400/[0.6] break-normal whitespace-normal break-all">
                              {variable.description ||
                                "Click on the edit icon to edit the variable and description."}
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button" // Prevent form submission
                        className="bg-white rounded-lg text-indigo-500 p-0.5 ml-2"
                        onClick={(e) => {
                          e.preventDefault(); // Prevent form submission
                          openEditModal(variable);
                        }}
                      >
                        <SquarePen className="w-3 h-3" />
                      </button>
                    </div>

                    <Input
                      type={variable.type}
                      value={variable.value}
                      placeholder={
                        variable.placeholder || `Enter ${variable.type}`
                      }
                      className="border rounded-lg"
                      onChange={(e) => onValueChange(variable, e.target.value)}
                    />
                  </div>
                )}

                {/* Boolean */}
                {variable.type === "boolean" && (
                  <div className="flex gap-3 items-center mb-3">
                    <Checkbox
                      checked={variable.value === "on"}
                      className="border rounded-lg"
                      onChange={() =>
                        onValueChange(variable, !variable.value)
                      }
                    />
                    <div className="flex gap-1 items-center">
                      <Label className="text-lg">{variable.displayName}</Label>
                      <div className="relative">
                        <div className="group -mt-3">
                          <Info className="w-3 h-3 text-yellow-400 cursor-pointer z-20" />
                          <div className="absolute z-40 left-full top-1/2 transform -translate-y-1/2 ml-2 w-40 sm:w-60 p-2 bg-gray-800 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <p className="italic text-sm text-yellow-400/[0.6] break-normal whitespace-normal break-all">
                              {variable.description ||
                                "Click on the edit icon to edit the variable and description."}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button" // Prevent form submission
                        className="bg-white rounded-lg text-indigo-500 p-0.5 ml-2"
                        onClick={(e) => {
                          e.preventDefault(); // Prevent form submission
                          openEditModal(variable);
                        }}
                      >
                        <SquarePen className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Select input as cards */}
                {variable.type === "select" && (
                  <div className="flex flex-col w-full mb-3">
                    <div className="flex gap-1 items-center">
                      <Label className="text-lg">{variable.displayName}</Label>
                      <div className="relative">
                        <div className="group -mt-3">
                          <Info className="w-3 h-3 text-yellow-400 cursor-pointer z-20" />
                          <div className="absolute z-40 left-full top-1/2 transform -translate-y-1/2 ml-2 w-40 sm:w-60 p-2 bg-gray-800 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <p className="italic text-sm text-yellow-400/[0.6] break-normal whitespace-normal break-all">
                              {variable.description ||
                                "Click on the edit icon to edit the variable and description."}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button" // Prevent form submission
                        className=" rounded-lg text-indigo-500 p-0.5 ml-2"
                        onClick={(e) => {
                          e.preventDefault(); // Prevent form submission
                          openEditModal(variable);
                        }}
                      >
                        <SquarePen className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {variable.options?.map((option, index) => (
                        <div
                          key={index}
                          onClick={() => onSelectChange(variable, option)}
                          className={`cursor-pointer border rounded-lg px-3 py-2 bg-gradient-to-br from-black/[0.3] via-black/[0.1] to-black/[0.4] break-nbormal whitespace-normal break-all ${
                            selectedOptions[variable.type]?.[variable.identifier]?.includes(option)
                              ? "bg-indigo-900 border-muted-foreground border-opacity-40 text-white"
                              : "bg-indigo-700"
                          }`}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );

  return (
    <div className="mt-2">
      <h2 className="font-semibold text-xl mb-4">Live Preview:</h2>
      {renderVariableSection(formData?.systemVariables, "System Variables")}
      {renderVariableSection(formData?.promptVariables, "Prompt Variables")}
      {renderVariableSection(formData?.negativeVariables, "Negative Variables")}
      {formData?.imageinput && (
        <div>
          <input
            type="file"
            onChange={handleImageUpload}
            className="border rounded-lg p-2"
          />
        </div>
      )}
    </div>
  );
};

export default EditVariableForm;
