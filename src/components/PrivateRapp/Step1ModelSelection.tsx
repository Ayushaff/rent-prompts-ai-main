
import React, { useEffect } from "react";
import { Label } from "../ui/label";
import { Model } from "@/payload-types";
import { Box, ExternalLink, Image, } from "lucide-react";
import Link from "next/link";

interface Step1ModelSelectionProps {
  formData: {
    type: string;
    model: string; // Store only the selected model's ID
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  APPLICATION_TYPES: string[];
  models: Model[];
  onValidationChange: (isValid: boolean) => void;
}

const Step1ModelSelection: React.FC<Step1ModelSelectionProps> = ({
  formData,
  setFormData,
  APPLICATION_TYPES,
  models,
  onValidationChange,
}) => {

  useEffect(() => {
    const isValid = formData.type !== "" && formData.model !== "";
    onValidationChange(isValid);
  }, [formData.type, formData.model, onValidationChange]);

  const isModelCompatible = (model: Model) => {
    const { type } = formData;
    if (!type) return true;
    return type === "text" ? model.type === "text" : model.type === "image";
  };

  const handleAppTypeSelection = (appType: string) => {
    setFormData({
      ...formData,
      type: appType,
      model: "", 
    });
  };

  
  const handleModelSelection = (mod) => {
    setFormData({
      ...formData,
      model: mod.id,
      totalCost: mod.cost
    });
  };

  const capitalizeFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <div className="w-full h-full md:px-8 md:py-4 rounded-lg flex justify-start space-y-6">
      <div className="w-full flex flex-col justify-between items-center text-center md:text-left">
        <div className="w-full md:w-fit text-center flex items-center justify-center flex-col md:text-left">
          {/* Application Type Selection */}
          <div className="w-full md:w-fit mb-6 pb-4 border-b-2 border-b-muted-foreground text-center">
            <Label className="block text-xl font-semibold mb-6">
              Application Type:
            </Label>
            <div className="flex justify-center space-x-4">
              <div className="flex flex-row w-40 justify-center gap-2">
                {APPLICATION_TYPES.map((appType) => (
                  <div
                    key={appType}
                    className={`w-full relative cursor-pointer inline-flex items-center justify-center font-bold overflow-hidden group rounded-md ${
                      formData.type === appType
                        ? "border-2 border-white bg-indigo-900 rounded-xl"
                        : "border-2 border-muted-foreground bg-indigo-600 rounded-xl"
                    }`}
                    onClick={() => handleAppTypeSelection(appType)}
                  >
                    <div className="w-full relative px-3 py-2 text-white rounded-xl hover:bg-indigo-900 transition-colors duration-300">
                      <h3 className="font-semibold">{capitalizeFirstLetter(appType)}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Model Selection */}
          <div className="w-full mb-4 text-center">
            <Label className="block text-xl font-semibold mb-6">Model:</Label>
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {models.filter(isModelCompatible).map((mod) => (
                <div
                  key={mod.id}
                  className={`relative w-full cursor-pointer inline-flex items-center justify-center font-bold overflow-hidden group rounded-md ${
                    formData.model === mod.id
                      ? "border-2 border-white bg-indigo-900 rounded-xl"
                      : "border-2 border-muted-foreground bg-indigo-600 rounded-xl"
                  }`}
                  onClick={() => handleModelSelection(mod)}
                >
                  <div className="w-full relative px-3 py-2 h-[84px] text-white md:h-full rounded-xl hover:bg-indigo-900 transition-colors duration-300">
                    <div className="flex flex-row gap-4 w-full min-w-40 justify-between">
                      <div className="flex flex-row gap-4 items-center w-3/4">

                        <div className="flex flex-col w-full">
                          <div className="flex flex-row gap-2 mb-1">
                          <Box />
                          <h3 className="font-semibold text-left">
                          {mod.name}
                          </h3>
                          </div>
                         <p className="text-sm font-normal break-normal whitespace-normal line-clamp-2 text-left">
                          {mod.description}
                         </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 w-1/4">
                        <p>{mod.cost}</p>
                        {mod.imageinput && <Image className="w-6 h-6" aria-label="This Model Accepts Image as Input." />}
                        <Link href={`/dashboard/models/${mod.name}`}>
    <div className="flex items-center gap-1 text-indigo-300 hover:text-indigo-500 transition-colors duration-300" aria-label="View Model Details">
      <ExternalLink className="w-5 h-5" />
    </div>
  </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step1ModelSelection;
