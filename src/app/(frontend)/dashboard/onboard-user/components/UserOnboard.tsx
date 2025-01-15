"use client";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/Icons";
import { Input } from "@/components/ui/input";
import { EllipsisVertical, Trash2, UserPlus, UserRoundCog } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

interface Member {
  id: string;
  email: string;
  userName: string;
}

const OnboardUser = () => {
  const [email, setEmail] = useState("");
  const [data, setData] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [filteredData, setFilteredData] = useState<Member[]>([]); // State for filtered data
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    memberId: "",
  });
  const emailInputRef = useRef(null);
  const [memberToRemove, setMemberToRemove] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleSend = async () => {
    if (email.trim()) {
      setLoading(true);
      try {
        const response = await fetch(
          "http://localhost:3000/api/users/onboard-Member",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email: email }),
          }
        );

        const res = await response.json();

        console.log("res", response);

        if (response.ok) {
          const randomPassword = res.data.password;
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/api/sendInvite`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: email, password: randomPassword }),
            }
          );

          const result = await response.json();

          console.log("result:", result);

          if (response.ok && result.success) {
            toast.success("User onboarded successfully!");
            setEmail("");

            fetchMembers();
            setShowModal(false);
          } else {
            throw new Error(result.error || "Failed to send invitation email");
          }
        } else {
          toast.error(res.error);
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("An error occurred while onboarding the user.");
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Please enter a valid email.");
    }
  };

  const handleRemove = async (memberId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/remove-member`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ memberId }),
        }
      );

      const res = await response.json();

      if (response.ok) {
        toast.success("Member removed successfully!");
        closeConfirmModal();
        fetchMembers();
      } else {
        closeConfirmModal();
        toast.error(res.error);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while removing the member.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const getUser = await fetch(
        "http://localhost:3000/api/users/onboarded-members-list"
      );
      const data = await getUser.json();
      setData(data.data || []);
      setFilteredData(data.data || []); // Initialize filteredData
    } catch (error) {
      console.error("Error fetching members:", error);
    }
    setLoading(false);
  };

  const openConfirmModal = (memberId: string) => {
    setConfirmModal({ open: true, memberId });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ open: false, memberId: "" });
  };

  const confirmRemove = () => {
    handleRemove(confirmModal.memberId);
  };

  // Update filtered data based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = data.filter(
        (member) =>
          member?.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data); // Reset to original data when search is cleared
    }
  }, [searchTerm, data]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const toggleDropdown = (email: string) => {
    setOpenDropdown((prev) => (prev === email ? null : email));
  };

  const isDropdownOpen = (email: string) => openDropdown === email;

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="md:p-6 flex flex-col gap-4 bg-indigo-800 shadow-2xl min-h-[80vh] w-full">
        {/* <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 mx-auto md:my-2 mt-4 justify-between w-full">
          <h1 className="text-lg md:text-3xl font-bold">
            Onboard a New Member
          </h1>
        </div> */}

        <div className="flex flex-row items-center gap-2 max-md:mt-4 justify-between">
          {/* Search Bar */}
          <div className="relative w-full max-w-md">
            <Input
              type="text"
              placeholder="Search by username or email"
              className="w-full bg-gradient-to-br from-indigo-900 to-indigo-950 border-muted-foreground text-white px-10 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500  transition duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Icons.searchbar />
            </div>
          </div>
          <Button
            variant="white"
            className="transform transition duration-500 hover:scale-105"
            onClick={() => setShowModal(true)}
          >
            <UserPlus className="" strokeWidth={2.5} />
            <span className="hidden md:block ml-2">Add Member</span>
          </Button>
        </div>

        {/* Members List */}
        <div className=" mx-auto w-full">
          {loading ? (
            <div className="flex justify-center items-center">Loading...</div>
          ) : filteredData.length === 0 ? (
            <div className="justify-center mx-auto py-10 h-96 bg-indigo-900/[0.4] border-dashed border-2 border-muted-foreground rounded-lg flex items-center">
              <p className="text-gray-400">No members onboarded yet.</p>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              {filteredData.map((member) => (
                <Link
                  href={`/dashboard/onboard-user/${member.userName}`}
                  key={member.id}
                  className="bg-gradient-to-r from-black/[0.3] via-black/[0.1] to-black/[0.4] shadow hover:shadow-lg transition rounded-lg px-4 py-4 relative"
                >
                  <div className="flex flex-col md:flex-row gap-2 md:gap-8 items-start sm:items-center justify-between">
                    {/* Username Column */}
                    <div className="text-white font-semibold w-full md:w-4/12">
                      {member?.userName || "username"}
                    </div>

                    {/* Email Column */}
                    <div className="text-gray-200 w-full md:w-6/12">
                      {member.email}
                    </div>

                    {/* Role Column */}
                    <div className="text-gray-300 text-md italic w-full md:w-2/12">
                      {"No Role"}
                    </div>

                    {/* Action Buttons Column */}
                    {/* Action Buttons Column */}
                    <div
                      className="absolute max-md:top-3 max-md:right-1 md:relative flex items-center justify-end w-full md:w-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="text-gray-400 hover:text-white z-10"
                        onClick={(e) => {
                          e.preventDefault();
                          toggleDropdown(member.email); // Toggle dropdown by email
                        }}
                      >
                        <EllipsisVertical className="w-5 h-5" />
                      </button>

                      {/* Dropdown Menu */}
                      {isDropdownOpen(member.email) && ( // Check if dropdown is open for this email
                        <div className="absolute top-full right-0 mt-2 z-20 bg-white shadow-lg rounded-md">
                          <ul className="flex max-md:items-center md:flex-col p-1 md:p-2 space-y-1">
                            <li>
                              <Button
                                className="text-gray-400 bg-white hover:text-black w-full text-left flex flex-row justify-start px-2 py-1"
                                onClick={(e) => {
                                  e.preventDefault();
                                  closeDropdown(); // Close the dropdown
                                  openConfirmModal(member.id);
                                  setMemberToRemove(member.email);
                                }}
                              >
                                <Trash2 className="w-5 h-5 inline-block md:mr-2" />
                                <p className="max-md:hidden">Remove Member</p>
                              </Button>
                            </li>
                            <li>
                              <Button
                                className="text-gray-400 bg-white hover:text-black flex flex-row justify-start w-full text-left px-2 py-1"
                                onClick={(e) => {
                                  e.preventDefault();
                                  closeDropdown(); // Close the dropdown
                                  openConfirmModal(member.id);
                                  setMemberToRemove(member.email);
                                }}
                              >
                                <UserRoundCog className="w-5 h-5 inline-block md:mr-2" />
                                <p className="max-md:hidden">Edit Role</p>
                              </Button>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4 text-black">Add Member</h2>
              <input
                type="email"
                placeholder="Enter member email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              />
              <div className="flex justify-end">
                <button
                  className="bg-gray-300 text-black py-2 px-4 rounded-lg hover:bg-gray-400 transition duration-300 mr-2"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className={`py-2 px-4 rounded-lg transition duration-300 font-semibold ${
                    loading
                      ? "bg-gray-500 text-white cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                  onClick={handleSend}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Add Member"}
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmModal.open && (
          <div className="fixed inset-0 bg-black bg-opacity-80 transition-all duration-200 flex justify-center items-center px-4">
            <div className="bg-white text-black rounded-lg p-6 w-full max-w-lg">
              <h2 className="text-2xl font-bold mb-4">Confirm Remove</h2>
              <p className="break-normal whitespace-normal">
                Are you sure you want to remove{" "}
                <strong>{memberToRemove}</strong>?
              </p>
              <div className="flex justify-end mt-4">
                <button
                  className="bg-gray-300 text-black py-2 px-4 rounded-lg hover:bg-gray-400 transition duration-300 mr-2"
                  onClick={closeConfirmModal}
                >
                  Cancel
                </button>
                <button
                  className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-300"
                  onClick={confirmRemove}
                  disabled={loading}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardUser;
