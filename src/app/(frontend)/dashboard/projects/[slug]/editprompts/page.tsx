"use client";
import React, { useEffect, useRef, useState } from "react";
import { Model } from "@/payload-types";
import LivePreview from "@/components/EditPrompt/EditLivePreview";
import Step2PromptInputs from "@/components/EditPrompt/EditPromptsStep";
import { useParams } from "next/navigation";
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
  access: Access[];
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

const Privaterapp: React.FC = () => {
  const user = useUser();
  const router = useRouter();
  const params = useParams()
  const slug = params?.slug
  const [formData, setFormData] = useState<CreatePrivateRapps>();
  const [rappData, setRappData] = useState(new FormData())



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
            setFormData(data.rappData)
            const form = new FormData()
            Object.keys(data).forEach((key) => {
              form.append(key, data[key])
            })
            setRappData(form)
          }
        } catch (error) {
          console.error('Error fetching rapp data:', error)
        }
      }

      fetchRappData()
    }
  }, [slug, user])
  console.log('Rapp data:', rappData)

  return (
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="md:w-1/2 xl:w-3/5">
                    <Step2PromptInputs
                      formData={formData}
                      setFormData={setFormData}
                      selectedModel={formData?.model}
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
  );
};

export default Privaterapp
