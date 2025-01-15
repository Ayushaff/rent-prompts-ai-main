"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  DollarSign,
  Tag,
  FileText,
  CheckCircle,
  X,
  Save,
  XCircle,
  CirclePlus,
} from "lucide-react";
import UserAccessList from "../../../../../components/PrivateRapp/UserAccessList";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ClimbingBoxLoader, ClipLoader } from "react-spinners";
import { Icons } from "@/components/ui/Icons";
import { MdEdit } from "react-icons/md";
import { useUser } from "@/providers/User";
import { Checkbox } from "@/components/ui/checkbox";

interface Rapp {
  id: string;
  type: string;
  modelId?: string;
  rappName: string;
  rappDes: string;
  cost: number;
  commission?: number;
  rappStatus: string;
  createdAt: string;
  updatedAt: string;
  access: any;
  slug: string;
  modelName: string;
}

export default function RappDetail() {
  const params = useParams();
  const user = useUser();
  const slug = params?.slug as string;
  const [rapp, setRapp] = useState<Rapp | null>(null);
  const [originalRapp, setOriginalRapp] = useState<Rapp | null>(null);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<{
    [userId: string]: { email: string; read: boolean; update: boolean };
  }>({});
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [permissions, setPermissions] = useState({});
  const router = useRouter();
  const loggedInUser = useUser();

  const fetchRapp = async (slug) => {
    if (!user) {
      return router.push("/auth/signIn");
      }

    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/privateRapps/${slug}`
      );
      setRapp(response.data.rappData);
    } catch (error) {
      // console.error("Error fetching rapp data:", error);
      setError("Failed to load Rapp data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRapp(slug);
  }, [user]);

  const fetchUsers = async () => {
    try {
      setListLoading(true);
      const getUser = await fetch(
        "http://localhost:3000/api/users/onboarded-members-list"
      );
      const result = await getUser.json();

      if (!result.data || !Array.isArray(result.data)) {
        return;
      }

      const existingAccessUserIds = new Set(
        rapp?.access?.map((user) =>
          typeof user.userId === "object" ? user.userId.id : user.userId
        ) || []
      );

      const filteredUsers = result.data.filter(
        (user) => !existingAccessUserIds.has(user.id)
      );

      setData(filteredUsers);
      setFilteredData(filteredUsers);
    } catch (error) {
      toast.error("Failed to Member list");
    } finally {
      setListLoading(false);
    }
  };

  const handleAddMemberClick = () => {
    setShowModal(true);
    fetchUsers();
  };

  const handlePermissionChange = (
    email: string,
    action: "read" | "update",
    checked: boolean | "indeterminate"
  ) => {
    // Ensure the `checked` value is boolean
    const isChecked = checked === true;

    setPermissions((prev) => ({
      ...prev,
      [email]: {
        ...prev[email],
        [action]: isChecked, // Assign the boolean value to the action
      },
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    const formattedPermissions = Object.entries(permissions)
      .filter(([, permission]: any) => permission.read || permission.update)
      .map(([email, permission]: any) => {
        const user: any = filteredData.find((u: any) => u.email === email);
        return {
          userId: user?.id,
          getAccess: [
            ...(permission.read ? ["read"] : []),
            ...(permission.update ? ["update"] : []),
          ],
        };
      });

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/privateRapps/updateAccessList/${rapp?.id}`,
      formattedPermissions,
      { headers: { "Content-Type": "application/json" } }
    );

    if (response.status === 200) {
      toast.success("Rapp updated successfully.");
      setPermissions({});
      formattedPermissions.length = 0;
      const newSlug = response.data.slug;
      router.replace(`/dashboard/projects/${newSlug}`);
      setIsEditing(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error("Failed to update Rapp");
      throw new Error("Failed to update Rapp");
    }

    setShowModal(false);
    setIsLoading(false);
  };

  const toggleEditMode = () => {
    if (isEditing) {
      setRapp(originalRapp);
    } else {
      setOriginalRapp(rapp);
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setRapp((prevRapp) =>
      prevRapp
        ? {
            ...prevRapp,
            [name]:
              name === "commission" || name === "cost"
                ? parseFloat(value) || 0
                : value,
          }
        : null
    );
  };

  const handleSelectChange = (name: string, value: string) => {
    setRapp((prevRapp) => (prevRapp ? { ...prevRapp, [name]: value } : null));
  };

  const handleFormSubmit = async () => {
    if (!rapp) return;

    setLoading(true);
    const form = new FormData();
    form.append("id", rapp.id);
    form.append("rappName", rapp.rappName);
    form.append("rappDes", rapp.rappDes);
    if (rapp.modelId) {
      form.append("model", rapp.modelId);
    }
    form.append("type", rapp.type);
    form.append("cost", rapp.cost.toString());
    if (rapp.commission) form.append("commission", rapp.commission.toString());
    form.append("rappStatus", rapp.rappStatus);

    Object.entries(selectedUsers).forEach(([userId, user], index) => {
      form.append(`users[${index}][userId]`, userId);
      form.append(`users[${index}][email]`, user.email);
      form.append(`users[${index}][read]`, user.read.toString());
      form.append(`users[${index}][update]`, user.update.toString());
    });

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/privateRapps/updatePrivateRapps/${rapp.id}`,
        form,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        toast.success("Rapp updated successfully.");
        const newSlug = response.data.slug;
        router.replace(`/dashboard/projects/${newSlug}`);
        setIsEditing(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast.error("Failed to update Rapp");
        throw new Error("Failed to update Rapp");
      }
    } catch (error) {
      // console.error("Error updating rapp:", error);
      toast.error("Error updating rapp.");
      setRapp(originalRapp);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <ClipLoader color="#ffffff" loading={loading} size={50} />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  if (!rapp) {
    return <div className="text-center p-4">No Rapp data found</div>;
  }

  return (
    <div className="mt-4 sm:mt-0 sm:p-6 sm:bg-indigo-800 sm:shadow-2xl">
      <div className="text-2xl font-bold text-white flex justify-between items-center pb-4">
        <div className="flex items-center gap-1">
          <FileText className="h-6 w-6" />
          <span>{isEditing ? "Edit Rapp" : "Rapp Details"}</span>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/rapps/run/${slug}`}>
            <Button variant="green" className="px-2 py-2">
              Run
            </Button>
          </Link>
          {(loggedInUser?.role === "enterprise" ||
            rapp.access?.some(
              (access) =>
                access.userId?.id === loggedInUser?.id &&
                access.getAccess?.includes("update")
            )) && (
            <Link href={`/dashboard/projects/${slug}/editprompts`}>
              <Button variant="white" className="px-2 py-2">
                Edit Prompts
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side: Rapp Details */}
        <div className="flex-1 space-y-4 bg-black/[0.2] rounded-lg p-4">
          <div className="relative h-60 overflow-hidden rounded-lg">
            <Image
              src="/DummyRapps.png"
              alt="Rapp Image"
              className="object-cover"
              fill
              priority
            />
            {isEditing ? (
              <div className="absolute top-2 right-2">
                <Button onClick={handleFormSubmit} variant="green">
                  Save
                </Button>
                <Button
                  onClick={toggleEditMode}
                  variant="outline"
                  className="ml-2"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                {(loggedInUser?.role === "enterprise" ||
                  rapp.access?.some(
                    (access) =>
                      access.userId?.id === loggedInUser?.id &&
                      access.getAccess?.includes("update")
                  )) && (
                  <Button
                    onClick={toggleEditMode}
                    className="absolute top-2 right-2 rounded-full"
                    variant="iconWhite"
                  >
                    <MdEdit className="text-2xl" />
                  </Button>
                )}
              </>
            )}
          </div>

          <div className="space-y-2 sm:space-y-4">
            <div className="space-y-2">
              {isEditing ? (
                <div>
                  <Label
                    htmlFor="rappName"
                    className="text-sm font-medium text-indigo-200"
                  >
                    Rapp Name
                  </Label>
                  <Input
                    id="rappName"
                    name="rappName"
                    value={rapp.rappName}
                    onChange={handleInputChange}
                    className="text-white bg-indigo-800 border-indigo-500 focus:ring-indigo-400"
                  />
                </div>
              ) : (
                <p className="text-white text-2xl sm:text-4xl font-bold">
                  {rapp.rappName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              {isEditing ? (
                <div>
                  <Label
                    htmlFor="rappDes"
                    className="text-sm font-medium text-indigo-200"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="rappDes"
                    name="rappDes"
                    value={rapp.rappDes}
                    onChange={handleInputChange}
                    className="h-26 text-white bg-indigo-800 border-indigo-500 focus:ring-indigo-400"
                  />
                </div>
              ) : (
                <p className="text-gray-300 whitespace-normal break-words">
                  {rapp.rappDes}
                </p>
              )}
            </div>

            <div className="flex felx-row gap-2 sm:gap-4 items-center">
              <div className={`space-y-2 ${isEditing ? "w-1/3" : ""}`}>
                {isEditing ? (
                  <div className="w-full">
                    <Label
                      htmlFor="type"
                      className="text-sm font-medium text-indigo-200"
                    >
                      Type
                    </Label>
                    <Select
                      onValueChange={() => {}} // No-op to prevent changes
                      defaultValue={rapp.type}
                      disabled
                    >
                      <SelectTrigger className="w-full text-white bg-indigo-800 border-indigo-500">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="flex gap-2 items-center">
                    <p className="text-whiten w-fit bg-indigo-600 py-1 px-2 rounded-lg text-xs font-semibold">
                      <span>{rapp?.modelName?.toUpperCase()}</span>
                    </p>
                    <p className="text-whiten w-fit bg-indigo-600 py-1 px-2 rounded-lg text-xs font-semibold">
                      <span>{rapp?.type?.toUpperCase()}</span>
                    </p>
                  </div>
                )}
              </div>
              <div className={`space-y-2 ${isEditing ? "w-2/3" : ""}`}>
                {isEditing ? (
                  <div className="w-full">
                    <Label
                      htmlFor="cost"
                      className="text-sm font-medium text-indigo-200"
                    >
                      Cost
                    </Label>
                    <Input
                      id="cost"
                      type="number"
                      name="cost"
                      value={rapp.cost}
                      onChange={handleInputChange}
                      className="text-white bg-indigo-800 border-indigo-500 focus:ring-indigo-400"
                      min={0}
                    />
                  </div>
                ) : (
                  <p className="text-whiten w-fit bg-indigo-600 py-1 px-2 rounded-lg text-xs font-semibold">
                    ${rapp.cost}
                  </p>
                )}
              </div>
              {rapp.commission !== undefined && (
                <div className="space-y-2">
                  {isEditing ? (
                    <div>
                      <Label
                        htmlFor="commission"
                        className="text-sm font-medium text-indigo-200 flex items-center space-x-2"
                      >
                        <DollarSign className="h-4 w-4" />
                        <span>Commission</span>
                      </Label>
                      <Input
                        id="commission"
                        type="number"
                        name="commission"
                        value={rapp.commission}
                        onChange={handleInputChange}
                        className="text-white bg-indigo-800 border-indigo-500 focus:ring-indigo-400"
                        min={0}
                      />
                    </div>
                  ) : (
                    <p className="text-whiten w-fit bg-indigo-600 py-1 px-2 rounded-lg text-xs font-semibold">
                      ${rapp.commission}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              {isEditing ? (
                <div>
                  <Label
                    htmlFor="rappStatus"
                    className="text-sm font-medium text-indigo-200 flex items-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Status</span>
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("rappStatus", value)
                    }
                    defaultValue={rapp.rappStatus}
                  >
                    <SelectTrigger
                      id="rappStatus"
                      className="w-full text-white bg-indigo-800 border-indigo-500"
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="denied">Denied</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div
                  className={`text-xs sm:text-sm font-medium w-fit flex justify-start px-1 py-1 sm:px-2 sm:py-2 rounded-lg text-right sm:text-center ${
                    rapp.rappStatus === "approved"
                      ? "bg-white/[0.1] text-success"
                      : rapp.rappStatus === "pending"
                      ? "bg-white/[0.1] text-warning"
                      : "bg-white/[0.1] text-danger"
                  }`}
                >
                  {rapp.rappStatus === "approved" && (
                    <p className="flex flex-row gap-1 items-center">
                      <Icons.approved /> <span>Approved</span>
                    </p>
                  )}
                  {rapp.rappStatus === "pending" && (
                    <p className="flex flex-row gap-1 items-center">
                      <Icons.pending /> <span>Pending</span>
                    </p>
                  )}
                  {rapp.rappStatus === "denied" && (
                    <p className="flex flex-row gap-1 items-center">
                      <Icons.denied /> <span>Denied</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {loggedInUser?.role === "enterprise" && (
          <div className="flex-1 space-y-6">
            <div className="space-y-4">
              <UserAccessList
                users={rapp?.access?.map((accessItem: any) => ({
                  id: accessItem.userId.id,
                  email: accessItem.userId.email,
                }))}
                isEditMode={isEditing}
                access={rapp?.access}
                handleCheckboxChange={(
                  userId: string,
                  action: "read" | "update"
                ) => {
                  setSelectedUsers((prev) => ({
                    ...prev,
                    [userId]: {
                      ...prev[userId],
                      [action]: !prev[userId]?.[action],
                    },
                  }));
                }}
                setSelectedUsers={setSelectedUsers}
                selectedUsers={selectedUsers}
                handleAddMemberClick={handleAddMemberClick} // Pass the function down
                isEditing={isEditing} // Pass the editing state
              />
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center mt-20 md:mt-0">
          <div className="bg-indigo-700 p-4 md:p-6 m-4 rounded-md shadow-md w-[35rem] text-white relative">
            <div className="flex items-center gap-2 mb-4 ml-2">
              <CirclePlus />
              <h4 className="text-xl font-bold text-white">Add Permissions</h4>
            </div>
            {listLoading ? (
              <div className="flex justify-center items-center h-32 flex-col gap-2">
                <ClipLoader color="#ffffff" loading={listLoading} size={30} />
                <div>Loading</div>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="justify-center mx-auto mt-5 py-10 h-72 bg-indigo-900/[0.4] border-dashed border-2 border-muted-foreground rounded-lg flex items-center flex-col">
                <p className="text-gray-400">
                  There are no members available. Want to Onboard a new one?
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-2 right-2 px-2  bg-transparent text-white rounded-md hover:bg-indigo-800 border border-white"
                >
                  X
                </button>
                <Link href="/dashboard/onboard-user">
                  <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    Onboard Member
                  </button>
                </Link>
              </div>
            ) : (
              <>
                <ul className="h-72 overflow-y-scroll bg-indigo-800 px-3 py-2">
                  {filteredData.map((user: any, index) => (
                    <li
                      key={index}
                      className="flex justify-start md:justify-between items-start md:items-center flex-col md:flex-row space-y-2 px-2 py-2 border-b border-gray-400 opacity-80"
                    >
                      <span>{user?.email}</span>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2">
                          <Checkbox
                            checked={permissions[user.email]?.read || false}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(
                                user.email,
                                "read",
                                checked as boolean
                              )
                            }
                          />
                          <span>Read</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <Checkbox
                            checked={permissions[user.email]?.update || false}
                            onCheckedChange={(checked) =>
                              handlePermissionChange(
                                user.email,
                                "update",
                                checked as boolean
                              )
                            }
                          />
                          <span>Update</span>
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Saving..." : "Save"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
