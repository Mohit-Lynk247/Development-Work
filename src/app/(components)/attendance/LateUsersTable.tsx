"use client";

import React, { JSX, useEffect, useState } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import {
  useGetAttendanceCustomTableDataQuery,
  useGetUserAttendanceTableDataQuery,
} from "@/store/api";
import { useTheme } from "next-themes";
import { Button, Chip, CircularProgress } from "@mui/material";
import TimesheetHeader from "../timesheet/TimesheetHeader";
import { CheckCircleIcon, CircleX, History } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/components/Sidebar/nav-user";
import AttendanceTable from "../attendanceOld/AttendanceTable";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomTableResponse } from "@/store/interfaces";
type Props = {
  email: string;
  adminFlag: boolean;
  lateFlag: boolean;
  fromDate: string;
  toDate: string;
  teamId: number;
};

interface RowData {
  id: number;
  date: string;
  consumedHours: string;
  userId: number;
  username: string;
  projectId?: number;
}

const HighlightedUsersTable = ({
  email,
  adminFlag,
  lateFlag,
  fromDate,
  toDate,
  teamId,
}: Props) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data, isLoading, error } = useGetAttendanceCustomTableDataQuery(
    {
      email: email,
      fromDate: fromDate,
      toDate: toDate,
      teamId: teamId,
      lateFlag: lateFlag,
    },
    { refetchOnMountOrArgChange: true }
  );

  const { theme } = useTheme();

  let isDarkMode = theme === "dark";

  const userRolesList = sessionStorage.getItem("userRoles");

  let adminPageFlag: boolean = false;

  if (
    userRolesList !== undefined &&
    userRolesList !== null &&
    userRolesList !== ""
  ) {
    // Define the function to check if 'ADMIN' is in the list
    const containsValue = (csvString: string, value: string): boolean => {
      // Split the string by commas to get an array of values
      const valuesArray = csvString.split(",");
      // Check if the value exists in the array
      return valuesArray.includes(value);
    };

    // Call containsValue function to set Admin
    adminPageFlag = containsValue(userRolesList, "ADMIN");
  } else {
    console.log("userRolesList is undefined or empty");
  }

  const columns: GridColDef[] = [
    ...(adminFlag
      ? [
          // {
          //   field: "image",
          //   headerName: "",
          //   flex: 0.5,
          //   renderCell: (params: any) => {
          //     const rowData = params.row;

          //     return (
          //       <Avatar className="h-[40px] mt-1 w-[40px] rounded-full justify-center items-center">
          //         <AvatarImage
          //           src={rowData.image}
          //           alt={rowData.username}
          //           loading="lazy"
          //         />
          //         <AvatarFallback className="absolute inset-0 flex justify-center items-center text-[150%]">
          //           {getInitials(rowData.username!)}
          //         </AvatarFallback>
          //       </Avatar>
          //     );
          //   },
          // },
          { field: "username", headerName: "User Name", flex: 1 },
        ]
      : []),
    {
      field: "userStatus",
      headerName: "User Status",
      flex: 1,
      renderCell: (params) => {
        const status = params.value;

        let icon;
        let text;

        if (status === "active") {
          icon = <CheckCircleIcon style={{ color: "green" }} />;
          text = "Active";
        } else if (status === "inactive") {
          icon = <History style={{ color: "orange" }} />;
          text = "On a Break";
        } else {
          icon = <CircleX style={{ color: "gray" }} />;
          text = "Offline";
        }

        // then use it like:
        <Chip icon={icon} label={status} />;

        return (
          <Chip
            variant="outlined"
            color={status === "active" ? "success" : "default"}
            icon={icon}
            label={text}
            size="small"
            sx={{ gap: "2px", border: "none" }}
          />
        );
      },
    },
    ...(lateFlag
      ? [
          {
            field: "lateCount",
            headerName: "Late Count",
            flex: 1,
          },
        ]
      : [
          {
            field: "onTimeCount",
            headerName: "On-Time Count",
            flex: 1,
          },
        ]),

    {
      field: "avgWorkingTime",
      headerName: "Avg Working Time",
      flex: 1,
    },
    {
      field: "avgActiveTime",
      headerName: "Avg Active Time",
      flex: 1,
    },
  ];

  const [paginationModel, setPaginationModel] = React.useState({
    page: 0, // Initial page
    pageSize: 10, // Default rows per page
  });

  const handlePaginationChange = (
    model: {
      page: number;
      pageSize: number;
    },
    click: String
  ) => {
    setPaginationModel(model);
  };

  //  new functionality for user table
  // type desclaration for usestate

  // state for user data according to pagination
  const [usersdata, setusersdata] = useState<CustomTableResponse[]>([]);
  //  switch statement for status
  const Getstatus = (statusValue: String): JSX.Element => {
    let icon;
    let text;

    if (statusValue === "active") {
      icon = <CheckCircleIcon style={{ color: "green" }} />;
      text = "Active";
    } else if (statusValue === "inactive") {
      icon = <History style={{ color: "orange" }} />;
      text = "On a Break";
    } else {
      icon = <CircleX style={{ color: "gray" }} />;
      text = "Offline";
    }

    // then use it like:
    <Chip icon={icon} label={statusValue} />;

    return (
      <Chip
        variant="outlined"
        color={status === "active" ? "success" : "default"}
        icon={icon}
        label={text}
        size="small"
        sx={{ gap: "2px", border: "none" }}
      />
    );
  };
  // function  page pagination
  const HanldePaginationChnage = (value: String) => {
    if (
      value == "left" &&
      paginationModel?.page <= 10 &&
      paginationModel?.page > 0
    ) {
      console.log("clicking left");
      setPaginationModel({
        ...paginationModel,
        page: paginationModel?.page - 1,
      });
    } else if (
      value == "right" &&
      paginationModel?.page >= 0 &&
      paginationModel?.page < 10
    ) {
      console.log("clicking rigth");
      setPaginationModel({
        ...paginationModel,
        page: paginationModel?.page + 1,
      });
    }
  };
  console.log(data, "this is table data ");

  // adding useEffect for  getting page no
  useEffect(() => {
    if (data) {
      const pageno = data?.length / 10;

      setPaginationModel({
        ...paginationModel,
        pageSize: parseInt(`${pageno}`),
      });
      const newdata = data?.slice(0, 10);
      setusersdata(newdata);
    }
  }, [data]);

  useEffect(() => {
    if (paginationModel?.page) {
      let start = paginationModel?.page * 10;
      let end = (paginationModel?.page + 1) * 10;
      const newdata = data?.slice(start, end);
      console.log(newdata, "new data after pagination");
    }
  }, [paginationModel]);

  // useEffect(() => {
  //   if (data) {
  //     setusersdata(data);
  //   }
  // }, [data]);
  return (
    <div className="h-full w-full  ">
      {/* <DataGrid
        rows={data || []}
        columns={columns}
        className={dataGridClassNames}
        pagination
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationChange}
        sx={dataGridSxStyles(isDarkMode)}
      /> */}

      {usersdata && usersdata?.length > 0 ? (
        <>
          <Table>
            {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
            <TableHeader className="bg-[#e9ecef] rounded-lg">
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>User Status</TableHead>
                <TableHead>Late Count</TableHead>
                <TableHead>Avg Working Time</TableHead>
                <TableHead>Avg Active Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <>
                {data?.map(
                  (
                    {
                      username,
                      avgActiveTime,
                      avgWorkingTime,
                      lateCount,
                      onTimeCount,
                      userStatus,
                    },
                    ind
                  ) => (
                    <TableRow className="hover:bg-bgprimary" key={ind}>
                      <TableCell>{username}</TableCell>
                      <TableCell>{Getstatus(userStatus)}</TableCell>
                      <TableCell>
                        {lateCount ? lateCount : onTimeCount}
                      </TableCell>
                      <TableCell>{avgWorkingTime}</TableCell>
                      <TableCell>{avgActiveTime}</TableCell>
                    </TableRow>
                  )
                )}
              </>
            </TableBody>
          </Table>

          {paginationModel?.pageSize !== 0 && (
            <Pagination className=" flex items-center justify-end">
              <PaginationContent>
                <PaginationItem onClick={() => HanldePaginationChnage("left")}>
                  <PaginationPrevious className="text-iconcolor" />
                </PaginationItem>
                <PaginationItem>
                  {paginationModel?.page}
                  <span>/{paginationModel?.pageSize}</span>
                </PaginationItem>

                <PaginationItem onClick={() => HanldePaginationChnage("right")}>
                  <PaginationNext className="text-iconcolor" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center  h-24">
          <h1 className="text-secondarytext text-sm">No data Found</h1>
        </div>
      )}
    </div>
  );
};

export default HighlightedUsersTable;
