"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { ClipLoader } from "react-spinners";
import { useParams, useRouter } from "next/navigation";

import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import Image from "next/image";
import { useUser } from "@/providers/User";

interface RappData {
  id: string;
  promptVariables: any[];
  systemVariables: any[];
  negativeVariables: any[];
  modelId: string;
}

const RunRapp = () => {
  const [rappData, setRappData] = useState<RappData>();
  const [promptInputs, setPromptInputs] = useState({});
  const [negativeInputs, setNegativeInputs] = useState({});
  const [systemInputs, setSystemInputs] = useState({});
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [running, setRunning] = useState<boolean>(false);
  const [copyText, setCopyText] = useState("Copy");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const user = useUser();
  const router = useRouter();

  const params = useParams();
  const { slug }: any = params;
  const decodedSlug = slug.replace("%20", "-");

  useEffect(() => {
    if (!user) {
      return router.push("/auth/signIn");
      }

    const getRappInfo = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/privateRapps/${decodedSlug}`
        );
        const data = await response.json();
        setRappData(data.rappData);
      } catch (err) {
        console.error("Error fetching rapp info:", err);
      } finally {
        setLoading(false);
      }
    };

    getRappInfo();
  }, [user]);


  const handleInputChange = (e, type, name) => {
    const value = e.target.value;

    if (type === "prompt") {
      setPromptInputs((prev) => ({ ...prev, [name]: value }));
    } else if (type === "negative") {
      setNegativeInputs((prev) => ({ ...prev, [name]: value }));
    } else if (type === "system") {
      setSystemInputs((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    try {
      const variablesToSend = [
        ...Object.keys(promptInputs).map((key) => ({
          name: key,
          value: promptInputs[key],
        })),
        ...Object.keys(systemInputs).map((key) => ({
          name: key,
          value: systemInputs[key],
        })),
        ...Object.keys(negativeInputs).map((key) => ({
          name: key,
          value: negativeInputs[key],
        })),
      ];

      const formData = {
        variables: variablesToSend,
        rappId: rappData?.id,
        model: rappData?.modelId,
      };

      setRunning(true);
      toast.loading("Running...");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/privateRapps/run`,
        {
          method: "POST",
          body: JSON.stringify(formData),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if(response.ok){
        const purchaseRapp = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/privateRapps/purchase`,
          {
            method: "POST",
            body: JSON.stringify({
              modelId: rappData?.modelId,
              rappId: rappData?.id,
            }),
          }
        );

        const result = await purchaseRapp.json();
  
        if (purchaseRapp.ok) {
          setOutput(data?.data?.result);
          toast.success("Rapp run successfully");
        } else {
          console.error("Error:", result.error);
          toast.error(result.error)
          setOutput("Oops, something went wrong.😟");
        }
      } else {
        console.error("Error:", data.error);
        toast.error(data.error)
        setOutput("Oops, something went wrong.😟");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setOutput("Oops, something went wrong.😟");
    } finally {
      setRunning(false);
      toast.dismiss();
    }
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
      doc.text(content, 10, 10, { maxWidth: 190 });
      doc.save("output.pdf");
      toast.success("Export in pdf successfully");
      setDropdownOpen(!dropdownOpen);
    } else {
      console.error("Output is not in a valid format for PDF generation.");
    }
  };

  const handleDownloadExcel = () => {
    const content = output;

    if (typeof content === "string") {
      const worksheet = XLSX.utils.json_to_sheet([{ Output: content }]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

      XLSX.writeFile(workbook, "output.xlsx");
      console.log("Excel file downloaded!");
      toast.success("Export in excel successfully");
      setDropdownOpen(!dropdownOpen);
    } else {
      console.error("Output is not in a valid format for Excel generation.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="mt-4 sm:mt-0 sm:p-4 flex flex-col gap-4 sm:bg-indigo-800 sm:shadow-2xl">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <ClipLoader color="#ffffff" loading={loading} size={50} />
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8 w-full mx-auto ">
            {/* Left side: Input panel */}
            <div className="relative w-full md:w-2/6 bg-gradient-to-br from-black/[0.1] to-black/[0.3] shadow-xl rounded-xl pb-16 md:pb-20 p-3 md:p-8 text-white h-fit">
              {rappData ? (
                <div>
                  {/* System Variables */}
                  {rappData?.systemVariables?.length > 0 && (
                    <>
                      <h2 className="font-bold text-2xl mb-3 text-purple-300 tracking-wide">
                        System Variables
                      </h2>
                      {rappData?.systemVariables.map((variable, index) => (
                        <div key={index} className="mb-3">
                          <div className="flex gap-1 items-center">
                            <Label className="block font-semibold text-lg mb-1">
                              {variable.displayName}
                            </Label>
                            <div className="relative">
                              <div className="group -mt-3">
                                <Info className="w-3 h-3 text-yellow-400 cursor-pointer z-20" />
                                <div className="absolute z-40 left-full top-1/2 transform -translate-y-1/2 ml-2 w-40 sm:w-60 p-2 bg-gray-800 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  <p className="italic text-sm text-yellow-400/[0.6] break-normal whitespace-normal">
                                    {variable.description ||
                                      "Click on the edit icon to edit the variable and description."}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Textarea
                            rows={1}
                            className="min-h-10"
                            placeholder={variable.placeholder}
                            value={systemInputs[variable.name] || ""}
                            onChange={(e) =>
                              handleInputChange(e, "system", variable.name)
                            }
                          />
                        </div>
                      ))}
                    </>
                  )}

                  {rappData?.promptVariables?.length > 0 && (
                    <>
                      <h2 className="font-bold text-2xl mb-3 text-white tracking-wide mt-5">
                        User Variables
                      </h2>
                      {rappData?.promptVariables?.map((variable, index) => (
                        <div key={index} className="mb-3">
                          <div className="flex gap-1 items-center">
                            <Label className="block font-semibold text-lg mb-1">
                              {variable.displayName}
                            </Label>
                            <div className="relative">
                              <div className="group -mt-3">
                                <Info className="w-3 h-3 text-yellow-400 cursor-pointer z-20" />
                                <div className="absolute z-40 left-full top-1/2 transform -translate-y-1/2 ml-2 w-40 sm:w-60 p-2 bg-gray-800 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  <p className="italic text-sm text-yellow-400/[0.6] break-normal whitespace-normal">
                                    {variable.description ||
                                      "Click on the edit icon to edit the variable and description."}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Textarea
                          rows={1}
                          className="min-h-10"
                            placeholder={variable.placeholder}
                            value={promptInputs[variable.name] || ""}
                            onChange={(e) =>
                              handleInputChange(e, "prompt", variable.name)
                            }
                          />
                        </div>
                      ))}
                    </>
                  )}

                  {/* Negative Variables */}
                  {rappData?.negativeVariables?.length > 0 && (
                    <>
                      <h2 className="font-bold text-2xl mb-3 text-red-300 tracking-wide mt-5">
                        Negative Variables
                      </h2>
                      {rappData?.negativeVariables.map((variable, index) => (
                        <div key={index} className="mb-3">
                          <div className="flex gap-1 items-center">
                            <Label className="block font-semibold text-lg mb-1">
                              {variable.displayName}
                            </Label>
                            <div className="relative">
                              <div className="group -mt-3">
                                <Info className="w-3 h-3 text-yellow-400 cursor-pointer z-20" />
                                <div className="absolute z-40 left-full top-1/2 transform -translate-y-1/2 ml-2 w-40 sm:w-60 p-2 bg-gray-800 text-white text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                  <p className="italic text-sm text-yellow-400/[0.6] break-normal whitespace-normal">
                                    {variable.description ||
                                      "Click on the edit icon to edit the variable and description."}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Textarea
                            rows={1}
                            placeholder={variable.placeholder}
                            value={negativeInputs[variable.name] || ""}
                            onChange={(e) =>
                              handleInputChange(e, "negative", variable.name)
                            }
                          />
                        </div>
                      ))}
                    </>
                  )}

                  <button
                    className="bg-yellow-500 absolute bottom-3 md:bottom-7 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 mt-6"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? <span>Running...</span> : <span>Run Model</span>}
                  </button>
                </div>
              ) : (
                <p className="text-gray-300">Loading...</p>
              )}
            </div>

            {/* Right side: Output panel */}
            <div className="w-full md:w-4/6 min-h-[80vh] sm:max-h-[80vh]">
              <div className="border border-gray-400 bg-white h-full sha p-3  rounded-lg shadow-inner shadow-black flex flex-col items-center justify-center">
                {running ? (
                  <span className="text-gray-500 flex flex-col gap-2 justify-center items-center">
                    <ClipLoader
                      color="text-gray-500"
                      loading={running}
                      size={50}
                    />
                    Generating output...
                  </span>
                ) : (
                  <>
                    {output ? (
                      typeof output === "string" ? (
                        <div className="relative w-full flex flex-col">
                          <p className="text-gray-900 break-words whitespace-normal sm:overflow-y-auto sm:h-[80vh] sm:max-h-[80vh] sm:no-scrollbar">
                          <div className="sticky right-0 top-0 flex flex-col mb-2">
                            <div className="flex flex-row justify-between">
                            <h2 className="bg-indigo-800 text-white py-2 px-3 rounded-lg shadow-md flex items-center">
                              Output Section:
                            </h2>
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
                              <div className="absolute right-0 top-7 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
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
                                  onClick={handleDownloadExcel}
                                >
                                  Export to Excel
                                </button>
                              </div>
                            )}
                            </div>
                          </div>
                            <ReactMarkdown className="prose">
                              {output}
                            </ReactMarkdown>
                          </p>

                        </div>
                      ) : (
                        <div className="h-full flex flex-col justify-center items-center">
                          <Image
                            src={output}
                            alt="Uploaded"
                            className="max-w-full max-h-full object-contain mt-2 border border-gray-300 rounded-md"
                          />
                          <a
                            href={output}
                            download
                            className="mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-indigo-500 transition-colors"
                          >
                            Download Image
                          </a>
                        </div>
                      )
                    ) : (
                      <p className="text-gray-500 min-h-96 items-center flex break-normal whitespace-normal">
                        No output yet. Fill in the variables and run the model.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RunRapp;
