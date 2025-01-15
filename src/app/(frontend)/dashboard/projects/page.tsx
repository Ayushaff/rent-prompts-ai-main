import MemberProductList from "@/components/ui/Project/MemberProjectList";
import ProductList from "@/components/ui/Project/ProjectListing";
import { getUserRole } from "@/utilities/getSeverSideUserRole";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";


const Projects: React.FC = () => {
  const nextCookies = cookies()
  const role = getUserRole(nextCookies)

  if(role == 'null' || !role){
    redirect('/auth/signIn')
  }

  return (
    <div className="p-4 flex flex-col gap-4 bg-indigo-800 shadow-2xl">
      
      {role === 'enterprise' && <ProductList />}
      {role === 'member' && <MemberProductList />}

    </div>
  );
};

export default Projects;
