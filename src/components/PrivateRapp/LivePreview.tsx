import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import Image from "next/image";
import { Button } from "../ui/button";
import { toast } from "sonner";
import VariableForm from "./RenderPreviewForm";
import { Trash } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { Icons } from "../ui/Icons";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import ReactMarkdown from "react-markdown";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

interface LivePreviewProps {
  formData: {
    type: string;
    name: string;
    description: string;
    price: number;
    imageinput: boolean;
    totalCost: number;
    status: string;
    prompt: string;
    negativeprompt: string;
    settings: {
      name: string;
    };
    systemprompt: string;
    model: string;
    promptVariables: Variable[];
    systemVariables: Variable[];
    negativeVariables: Variable[];
  };
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

const LivePreview: React.FC<LivePreviewProps> = ({
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
  const [selectedOptions, setSelectedOptions] = React.useState<{
    [key: string]: { [key: string]: string[] }; // [variableType]: { [variableId]: selectedOptions[] }
  }>({
    systemVariables: {},
    promptVariables: {},
    negativeVariables: {},
  });
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState<boolean>(false);
  const [copyText, setCopyText] = useState("Copy");
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
                : [option], // Single select: Replace with the new option
            }
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
      if (
        updatedSelectedOptions[variable.type][variable.identifier]?.includes(
          option
        )
      ) {
        updatedSelectedOptions[variable.type][
          variable.identifier
        ] = updatedSelectedOptions[variable.type][variable.identifier].filter(
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

    // Log the selectedOptions and formData to inspect the updates
    console.log(updatedSelectedOptions);
    console.log(updatedFormData);
  };

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
            userPrompt: formData.prompt,
            systemPrompt: formData.systemprompt,
            negetivePrompt: formData.negativeprompt,
            model: formData.model,
            variables: variablesToSend,
            settings: formData.settings,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const res = await response.json();

      if (response.ok) {
        const purchaseRapp = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/privateRapps/purchase`,
          {
            method: "POST",
            body: JSON.stringify({
              modelId: formData.model,
            }),
          }
        );

        const result = await purchaseRapp.json();

        if (purchaseRapp.ok) {
          setData(res?.data?.result);
          setOutput(res?.data?.result);
          toast.success("Rapp run successfully");
        } else {
          toast.error(result.error);
          setData("Oops, something went wrong.😟");
        }
      } else {
        toast.error(res.error);
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
    if (!variable.displayName.trim()) return "Display Name is required.";
    if (!variable.type) return "Data Type is required.";
    if (!variable.description.trim()) return "Description is required.";
    if (
      variable.type !== "boolean" &&
      variable.type !== "select" &&
      !variable.placeholder.trim()
    )
      return "Placeholder is required.";
    if (variable.type === "select") {
      if (!variable.options || !Array.isArray(variable.options)) {
        return "Options must be an array.";
      }
      if (variable.options.length === 0) {
        return "Options cannot be empty.";
      }
      if (variable.options.some((option) => !option.trim())) {
        return "Options cannot contain empty values.";
      }
      // Convert options to lowercase and check for duplicates
      const uniqueOptions = new Set(
        variable.options.map((opt) => opt.trim().toLowerCase())
      );
      if (uniqueOptions.size !== variable.options.length) {
        return "Options cannot be similar.";
      }
    }
    return null;
  };

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

  const handleCopy = () => {
    if (typeof output === "string") {
      navigator.clipboard.writeText(output);
      setCopyText("Copied");
      toast.success("Text copied successfully");
      setDropdownOpen(!dropdownOpen);

      setTimeout(() => {
        setCopyText("Copy");
      }, 2000);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const content = output;
  
    if (typeof content === "string") {
      const pageWidth = 190; // Width available for text (A4 size page minus margins)
      const lineHeight = 7; // Line height
      const startX = 10; // Starting X position for text
      let startY = 10; // Starting Y position for text
  
      const lines = doc.splitTextToSize(content, pageWidth);
    
      lines.forEach((line, index) => {
        // Detect headings and apply different styles
        if (line.startsWith("**") && line.endsWith("**")) {
          // Treat this as a heading
          doc.setFont("helvetica", "bold");
          doc.setFontSize(18); // Heading size: 18pt
          doc.setTextColor(31, 78, 121); // Dark blue color for headings
          line = line.replace(/\*\*/g, ""); // Remove Markdown-style "**" for heading
        } else if (line.startsWith("* ")) {
          // Detect bullet points
          doc.setFont("helvetica", "normal");
          doc.setFontSize(12); // Bullet point size: 12pt
          doc.setTextColor(51, 51, 51); // Dark gray for text
          line = line.replace("* ", "• "); // Convert '*' to bullet symbol
        } else {
          // Regular paragraph
          doc.setFont("helvetica", "normal");
          doc.setFontSize(12); // Regular paragraph size: 12pt
          doc.setTextColor(51, 51, 51); // Dark gray for text
        }
        
        // Check if the line fits within the page height
        if (startY + lineHeight > doc.internal.pageSize.height - 10) {
          // If the next line exceeds the page height, add a new page
          doc.addPage();
          startY = 10; // Reset Y position for new page
        }
  
        // Draw the line
        doc.text(line, startX, startY);
        startY += lineHeight; // Move to the next line position
      });
  
      doc.save("output.pdf");
      toast.success("Exported to PDF successfully");
      setDropdownOpen(!dropdownOpen);
    } else {
      console.error("Output is not in a valid format for PDF generation.");
    }
  };
  
  const handleExportToWord = () => {
    const content = output;
    const lines = content.split("\n"); // Split content into lines
    const docContent: Paragraph[] = []; // Array to store Paragraph objects
  
    lines.forEach((line) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        // Detect headings
        docContent.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line.replace(/\*\*/g, ""), // Remove Markdown-style "**"
                bold: true,
                size: 28, // Heading size: 14pt
                color: "1F4E79", // Dark blue color for headings
              }),
            ],
            spacing: { after: 200 }, // Add spacing after the heading
          })
        );
      } else if (line.startsWith("* ")) {
        // Detect bullet points
        docContent.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line.replace("* ", ""), // Remove the bullet symbol
                size: 24, // Bullet point size: 12pt
                color: "333333", // Dark gray for text
              }),
            ],
            bullet: {
              level: 0, // Top-level bullet
            },
            spacing: { after: 100 }, // Add spacing after each bullet point
          })
        );
      } else if (line.trim() !== "") {
        // Treat all other lines as regular paragraphs
        docContent.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line.trim(), // Trim extra spaces
                size: 24, // Regular paragraph size: 12pt
                color: "333333",
              }),
            ],
            spacing: { after: 150 }, // Add spacing after the paragraph
          })
        );
      }
    });
  
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: docContent,
        },
      ],
    });
  
    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "output.docx");
      console.log("Word document created successfully");
    });
  };
  

  const handleDownloadExcel = () => {
    const content = output;
  
    if (typeof content === "string") {
      // Split content into rows (e.g., by newline or a delimiter)
      const rows = content.split("\n").map((line) => ({ Output: line }));
  
      // Create a worksheet and workbook
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  
      // Save the file
      XLSX.writeFile(workbook, "output.xlsx");
      console.log("Excel file downloaded!");
      toast.success("Exported to Excel successfully");
      setDropdownOpen(false);
    } else {
      console.error("Output is not in a valid format for Excel generation.");
      toast.error("Unable to export. Invalid output format.");
    }
  };
  

  const renderPreviewContent = () => {
    switch (currentStep) {
      case 2:
        return (
          <div className="space-y-4">
            <VariableForm
              onValueChange={handleValueChange}
              onSelectChange={handleSelectOption}
              openEditModal={openEditModal}
              handleImageUpload={handleImageUpload}
              formData={formData}
              selectedOptions={selectedOptions}
            />

            <div className="mt-6 space-y-4">
              <div className="px-4 rounded-md bg-indigo-800 md:h-[30rem] pb-10 md:pb-24 relative overflow-hidden">
                {typeof data === "string" ? (
                  <>
                    <div className="sticky top-0 flex flex-col bg-indigo-800 z-20">
                      <div className="flex flex-row justify-between items-center py-2">
                        <h2 className="text-white py-2 px-3 rounded-lg shadow-md">
                          Output Section:
                        </h2>
                        <div className="relative">
                          <button
                            className="bg-indigo-800 text-white py-1 px-3 rounded-lg shadow-md hover:bg-indigo-500 transition-colors flex items-center"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              className="w-6 h-6"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 16.5l6 6M21 16.5l-6 6M12 2.25v15m0 0l3-3m-3 3l-3-3"
                              />
                            </svg>
                          </button>
                          {dropdownOpen && (
                            <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                              <button
                                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                onClick={handleCopy}
                              >
                                {copyText}
                              </button>
                              <button
                                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                onClick={handleDownloadPDF}
                              >
                                Export to PDF
                              </button>
                              <button
                                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                onClick={handleExportToWord}
                              >
                                Export to Word
                              </button>
                              <button
                                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                onClick={handleDownloadExcel}
                              >
                                Export to Excel
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-white break-words overflow-auto pr-2 whitespace-pre-wrap h-full mt-2">
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }) => (
                          <h1
                            style={{
                              fontSize: '2rem', // Larger font for main headings
                              fontWeight: 'bold', // Bold for emphasis
                              margin: '0 0 10px',
                              lineHeight: '1.4',
                              color: '#FFFFFF', // White color for heading
                            }}
                            {...props}
                          />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2
                            style={{
                              fontSize: '1.5rem', // Slightly smaller for subheadings
                              fontWeight: '600',
                              margin: '0 0 1px',
                              lineHeight: '1.3',
                              color: '#FFFFFF', // White color for subheading
                            }}
                            {...props}
                          />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3
                            style={{
                              fontSize: '1.25rem', // Smaller subheading size
                              fontWeight: '500',
                              margin: '0 0 1px',
                              lineHeight: '1.3',
                              color: '#FFFFFF', // White color for smaller subheadings
                            }}
                            {...props}
                          />
                        ),
                        p: ({ node, ...props }) => (
                          <p
                            style={{
                              fontSize: '1rem', // Standard paragraph size
                              fontWeight: '400',
                              margin: '0 0 1px',
                              lineHeight: '1.2',
                              color: '#FFFFFF', // White color for paragraph text
                            }}
                            {...props}
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <li
                            style={{
                              fontSize: '1rem',
                              fontWeight: '400',
                              margin: '0 0 1px',
                              lineHeight: '1.2',
                              color: '#FFFFFF', // White color for list items
                            }}
                            {...props}
                          />
                        ),
                      }}
                    >
                      {data}
                    </ReactMarkdown>


                    </div>
                  </>
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
              {loading ? (
                <div className="flex justify-between items-center">
                  <Button
                    variant="blue"
                    className=" text-lg"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    Running...
                  </Button>
                  <p className="text-yellow-300 text-sm">
                    {formData.totalCost}/cycle
                  </p>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <Button
                    variant="blue"
                    className="text-lg px-6"
                    onClick={handleSubmit}
                  >
                    Run
                  </Button>
                  <p className="text-yellow-300 text-sm">
                    {formData.totalCost}/cycle
                  </p>
                </div>
              )}
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
                              <div
                                key={index}
                                className="flex items-center space-x-2"
                              >
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

                    {error && <p className="text-red-500 text-sm">{error}</p>}

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
      case 3:
        return (
          <div className="w-full py-4">
              <div className="flex-1 rounded-lg">
                <div className="relative h-60 overflow-hidden rounded-lg">
                  <Image
                    src="/DummyRapps.png"
                    alt="Rapp Image"
                    className="object-cover"
                    fill
                    priority
                  />
                </div>

                <div className="space-y-2 sm:space-y-4">
                  <div className="space-y-2">
                    <p className="text-white text-2xl sm:text-4xl font-bold">
                      {formData.name}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-gray-300 whitespace-normal break-words">
                      {formData.description}
                    </p>
                  </div>

                  <div className="flex felx-row gap-2 sm:gap-4 items-center">
                    <div className={`space-y-2 ${isEditing ? "w-1/3" : ""}`}>
                      <div className="flex gap-2 items-center">
                        <p className="text-whiten w-fit bg-indigo-600 py-1 px-2 rounded-lg text-xs font-semibold">
                          <span>{formData?.model?.toUpperCase()}</span>
                        </p>
                        <p className="text-whiten w-fit bg-indigo-600 py-1 px-2 rounded-lg text-xs font-semibold">
                          <span>{formData?.type?.toUpperCase()}</span>
                        </p>
                      </div>
                    </div>
                    <div className={`space-y-2 ${isEditing ? "w-2/3" : ""}`}>
                      <p className="text-whiten w-fit bg-indigo-600 py-1 px-2 rounded-lg text-xs font-semibold">
                        ${formData.totalCost}
                      </p>
                    </div>
                    {/* {formData.commission !== undefined && (
                      <div className="space-y-2">
                        <p className="text-whiten w-fit bg-indigo-600 py-1 px-2 rounded-lg text-xs font-semibold">
                          ${formData.commission}
                        </p>
                      </div>
                    )} */}
                  </div>
                  <div className="space-y-2">
                    <div
                      className={`text-xs sm:text-sm font-medium w-fit flex justify-start px-1 py-1 sm:px-2 sm:py-2 rounded-lg text-right sm:text-center ${
                        formData.status === "approved"
                          ? "bg-white/[0.1] text-success"
                          : formData.status === "pending"
                          ? "bg-white/[0.1] text-warning"
                          : "bg-white/[0.1] text-danger"
                      }`}
                    >
                      {formData.status === "approved" && (
                        <p className="flex flex-row gap-1 items-center">
                          <Icons.approved /> <span>Approved</span>
                        </p>
                      )}
                      {formData.status === "pending" && (
                        <p className="flex flex-row gap-1 items-center">
                          <Icons.pending /> <span>Pending</span>
                        </p>
                      )}
                      {formData.status === "denied" && (
                        <p className="flex flex-row gap-1 items-center">
                          <Icons.denied /> <span>Denied</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
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

export default LivePreview;
