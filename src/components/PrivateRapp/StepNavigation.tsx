// StepNavigation.tsx
import React from "react";

interface StepNavigationProps {
  step: number;
}

const StepNavigation: React.FC<StepNavigationProps> = ({ step }) => {
  return (
    <>
      <div className="w-full flex justify-center pt-2 md:pb-2">
    <ol className="flex flex-row space-x-8 md:space-x-10 items-center">
      {/* Step 1 */}
      <li className="relative flex-1 after:content-[''] after:w-full after:h-0.5 after:bg-gray-200 after:inline-block after:absolute after:left-8 md:after:left-10 after:right-0 after:top-1/2 after:-translate-y-1/2">
        <div className="flex items-center">
          <span
            className={`w-8 md:w-10 h-8 md:h-10 ${
              step >= 1 ? "bg-indigo-600" : "bg-gray-50"
            } border-2 border-white rounded-full flex justify-center items-center text-sm ${
              step >= 1 ? "text-white" : "text-indigo-600"
            }`}
          >
            {step > 1 ? (
              <svg
                className="w-5 h-5 stroke-white"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 12L9.28722 16.2923C9.62045 16.6259 9.78706 16.7927 9.99421 16.7928C10.2014 16.7929 10.3681 16.6262 10.7016 16.2929L20 7"
                  stroke="stroke-current"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            ) : (
              "1"
            )}
          </span>
        </div>
      </li>

      {/* Step 2 */}
      <li className="relative flex-1 after:content-[''] after:w-full after:h-0.5 after:bg-gray-200 after:inline-block after:absolute after:left-8 md:after:left-10 after:right-0 after:top-1/2 after:-translate-y-1/2">
        <div className="flex items-center">
          <span
            className={`w-8 md:w-10 h-8 md:h-10 ${
              step >= 2 ? "bg-indigo-600" : "bg-gray-50"
            } border-2 border-white rounded-full flex justify-center items-center text-sm ${
              step >= 2 ? "text-white" : "text-indigo-600"
            }`}
          >
            {step > 2 ? (
              <svg
                className="w-5 h-5 stroke-white"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 12L9.28722 16.2923C9.62045 16.6259 9.78706 16.7927 9.99421 16.7928C10.2014 16.7929 10.3681 16.6262 10.7016 16.2929L20 7"
                  stroke="stroke-current"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            ) : (
              "2"
            )}
          </span>
        </div>
      </li>

          {/* Step 3 */}

          <li className="relative flex-1 after:content-[''] after:w-full after:h-0.5 after:bg-gray-200 after:inline-block after:absolute after:left-8 md:after:left-10 after:right-0 after:top-1/2 after:-translate-y-1/2">
            <div className="flex items-center">
              <span
                className={`w-8 md:w-10 h-8 md:h-10 ${
                  step >= 3 ? 'bg-indigo-600' : 'bg-gray-50'
                } border-2 border-white rounded-full flex justify-center items-center text-sm ${
                  step >= 3 ? 'text-white' : 'text-indigo-600'
                }`}
              >
                {step > 3 ? (
                  <svg
                    className="w-5 h-5 stroke-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 12L9.28722 16.2923C9.62045 16.6259 9.78706 16.7927 9.99421 16.7928C10.2014 16.7929 10.3681 16.6262 10.7016 16.2929L20 7"
                      stroke="stroke-current"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                ) : (
                  '3'
                )}
              </span>
            </div>
          </li>
          {/* Step 4 */}
          <li className="relative flex-1">
            <div className="flex items-center">
              <span
                className={`w-8 md:w-10 h-8 md:h-10 ${
                  step >= 4 ? 'bg-indigo-600' : 'bg-gray-50'
                } border-2 border-white rounded-full flex justify-center items-center text-sm ${
                  step >= 4 ? 'text-white' : 'text-indigo-600'
                }`}
              >
                {step > 4 ? (
                  <svg
                    className="w-5 h-5 stroke-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 12L9.28722 16.2923C9.62045 16.6259 9.78706 16.7927 9.99421 16.7928C10.2014 16.7929 10.3681 16.6262 10.7016 16.2929L20 7"
                      stroke="stroke-current"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                ) : (
                  '4'
                )}
              </span>
            </div>
          </li>
        </ol>
      </div>
    </>
  );
};

export default StepNavigation;
