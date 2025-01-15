"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { FaTwitter, FaGithub, FaLinkedin } from "react-icons/fa";
import { MdLocationOn, MdEdit } from "react-icons/md";
import { ClipLoader } from "react-spinners";
import { toast } from "sonner";
import ApiKeyFetch from "@/components/ui/Profile/ApiKeyFetch";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from '@/providers/User'
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  position: string;
  team: string;
  balance: number;
  location: string;
  profileImage: string;
  ownedRAPPs: { name: string; revenue: number }[];
  managedRAPPs: { name: string; revenue: number }[];
}

interface Rapp {
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
  slug: string;
}

const UserProfile = () => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [rappData, setRappData] = useState<Rapp[]>([]);
  const [ownedRapps, setOwnedRapps] = useState<Rapp[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<User | null>(null);
  const user = useUser() as User | null;
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      return router.push("/auth/signIn");
      }
    if (user) {
      setUserData(user);
      setEditedData(user);
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/api/privateRapps/getRapps`
        );
        const data = await res.json();
        setRappData(data.data.myRapps);
        setOwnedRapps(data.data.accessRapps);
      } catch (err) {
        setError("Failed to load RAPPs data");
        toast.error(err)
      } finally{
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editedData) {
      setEditedData({ ...editedData, [name]: value });
    }
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const req = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/${userData?.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editedData?.name,
            email: editedData?.email,
          }),
        }
      );
      toast.success("User Info Updated");
      setUserData(editedData);
      setIsEditing(false);
    } catch (err) {
      setError("Failed to save changes");
      toast.error(err)
    } finally {
      setLoading(false);
    }
  };

  const totalCost = ownedRapps.reduce((sum, rapp) => sum + rapp.cost, 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <ClipLoader color="#ffffff" loading={loading} size={50} />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  return (
    <div className="mx-auto bg-indigo-800 md:shadow-xl rounded-lg text-white relative">
      {/* Profile header */}
      <div
        className={`relative z-10 mt-4 bg-gradient-to-br from-black/[0.3] via-black/[0.1] to-black/[0.4] p-5 flex flex-col md:flex-row items-start gap-6 w-full rounded-xl ${
          isEditing && "pt-12"
        }`}
      >

        <div className="w-full">
          {isEditing ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div>
              <Label>Name:</Label>
              <Input
                type="text"
                name="name"
                value={editedData?.name || "dummy user"}
                onChange={handleInputChange}
                className="bg-indigo-700 text-white rounded-md px-3 py-1 w-full"
              />
              </div>
              <div>
              <Label>Email:</Label>
              <Input
                type="text"
                name="email"
                value={editedData?.email || ""}
                onChange={handleInputChange}
                className="bg-indigo-700 text-white rounded-md px-3 py-1 w-full"
              />
              </div>
              <div>
              <Label>Designation:</Label>
              <Input
                type="text"
                name="position"
                value={editedData?.position || ""}
                onChange={handleInputChange}
                className="bg-indigo-700 text-white rounded-md px-3 py-1 w-full"
              />
              </div>
              <div>
              <Label>Location:</Label>
              <Input
                type="text"
                name="location"
                value={editedData?.location || ""}
                onChange={handleInputChange}
                className="bg-indigo-700 text-white rounded-md px-3 py-1 w-full"
              />
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-5">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-indigo-500 shadow-lg">
          <Image
            src={userData?.profileImage || "/DummyRapps.png"}
            alt="User Profile Picture"
            width={144}
            height={144}
            className="object-cover w-full h-full"
          />
        </div>
              <div>
              <h1 className="text-3xl font-bold mb-1">
                {userData?.name || "Dummy User"}
              </h1>
              <p className="text-gray-300">{userData?.email}</p>
              <p className="mt-2 text-gray-400">
                {userData?.position || "Software Developer"}
              </p>
              <p className="mt-1 text-sm text-gray-400 flex items-center">
                <MdLocationOn className="mr-2" />{" "}
                {userData?.location || "Indore"}
              </p>
              <div className="flex gap-3 items-center">
              <ApiKeyFetch />
              <p className="text-gray-300 font-bold text-lg">Balance: {userData?.balance}</p>
              </div>
              </div>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="absolute top-4 right-4">
            <button
              onClick={handleSaveChanges}
              className="bg-green-500 hover:bg-green-600 text-sm text-white py-2 px-3 rounded-md"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <button
            onClick={handleEditToggle}
            className="absolute top-4 right-4 p-2 rounded-full bg-indigo-700 hover:bg-indigo-600 text-white"
          >
            <MdEdit className="text-2xl" />
          </button>
        )}
      </div>

      {/* Owned and Managed RAPPs */}
      <div className="relative z-10 md:p-6">
        <h2 className="text-2xl font-semibold mt-4 p-4">Owned RAPPs</h2>
        {rappData?.length === 0 ? (
          <p className="text-gray-400">No self-owned RAPPs available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-6">
            {rappData?.map((rapp, index) => (
              <Link
                href={`/dashboard/projects/${rapp?.slug}`}
                key={index}
                className="p-4 bg-gradient-to-br from-black/[0.3] via-black/[0.1] to-black/[0.4] rounded-lg shadow hover:shadow-lg transition"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold mb-2">
                    {rapp.rappName}
                  </h3>
                  <p className="text-sm text-gray-300">
                    {rapp.rappStatus === "approved" ? (
                      <span className="text-green-500">{rapp.rappStatus}</span>
                    ) : (
                      <span>{rapp.rappStatus}</span>
                    )}
                  </p>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-300">
                  <p className="break-words whitespace-normal line-clamp-1">{rapp.rappDes}</p>
                  <p>Cost: {rapp.cost}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Enterprise Consumption */}
      <div className="relative z-10 mt-7 p-4 md:p-6">
        <h2 className="text-2xl font-semibold mb-4">Shared RAPPs</h2>
        {ownedRapps?.length === 0 ? (
          <p className="text-gray-400">
            No enterprise consumption data available.
          </p>
        ) : (
          <>
            <p className="text-lg mb-6 font-semibold">Total Consumed: {totalCost}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {ownedRapps?.map((rapp, index) => (
              <Link
                href={`/dashboard/projects/${rapp?.slug}`}
                key={index}
                className="p-4 bg-indigo-800 rounded-lg shadow hover:shadow-lg transition"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold mb-2">
                    {rapp.rappName}
                  </h3>
                  <p className="text-sm text-gray-300">
                    {rapp.rappStatus === "approved" ? (
                      <span className="text-green-500">{rapp.rappStatus}</span>
                    ) : (
                      <span>{rapp.rappStatus}</span>
                    )}
                  </p>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-300">
                  <p>{rapp.rappDes}</p>
                  <p>Cost: {rapp.cost}</p>
                </div>
              </Link>
            ))}
          </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
