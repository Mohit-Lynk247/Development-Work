"use client";

import React from "react";
import ProjectsHeader from "./ProjectsHeader";
import ProjectsTable from "./ProjectsTable";
import { useSearchParams } from "next/navigation";

const page = () => {
  const userEmail = useSearchParams().get("email");
  localStorage.removeItem("persist:root");

  return (
    <div className="w-full sm:flex-row space-y-0 aspect-auto">
      <ProjectsHeader name="Projects" buttonName="Create New Project" />

      <div className="flex  h-full overflow-hidden">
        <ProjectsTable email={userEmail!} closedProjectFlag={false} />
      </div>
    </div>
  );
};

export default page;
