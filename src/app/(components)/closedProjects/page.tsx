"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import ProjectsHeader from "../projectsDashboard/ProjectsHeader";
import ProjectsTable from "../projectsDashboard/ProjectsTable";

const page = () => {
  const userEmail = useSearchParams().get("email");
  localStorage.removeItem("persist:root");

  return (
    <div className="w-full sm:flex-row space-y-0 mt-8 bg-bgsecondary p-2  rounded-lg aspect-auto">
      <ProjectsHeader name="Closed Projects" buttonName="" />

      <ProjectsTable email={userEmail!} closedProjectFlag={true} />
    </div>
  );
};

export default page;
