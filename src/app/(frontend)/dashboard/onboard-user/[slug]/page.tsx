'use client'
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa';
import { MdLocationOn } from 'react-icons/md';
import { ClipLoader } from 'react-spinners';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/providers/User';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  position: string;
  team: string;
  location: string;
  profileImage: string;
  associateWith: string;
  socialLinks: {
    twitter: string;
    github: string;
    linkedin: string;
  };
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
  }

const UserProfile = ({params}) => {
  const user = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserDetail | null>(null);
  const [rappData, setRappData] = useState<Rapp[]>([]);
  const [sharedRapps, setSharedRapps] = useState<Rapp[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { slug } = params;
  const decodedSlug = decodeURIComponent(slug);


  useEffect(() => {
    if (!user) {
      return router.push("/auth/signIn");
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);

        // First API call to fetch user data
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/getPublicData`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ slug: decodedSlug }),
        });

        const userResult = await userResponse.json();
        const userId = userResult.data?.id; // Extract the userId

        setUserData(userResult.data);

        if (userId) {
          // Second API call to fetch RAPPs data using the userId
          const rappResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/privateRapps/getMemberRapps`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({ id: userId }),
          });

          const result = await rappResponse.json();
          setRappData(result.data?.myRapps);
          setSharedRapps(result.data?.accessRapps);
        } else {
          setError('Failed to retrieve user ID for fetching RAPPs data');
        }
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [decodedSlug, user]);


  const totalCost = sharedRapps.reduce((sum, rapp) => sum + rapp.cost, 0);

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
    <div className="mt-10 mx-auto p-6 sm:p-10 bg-indigo-800 to-indigo-950 shadow-xl rounded-lg text-white relative">
      {/* Profile header */}
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-indigo-500 shadow-lg">
          <Image
            src='/DummyRapps.png'
            alt="User Profile Picture"
            width={144}
            height={144}
            className="object-cover w-full h-full"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-1">{userData?.name || 'Public profile name'}</h1>
          <p className="text-gray-300">{userData?.email}</p>
          <p className="mt-2 text-gray-400">{userData?.position || 'Software Developer'}</p>
          <p className="mt-2 text-gray-400">Associate with: {userData?.associateWith || ''}</p>
          <p className="mt-2 text-gray-400">Shared Rapps: {sharedRapps?.length || '0'}</p>
          {/* <p className="mt-1 text-sm text-gray-400 flex items-center">
            <MdLocationOn className="mr-2" /> {userData?.location || 'Indore'}
          </p> */}
        </div>
      </div>

      {/* Owned and Managed RAPPs */}
      <div className="relative z-10 mt-10">
        <div className='flex items-center justify-between mb-4'>
          <h2 className="text-2xl font-semibold">Owned RAPPs</h2>
          <p className="text-lg font-normal text-gray-400">Total: {rappData.length}</p>
        </div>
        {rappData?.length === 0 ? (
          <p className="text-gray-400">No self-owned RAPPs available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {rappData?.map((rapp, index) => (
              <div
                key={index}
                className="p-4 bg-indigo-800 rounded-lg shadow hover:shadow-lg transition"
              >
                <div className='flex justify-between items-center'>
                <h3 className="text-lg font-semibold mb-2">{rapp.rappName}</h3>
                <p className='text-sm text-gray-300'>{rapp.rappStatus === 'approved' ? <span className='text-green-500'>{rapp.rappStatus}</span> : <span>{rapp.rappStatus}</span>}</p>
                </div>

                <div className='flex justify-between items-center text-sm text-gray-300'>
                <p className="text-sm text-gray-300">{rapp.rappDes}</p>
                <p>Cost: {rapp.cost}</p>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enterprise Consumption */}
      <div className="relative z-10 mt-10">
        <div className='flex items-center justify-between mb-4'>
          <h2 className="text-2xl font-semibold">Shared RAPPs</h2>
          <p className="text-lg font-normal text-gray-400">Total: {sharedRapps?.length}</p>
        </div>
        {sharedRapps?.length === 0 ? (
          <p className="text-gray-400">No enterprise rapps data available.</p>
        ) : (
          <>
            <p className="text-xl mb-6">
              Total Consumed: {totalCost}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {sharedRapps?.map((rapp, index) => (
              <div
                key={index}
                className="p-4 bg-indigo-800 rounded-lg shadow hover:shadow-lg transition"
              >
                <div className='flex justify-between items-center'>
                <h3 className="text-lg font-semibold mb-2">{rapp.rappName}</h3>
                <p className='text-sm text-gray-300'>{rapp.rappStatus === 'approved' ? <span className='text-green-500'>{rapp.rappStatus}</span> : <span>{rapp.rappStatus}</span>}</p>
                </div>

                <div className='flex justify-between items-center text-sm text-gray-300'>
                <p className="text-sm text-gray-300">{rapp.rappDes}</p>
                <p>Cost: {rapp.cost}</p>
                </div>

              </div>
            ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
