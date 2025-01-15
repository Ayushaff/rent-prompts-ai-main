import React, { useEffect } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Input } from "../ui/input";
import FileUpload from "./ImageUpload";
import { Textarea } from "../ui/textarea";

interface Step3RappDetailsProps {
  formData: { name: string; description: string };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  onValidationChange: (isValid: any) => void;
}

const Step3RappDetails: React.FC<Step3RappDetailsProps> = ({
  formData,
  setFormData,
  onValidationChange,
}) => {

  useEffect(() => {
    const isValid = formData.name && formData.description;
    onValidationChange(isValid);
  }, [formData.name, formData.description, onValidationChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value, // Dynamically set formData fields
    }));
  };

  return (
    <div className="w-full flex gap-10">
      <div className="w-full flex flex-col justify-between p-4 md:px-8 md:py-7 border-2 border-muted-foreground rounded-lg bg-indigo-700">
        <div className="w-full">
          <div className="mb-4">
            <Label className="block text-lg font-semibold mb-2">Rapp Title:</Label>
            <Input
              type="text"
              name="name" // Match this with the formData's "name" field
              value={formData.name} // Set the value from formData
              onChange={handleInputChange} // Call the handler to update formData
              className="w-full p-2 border border-gray-300 bg-background rounded"
            />
          </div>

          <div className="mb-4">
            <Label className="block text-lg font-semibold mb-2">Rapp Description:</Label>
            <Textarea
              name="description" // Match this with the formData's "description" field
              value={formData.description} // Set the value from formData
              onChange={handleInputChange} // Call the handler to update formData
              className="w-full p-2 rounded"
            />
          </div>

          <div className="mb-4">
            <Label className="block text-sm font-semibold mb-2">Upload Image:</Label>
            <FileUpload
              name="image"
              onChange={(file) =>
                setFormData((prevData) => ({
                  ...prevData,
                  image: file, // Assuming you're adding an image to formData
                }))
              }
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step3RappDetails;
