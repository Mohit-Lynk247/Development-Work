import React, { useEffect } from "react";
import {
  User,
  Moon,
  Search,
  Settings,
  Sun,
  AlertCircleIcon,
  Bell,
  MailIcon,
  ArrowDownToLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ApiResponse,
  useGetAlertsCountQuery,
  useGetUsersCountQuery,
} from "@/store/api";
import { useTheme } from "next-themes";
import { ModeToggle } from "@/components/ModeToggle";
import { SheetDemo } from "@/components/SettingsSheet";

import { useDispatch } from "react-redux";
import { setAuthUser } from "@/store/authSlice";
import { useRouter, useSearchParams } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import Badge from "@mui/material/Badge";
import Link from "next/link";

const Navbar = () => {
  const { setTheme } = useTheme();
  const { data, isLoading, error } = useGetUsersCountQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (error) {
      console.log(error);
      const apiError = error as ApiResponse;

      if (Number(apiError.status) === 401) {
        dispatch(setAuthUser(null));
        router.push("/");
        toast.success("Session Timeout, Please log in again!");
      }
    }
  }, [error, dispatch, router]);

  const userEmail = useSearchParams().get("email");

  const { data: alertCountData } = useGetAlertsCountQuery(
    { email: userEmail! },
    { refetchOnMountOrArgChange: true }
  );
  sessionStorage.setItem("userRoles", alertCountData?.roles || "");

  return (
    <div className="flex items-center   gap-4   px-5">
      {/* bell  icons */}

      <Link href={`/alerts?email=${userEmail}`} className="common-iconbtn">
        <Badge
          color="error"
          badgeContent={Number(alertCountData?.count)}
          max={9}
        >
          <Bell size={20} className="text-iconcolor" />
        </Badge>
      </Link>

      {/* btn for fownload  */}

      <Button
        className="commonbtn"
        onClick={() => {
          window.location.href =
            "https://github.com/OptimizeInnnovations/Lynk247Updater/releases/download/LynkInstall/Lynk247.exe";
        }}
      >
        <ArrowDownToLine />
        Lynk 247
      </Button>

      {/* user profile section  */}
      <div className="flex    items-center  gap-1 ">
        <User size={20} className="text-iconcolor  " />
        <div className=" mt-1 text-sm">
          {data?.availableUsers} / {data?.totalUsers}
        </div>
      </div>

      <div className="ml-2 mr-5 hidden min-h-[2em] w-[0.1rem]  bg-gray-200 md:inline-block"></div>

      {/* <ModeToggle /> */}

      <SheetDemo />
    </div>
  );
};

export default Navbar;
