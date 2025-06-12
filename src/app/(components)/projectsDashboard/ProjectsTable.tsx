"use client";

import Header from "@/components/Header";

import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";
import { useGetProjectsQuery } from "@/store/api";
import { Eye, View } from "lucide-react";
import ViewButton from "@/components/customButton/viewButton";

type Props = {
  email: string;
  closedProjectFlag: boolean;
};

const ProjectsTable = ({ email, closedProjectFlag }: Props) => {
  localStorage.removeItem("persist:root");

  const { data, isLoading, error } = useGetProjectsQuery(
    { email: email, closedFlag: closedProjectFlag },
    { refetchOnMountOrArgChange: true }
  );

  const { theme } = useTheme();

  let isDarkMode = theme === "dark";

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Project Name",
      flex: 1,
      renderCell: (params) => (
        <Link
          href={`project/${params.row.id}?email=${email}`}
          rel="noopener noreferrer"
          className="text-blue-500 dark:text-white underline font-medium"
          style={{ fontWeight: 500 }}
          onClick={() => {
            sessionStorage.setItem("projectId", params.row.id);
          }}
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: "clientName",
      headerName: "Client Name",
      flex: 1,
    },
    {
      field: "description",
      headerName: "Project Description",
      flex: 1.5,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
    },
    {
      field: "startDate",
      headerName: "Start Date",
      flex: 1,
      valueFormatter: (params) => {
        const date = new Date(params);
        return date.toISOString().split("T")[0];
      },
    },
    {
      field: "endDate",
      headerName: "Due Date",
      flex: 1,
      valueFormatter: (params) => {
        const date = new Date(params);
        return date.toISOString().split("T")[0];
      },
    },
    {
      field: "projectManager",
      headerName: "Project Manager",
      flex: 1,
    },
    {
      field: "completionStatus",
      headerName: "Completion Status",
      flex: 1.6,
      renderCell: (params) => {
        const completion = params.value || 0;
        const completionPercentage = Math.min(Math.max(completion, 0), 100);
        return (
          <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
            <div
              style={{
                backgroundColor: "#e0e0e0",
                borderRadius: "5px",
                height: "10px",
                width: "80%",
                marginRight: "5px",
              }}
            >
              <div
                style={{
                  backgroundColor: "green",
                  width: `${completionPercentage}%`,
                  height: "100%",
                  borderRadius: "5px 0 0 5px",
                }}
              />
            </div>
            <span>{completionPercentage}%</span>
          </div>
        );
      },
    },
    {
      field: "id",
      headerName: "",
      width: 150,
      renderCell: (params) => {
        return (
          <Link
            className=" w-full  flex items-center justify-center h-full"
            href={`/projectsDashboard/${params.value}?email=${email}`}
          >
            <ViewButton
              text={"View Detail"}
              onClick={() => {
                sessionStorage.setItem("projectName", params.row.name);
                sessionStorage.setItem("projectId", params.row.id);
              }}
            />
          </Link>
        );
      },
    },
  ];

  return (
    <>
      
      {/* <Header name="Table" isSmallText /> */}

   
      <DataGrid
        rows={data || []}
        columns={columns}
        className={dataGridClassNames}
        sx={dataGridSxStyles(isDarkMode)}
      />
    
    </>
  );
};

export default ProjectsTable;
