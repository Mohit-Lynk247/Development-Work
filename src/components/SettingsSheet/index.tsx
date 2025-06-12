import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import * as React from "react";
import { Popover, PopoverContent } from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FileX2, Settings, Upload } from "lucide-react";
import { useGetUserQuery, useUpdateProfilePictureMutation } from "@/store/api";
import { useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "../Sidebar/nav-user";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export function SheetDemo() {
  const userEmail = useSearchParams().get("email");
  const { data, isLoading, error } = useGetUserQuery({ email: userEmail! });
  const [open, setOpen] = useState(false);
  const defaultUser = {
    name: "XXXX",
    email: "XXX@XXX.XXX",
    avatar: "",
  };

  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [updateProfilePic] = useUpdateProfilePictureMutation();
  const dispatch = useDispatch();
  const router = useRouter();
  const removeProfilePicture = async () => {
    try {
      const response = await updateProfilePic({
        email: userEmail!,
        base64: "",
      });

      if (
        // @ts-ignore
        response.error?.data.status === "Error" ||
        // @ts-ignore
        response.error?.data.status === "Fail"
      ) {
        // @ts-ignore
        toast.error(response.error?.data.message);
      } else {
        toast.success(response.data?.message!);
      }
    } catch (error) {
      toast.error("Some Error occurred");
      console.log(error);
    }
    // setOpen(false);
  };
  const handleImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]; // Get the selected file
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        if (typeof reader.result === "string") {
          try {
            const response = await updateProfilePic({
              email: userEmail!,
              base64: reader.result!,
            });
            if (
              // @ts-ignore
              response.error?.data.status === "Error" ||
              // @ts-ignore
              response.error?.data.status === "Fail"
            ) {
              // @ts-ignore
              toast.error(response.error?.data.message);
            } else {
              toast.success(response.data?.message!);
              setBase64Image(reader.result);
            }
          } catch (err) {
            toast.error("Some Error occurred");
            console.log(err);
          }
        }
      };
      reader.readAsDataURL(file); // Read the file as base64
      setOpen(false);
    }
  };

  const user = data?.user || defaultUser;
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className={"common-iconbtn "}>
          <Settings size={20} className="text-iconcolor" />
        </button>
      </SheetTrigger>
      <SheetContent className="space-y-4">
        <SheetHeader className="leading-tight">
          <SheetTitle className="text-maintext">Settings</SheetTitle>
          <SheetDescription className="text-secondarytext text-sm">
            Make changes to your profile picture here.
          </SheetDescription>
        </SheetHeader>
        <div className="flex items-center  gap-5 border-y-[1.5px]  border-gray-200  p-3 ">
          {/* Hidden file input */}
          <input
            type="file"
            id="fileInput"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />

          <div className="flex flex-col  items-center  w-full gap-2  justify-center">
            <Popover open={open} onOpenChange={setOpen}>
              {/* <PopoverTrigger> */}
              <button className="cursor-pointer">
                <Avatar className="h-20 w-20 rounded-full justify-center items-center">
                  <AvatarImage
                    src={base64Image || user.avatar}
                    alt={user.name}
                  />
                  <AvatarFallback className="rounded-lg text-4xl bg-mainbtn/40 text-white">
                    {getInitials(user.name!)}
                  </AvatarFallback>
                </Avatar>
              </button>
              {/* </PopoverTrigger> */}
              <PopoverContent
                className="flex flex-col p-2 rounded-lg shadow-lg bg-white min-w-[200px]"
                style={{ zIndex: 1000 }}
              >
                <button
                  className="flex items-center justify-start w-full p-3 rounded-md hover:bg-gray-200 focus:outline-none transition duration-200"
                  onClick={() => document.getElementById("fileInput")?.click()}
                >
                  <Typography className="text-primary">
                    Change Profile Picture
                  </Typography>
                </button>
              </PopoverContent>
            </Popover>

            <div className="leading-tight text-center">
              <h3 className="text-maintext   ">{user.name}</h3>

              <p className="text-secondarytext text-sm ">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-5 justify-center  px-5">
          <Button
            className="hover:bg-mainbtn bg-secondarybtn hover:text-white text-maintext"
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <Upload size={20} />
            edit photo
          </Button>
          {/* Remove Picture Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="bg-red-500/30 text-maintext hover:bg-red-500 hover:text-white ">
                <FileX2 size={20} />
                Remove
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-700">
                  Do you want to remove your profile picture ?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  No
                </AlertDialogCancel>
                <AlertDialogAction onClick={removeProfilePicture}>
                  Yes
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* <DialogDemo />
        <CreateRole/> */}
      </SheetContent>
    </Sheet>
  );
}
