"use client";
import React, { useEffect, useRef, useState } from "react";
import Step1ModelSelection from "@/components/PrivateRapp/Step1ModelSelection";
import Step2PromptInputs from "@/components/PrivateRapp/Step2PromptInputs";
import StepNavigation from "@/components/PrivateRapp/StepNavigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LivePreview from "./LivePreview";
import Step3RappDetails from "./Step3RappDetails";
import { Model } from "@/payload-types";
import Link from "next/link";
import Step4RappDetails from "./Step4RappDetails";
import { ClipLoader } from "react-spinners";
import { useUser } from "@/providers/User";
import { useRouter } from "next/navigation";

interface CreatePrivateRapps {
  type: string;
  model: string;
  computationcost: number;
  systemprompt: string;
  prompt: string;
  negativeprompt: string;
  status: string;
  settings: {
    name: string;
    value: any;
  };
  imageinput: boolean;
  name: string;
  description: string;
  priceapplicable: boolean;
  price: number;
  totalCost: number;
  createdAt: string;
  updatedAt: string;
  promptVariables: [];
  systemVariables: [];
  negativeVariables:[];
  access: [];
}

const Privaterapp: React.FC = () => {
  const user = useUser();
  const router = useRouter();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreatePrivateRapps>({
    type: "text",
    model: "",
    computationcost: 0,
    systemprompt: "",
    prompt: "",
    negativeprompt: "",
    status: "",
    settings: {
      name: "",
      value: "",
    },
    imageinput: false,
    name: "",
    description: "",
    priceapplicable: false,
    price: 0,
    totalCost: 0,
    promptVariables: [],
    systemVariables: [],
    negativeVariables: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    access: [],
  });
  const [step, setStep] = useState<number>(1);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [canProceed, setCanProceed] = useState(false);
  const [isStepValid, setIsStepValid] = useState({
    step1: false,
    step2: false,
    step3: false,
  })
  const sendInvitationsRef: any = useRef(null)
  const [selectedUsers, setSelectedUsers] = useState<{
    [userId: string]: { email: string; access: boolean; permissions: string[] }
  }>({})
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (!user) {
      const timeout = setTimeout(() => {
        router.push("/auth/signIn");
      }, 2000);
      return () => clearTimeout(timeout);
    }
    const fetchModels = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/models/getAll");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setModels(result.data || []);
      } catch (err) {
        setError("Failed to load models.");
        console.error("Error fetching models:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, [user]);


  // Handle validation change from Step1ModelSelection
  const handleValidationChange = (isValid: boolean) => {
    // Only update if the validation state actually changed
    if (isValid !== isStepValid[`step${step}`]) {
      setIsStepValid((prev) => ({
        ...prev,
        [`step${step}`]: isValid,
      }));
    }

    // Only update canProceed if the value is different
    if (isValid !== canProceed) {
      setCanProceed(isValid);
    }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    if (isSending) return

    try {
      if (sendInvitationsRef.current) {
        // setIsSending(true) // Disable the button immediately
        await sendInvitationsRef.current() // Ensure async logic is awaited
      } else {
        console.error('sendInvitationsRef is not set.')
      }
    } catch (error) {
      console.error('Error processing invitations and permissions:', error)
      setError('Failed to process the request. Please try again.')
    } finally {
      // Reset submitted if you want the button to be enabled again
      // setSubmitted(false) // Or keep it true if the submission is one-time only
      setSuccessMessage('Invitations sent successfully!')

    }
  };

  // Find the selected model using the stored model ID
  const selectedModel = models.find((model) => model.id === formData.model);

  if (loading) return (
    <div className="flex justify-center items-center h-32">
      <ClipLoader color="#ffffff" loading={loading} size={50} />
    </div>
  );
  if (error) return <p>{error}</p>;

  return (
      <div className="flex flex-col gap-4">
        <div className="p-4 flex flex-col gap-4 bg-indigo-800 shadow-2xl relative w-full">
          <StepNavigation step={step} />
          {successMessage ? ( // Check if submitted
            <div className="flex flex-col items-center mt-4">
              <p className="text-green-500">{successMessage}</p>
              <Button variant="white" className="mt-2">
                <Link href="/dashboard/projects">Go to Rapps Listing</Link>
              </Button>
            </div>
          ) : (
            <div className="w-full border-t-2 border-t-muted-foreground pt-8">
              {step === 1 && (
                <Step1ModelSelection
                  formData={formData}
                  setFormData={setFormData}
                  APPLICATION_TYPES={["text", "image"]}
                  models={models}
                  onValidationChange={handleValidationChange}
                />
              )}
              {step === 2 && (
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="md:w-1/2 xl:w-3/5">
                    <Step2PromptInputs
                      formData={formData}
                      setFormData={setFormData}
                      selectedModel={selectedModel}
                      onValidationChange={handleValidationChange}
                    />
                  </div>
                  <div className="md:w-1/2 xl:w-2/5">
                    <LivePreview
                      setFormData={setFormData}
                      formData={formData}
                      currentStep={2}
                    />
                  </div>
                </div>
              )}
              {step === 3 && (
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="md:w-1/2 xl:w-2/5">
                    <Step3RappDetails
                      formData={formData}
                      setFormData={setFormData}
                      onValidationChange={handleValidationChange}
                    />
                  </div>
                  <div className="md:w-1/2 xl:w-3/5">
                    <LivePreview
                      setFormData={setFormData}
                      formData={formData}
                      currentStep={3}
                    />
                  </div>
                </div>
              )}
              {step === 4 && (
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="md:w-full w-full">
                    <Step4RappDetails
                      formData={formData}
                      setFormData={setFormData}
                      sendInvitationsRef={sendInvitationsRef}
                      selectedUsers={selectedUsers}
                      setSelectedUsers={setSelectedUsers}
                      isSending={isSending}
                      setIsSending={setIsSending}
                    />
                  </div>
                </div>
              )}
            </div>
                  )}
            <div className="flex mt-4 md:mt-0 justify-between md:absolute top-6 right-4 gap-4 items-end w-full">
              {!successMessage && step > 1 && (
                <Button variant="white" onClick={prevStep} className="md:ml-8">
                  <ChevronLeft className="-ml-2" strokeWidth="3" />
                  Previous
                </Button>
              )}

            {!successMessage && step < 4 ? (
              <Button
                variant="white"
                className="ml-auto"
                onClick={nextStep}
                disabled={!isStepValid[`step${step}`]}
              >
                Save & Continue
                <ChevronRight className="-mr-2" strokeWidth="3" />
              </Button>
            ) :(
              !successMessage && (
                <button
                  onClick={handleSubmit}
                  // disabled={
                  //   Object.values(selectedUsers).filter((user) => user.access).length === 0 ||
                  //   isSending
                  // }
                  className="px-4 py-2 font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
                >
                  {isSending ? 'Submitting...' : `Submit`}
                </button>
              )
            )}
          </div>
        </div>
      </div>
  );
};

export default Privaterapp
