import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, PlusSquare } from "lucide-react";
import { useCreateSprintMutation } from "@/store/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  name: string;
  isSmallText?: boolean;
  buttonName: string;
  email: string;
  projectId: number;
};

const ProjectSectionHeader = ({
  name,
  isSmallText = false,
  buttonName,
  email,
  projectId,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [createSprint, { isLoading: isLoadingCreateSprint }] =
    useCreateSprintMutation();

  const isFormValid = () => {
    return title && description && startDate && endDate;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const formData = {
      title: title,
      description: description,
      startDate: startDate,
      endDate: endDate,
      email: email,
      projectId: Number(projectId),
    };
    try {
      const response = await createSprint(formData);
      // @ts-ignore
      if (response.error?.data.status === "Fail") {
        // @ts-ignore
        toast.error(response.error?.data.message);
      } else {
        toast.success(response.data?.message!);
      }
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.data.message.message);
      console.error("Error creating sprint:", err.data.Message);
    }
  };

  return (
    <div className="flex relative w-full  items-center justify-between">
      <h1
        className={`${
          isSmallText ? "text-lg" : "text-2xl"
        } font-semibold dark:text-white text-maintext gap-2 flex items-center`}
      >
        <button onClick={() => window.history.back()}>
          <ChevronLeft className="text-iconcolor" />
        </button>
        {name}
      </h1>
      <div className="flex items-center space-x-4 mr-5 overflow-auto">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="commonbtn flex items-center gap-2">
              <PlusSquare size={20} />
              {buttonName}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl overflow-auto">
            <DialogHeader>
              <DialogTitle className="">Create Sprint</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-3">
                <div className="space-y-1">
                  <Label className="text-center  after:pl-1 after:content-['*'] after:text-red-500">
                    Sprint Title
                  </Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Enter your title"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-center  after:pl-1 after:content-['*'] after:text-red-500">
                    Description
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter your description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-center  after:pl-1 after:content-['*'] after:text-red-500">
                      Start Date
                    </Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-center  after:pl-1 after:content-['*'] after:text-red-500">
                      End Date
                    </Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-4">
                <Button
                  type="submit"
                  className={` commonbtn ${
                    !isFormValid() || isLoadingCreateSprint
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }`}
                  disabled={!isFormValid() || isLoadingCreateSprint}
                >
                  {isLoadingCreateSprint ? "Creating..." : "Create Sprint"}
                </Button>
              </DialogFooter>
            </form>

            <DialogFooter className="w-full justify-between items-center">
              <div className="absolute flex gap-4 left-10"></div>
              <div className="flex items-center space-x-2"></div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProjectSectionHeader;
