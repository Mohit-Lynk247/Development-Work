import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { Button } from "@mui/material";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SubTask } from "@/store/interfaces";
import SubTaskPage from "./SubTaskPage";
import { useTheme } from "next-themes";
import ViewButton from "@/components/customButton/viewButton";

type Props = {
  subTasks: SubTask[];
  email: string;
  projectId: string;
};

const SubTaskTable = ({ subTasks, email, projectId }: Props) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: "Title",
      flex: 1,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        let bgColor, textColor;
        switch (params.value) {
          case "To Do":
            bgColor = "#2563EB";
            textColor = "#ffffff";
            break;
          case "Work In Progress":
            bgColor = "#059669";
            textColor = "#ffffff";
            break;
          case "Under Review":
            bgColor = "#D97706";
            textColor = "#ffffff";
            break;
          case "Completed":
            bgColor = "#000000";
            textColor = "#ffffff";
            break;
          default:
            bgColor = "#E5E7EB";
            textColor = "#000000";
        }

        return (
          <span
            className="inline-flex rounded-full px-2 text-xs font-semibold leading-5"
            style={{ backgroundColor: bgColor, color: textColor }}
          >
            {params.value}
          </span>
        );
      },
    },
    {
      field: "startDate",
      headerName: "Start Date",
      flex: 1,
      renderCell: (params) => {
        return formatDate(params.value);
      },
    },
    {
      field: "dueDate",
      headerName: "Due Date",
      flex: 1,
      renderCell: (params) => {
        return formatDate(params.value);
      },
    },
    {
      field: "consumedTime",
      headerName: "Consumed Time",
      flex: 1,
    },
    {
      field: "author",
      headerName: "Author",
      flex: 1,
      renderCell: (params) => params.value.username || "Unknown",
    },
    {
      field: "assignee",
      headerName: "Assignee",
      flex: 1,
      renderCell: (params) => params.value.username || "Unassigned",
    },
    {
      field: "id",
      headerName: "",
      flex: 1,
      renderCell: (params) => {
        return (
          <div className="flex justify-center items-center h-full">
            <Dialog>
              <div className="my-3 flex justify-between">
                <DialogTrigger asChild>
                  <ViewButton text={"View Details"} />
                </DialogTrigger>
              </div>
              <DialogContent className="max-w-[85vw] ">
                <DialogHeader>
                  <DialogTitle className="hidden">Edit profile</DialogTitle>
                </DialogHeader>
                <SubTaskPage
                  subTaskId={params.value}
                  email={email}
                  projectId={projectId}
                />
              </DialogContent>
            </Dialog>
          </div>
        );
      },
    },
  ];

  const { theme } = useTheme();

  let isDarkMode = theme === "dark";

  return (
    // <div className="h-540px w-full ">
    <DataGrid
      rows={subTasks || []}
      columns={columns}
      className={dataGridClassNames}
      sx={dataGridSxStyles(isDarkMode)}
    />
    // </div>
  );
};

export default SubTaskTable;
