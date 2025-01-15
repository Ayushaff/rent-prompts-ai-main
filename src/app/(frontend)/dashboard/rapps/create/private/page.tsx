import React from "react";
import Privaterapp from "@/components/PrivateRapp/PrivateRapp";
import { getUserRole } from "@/utilities/getSeverSideUserRole";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


const Private = () => {
  const nextCookies = cookies()
  const role = getUserRole(nextCookies)
  let createPermissions = false;

  if (!role || role === 'null') {
    redirect('/auth/signIn');
  }
  return (
    <>
      {role === 'enterprise' && <Privaterapp />}
      {role === 'member' && createPermissions && <Privaterapp/>}
      {role === 'member' && !createPermissions && <div className="text-2xl font-semibold text-center mt-20">You have not permission to create private rapps</div>}
    </>
  );
};

export default Private;
