"use client";

import { EllipsisVertical } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners"; // Loading spinner
import { toast } from "sonner";
import { Icons } from "../Icons";

interface Rapp {
  slug: string;
  id: string;
  type: string;
  model?: string;
  rappName: string;
  rappDes: string;
  cost: number;
  commission?: number;
  rappStatus: string;
  createdAt: string;
  updatedAt: string;
}

const MemberProductList = () => {
  const router = useRouter();
  const [rappData, setRappData] = useState<Rapp[]>([]);
  const [ownedRapps, setOwnedRapps] = useState<Rapp[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null); // State for open dropdown
  const [deleteRappId, setDeleteRappId] = useState<string | null>(null); // State for rapp to delete

  useEffect(() => {
    const getRapps = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/privateRapps/getRapps`
        );
        const data = await res.json();
        console.log("data:", data);
        setRappData(data.data.myRapps);
        setOwnedRapps(data.data.accessRapps);
      } catch (error) {
        console.error("Error fetching rapps:", error);
      } finally {
        setLoading(false);
      }
    };
    getRapps();
  }, []);

  const toggleDropdown = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  const handleRun = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    handleActionClick(e);
    router.push(`/dashboard/rapps/run/${slug}`);
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    handleActionClick(e);
    setDeleteRappId(id);
    setDropdownOpen(null);
  };

  // Confirm delete
  const handleDeleteConfirm = async () => {
    if (deleteRappId) {
      const deleteRapp = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/privateRapps/deleteRapp`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          credentials: "include",
          body: JSON.stringify({ deleteRappId }),
        }
      );

      const response = await deleteRapp.json();

      if (deleteRapp.ok) {
        toast.success("Rapp Deleted Successfully");
        setDeleteRappId(null);
        window.location.reload();
      } else {
        toast.error(response.error);
        setDeleteRappId(null);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteRappId(null);
  };

  return (
    <div className="rounded-sm border border-stroke bg-indigo-800 shadow-default dark:border-strokedark dark:bg-boxdark sm:p-6">
      <div className="flex items-center mb-4 sm:mb-6 gap-3">
        <h4 className="text-lg sm:text-xl font-semibold text-white">
          Rapp List
        </h4>
        <Link href="/dashboard/rapps/create/private">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Create Rapp
          </button>
        </Link>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <ClipLoader color="#ffffff" loading={loading} size={50} />
        </div>
      ) : (
        <>
          {/* If no Rapps are available */}
          {rappData?.length === 0 && ownedRapps.length === 0 ? (
            <div className="justify-center mx-auto mt-5 py-10 h-96 bg-indigo-900/[0.4] border-dashed border-2 border-muted-foreground rounded-lg flex items-center flex-col">
              <p className="text-gray-400">
                No Rapps available. Want to create a new one?
              </p>
              <Link href="/dashboard/rapps/create/private">
                <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                  Create Rapp
                </button>
              </Link>
            </div>
          ) : (
            <>
              {/* Your Rapps Section */}
              {rappData.length > 0 && (
                <>
                  <h5 className="text-lg font-semibold text-white mb-3">
                    Own Rapps
                  </h5>
                  <div className="space-y-3 sm:space-y-4">
                    {rappData.map((rapp) => (
                      <Link
                        href={`/dashboard/projects/${rapp.slug}`}
                        key={rapp.id}
                        className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-4 items-center bg-gradient-to-r from-black/[0.3] via-black/[0.1] to-black/[0.4] p-2 sm:p-4 rounded-md w-full shadow hover:shadow-lg transition"
                        style={{ gridTemplateColumns: "6fr 1fr 1fr 1fr auto" }}
                      >
                        <div className="overflow-hidden flex items-center gap-3 sm:gap-4">
                          <div className="h-8 w-8 sm:h-14 sm:w-14 rounded-md overflow-hidden min-w-8">
                            <Image
                              src="/DummyRapps.png"
                              width={64}
                              height={64}
                              alt="dummy image"
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="text-xs sm:text-base break-words whitespace-normal">
                            <h5 className="font-medium text-white break-word whitespace-normal">
                              {rapp.rappName}
                            </h5>
                            <p className="text-gray-500 dark:text-gray-400 line-clamp-2 break-words whitespace-normal">
                              {rapp.rappDes}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-right text-white">
                          ${rapp.cost}
                        </p>
                        <p className="text-xs sm:text-sm text-center text-white">
                          {rapp.model}
                        </p>
                        <p
                          className={`text-xs sm:text-sm font-medium w-fit flex justify-self-center px-1 py-1 sm:px-2 sm:py-2 rounded-full text-right sm:text-center ${
                            rapp.rappStatus === "approved"
                              ? "bg-white/[0.1] text-success"
                              : rapp.rappStatus === "pending"
                              ? "bg-white/[0.1] text-warning"
                              : "bg-white/[0.1] text-danger"
                          }`}
                        >
                          {rapp.rappStatus === "approved" && (
                            <p className="flex flex-row gap-1 items-center">
                              <Icons.approved />{" "}
                              <span className="hidden md:block">Approved</span>
                            </p>
                          )}
                          {rapp.rappStatus === "pending" && (
                            <p className="flex flex-row gap-1 items-center">
                              <Icons.pending />{" "}
                              <span className="hidden md:block">Pending</span>
                            </p>
                          )}
                          {rapp.rappStatus === "denied" && (
                            <p className="flex flex-row gap-1 items-center">
                              <Icons.denied />{" "}
                              <span className="hidden md:block">Denied</span>
                            </p>
                          )}
                        </p>

                        {/* Three dots menu button */}
                        <div className="relative">
                          <button
                            onClick={(e) => toggleDropdown(e, rapp.id)}
                            className="flex justify-center items-center text-xs sm:btn-sm text-white transition duration-300 dark:text-white dark:hover:bg-indigo-800/70"
                          >
                            <EllipsisVertical />
                          </button>
                          {/* Dropdown menu */}
                          {dropdownOpen === rapp.id && (
                            <div className="absolute right-4 mt-2 w-28 bg-white rounded-md shadow-lg dark:bg-gray-800">
                              <button
                                onClick={(e) => handleRun(e, rapp.slug)}
                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-600 hover:text-white dark:hover:text-white w-full text-left"
                              >
                                Run
                              </button>

                              <Link href={`/dashboard/projects/${rapp.slug}`}>
                                <button className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-600 hover:text-white dark:hover:text-white w-full text-left">
                                  Edit
                                </button>
                              </Link>
                              <button
                                onClick={(e) => handleDeleteClick(rapp.id, e)}
                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-600 hover:text-white dark:hover:text-white w-full text-left"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}

              {/* Shared Rapps Section */}
              {ownedRapps.length > 0 && (
                <>
                  <h5 className="text-lg font-semibold text-white mt-6 mb-3">
                    Shared Rapps
                  </h5>
                  <div className="space-y-3 sm:space-y-4">
                    {ownedRapps.map((rapp) => (
                      <Link
                        href={`/dashboard/projects/${rapp.slug}`}
                        key={rapp.id}
                        className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-4 items-center bg-gradient-to-r from-black/[0.3] via-black/[0.1] to-black/[0.4] p-2 sm:p-4 rounded-md w-full shadow hover:shadow-lg transition"
                        style={{ gridTemplateColumns: "6fr 1fr 1fr 1fr auto" }}
                      >
                        <div className="overflow-hidden flex items-center gap-3 sm:gap-4">
                          <div className="h-8 w-8 sm:h-14 sm:w-14 rounded-md overflow-hidden min-w-8">
                            <Image
                              src="/DummyRapps.png"
                              width={64}
                              height={64}
                              alt="dummy image"
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="text-xs sm:text-base break-words whitespace-normal">
                            <h5 className="font-medium text-white break-word whitespace-normal">
                              {rapp.rappName}
                            </h5>
                            <p className="text-gray-500 dark:text-gray-400 line-clamp-2 break-words whitespace-normal">
                              {rapp.rappDes}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-right text-white">
                          ${rapp.cost}
                        </p>
                        <p className="text-xs sm:text-sm text-center text-white">
                          {rapp.model}
                        </p>
                        <p
                          className={`text-xs sm:text-sm font-medium w-fit flex justify-self-center px-1 py-1 sm:px-2 sm:py-2 rounded-full text-right sm:text-center ${
                            rapp.rappStatus === "approved"
                              ? "bg-white/[0.1] text-success"
                              : rapp.rappStatus === "pending"
                              ? "bg-white/[0.1] text-warning"
                              : "bg-white/[0.1] text-danger"
                          }`}
                        >
                          {rapp.rappStatus === "approved" && (
                            <p className="flex flex-row gap-1 items-center">
                              <Icons.approved />{" "}
                              <span className="hidden md:block">Approved</span>
                            </p>
                          )}
                          {rapp.rappStatus === "pending" && (
                            <p className="flex flex-row gap-1 items-center">
                              <Icons.pending />{" "}
                              <span className="hidden md:block">Pending</span>
                            </p>
                          )}
                          {rapp.rappStatus === "denied" && (
                            <p className="flex flex-row gap-1 items-center">
                              <Icons.denied />{" "}
                              <span className="hidden md:block">Denied</span>
                            </p>
                          )}
                        </p>

                        {/* Three dots menu button */}
                        <div className="relative">
                          <button
                            onClick={(e) => toggleDropdown(e, rapp.id)}
                            className="flex justify-center items-center text-xs sm:btn-sm text-white transition duration-300 dark:text-white dark:hover:bg-indigo-800/70"
                          >
                            <EllipsisVertical />
                          </button>
                          {/* Dropdown menu */}
                          {dropdownOpen === rapp.id && (
                            <div className="absolute right-4 mt-2 w-28 bg-white rounded-md shadow-lg dark:bg-gray-800">
                              <button
                                onClick={(e) => handleRun(e, rapp.slug)}
                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-600 hover:text-white dark:hover:text-white w-full text-left"
                              >
                                Run
                              </button>
                              {/* <button
                                onClick={(e) => handleEdit(rapp.id, e)}
                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-600 hover:text-white dark:hover:text-white w-full text-left"
                              >
                                Edit
                              </button> */}
                              <button
                                onClick={(e) => handleDeleteClick(rapp.id, e)}
                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-600 hover:text-white dark:hover:text-white w-full text-left"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}

      {/* Confirmation modal */}
      {deleteRappId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-md shadow-lg p-6 dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Confirm Delete
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Are you sure want to delete this Rapp?
            </p>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleDeleteCancel}
                className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberProductList;
