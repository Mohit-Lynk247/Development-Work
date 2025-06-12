"use client";

import React from "react";
import ProjectsHeader from "./ProjectsHeader";
import ProjectsTable from "./ProjectsTable";
import { useSearchParams } from "next/navigation";

const page = () => {
  const userEmail = useSearchParams().get("email");
  localStorage.removeItem("persist:root");

  return (
    <div className="w-full mt-8 sm:flex-row space-y-0 bg-bgsecondary  p-2 rounded-lg aspect-auto">
      <ProjectsHeader name="Projects" buttonName="Create New Project" />
      <ProjectsTable email={userEmail!} closedProjectFlag={false} />
    </div>
  );
};

export default page;
