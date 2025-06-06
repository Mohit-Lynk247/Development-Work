import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusSquare, PresentationIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateProjectMutation,
  useGetProjectManagerQuery,
} from "@/store/api";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type Props = {
  name: string;
  isSmallText?: boolean;
  buttonName?: string;
};

const ProjectsHeader = ({ name, isSmallText = false, buttonName }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [projectManager, setProjectManager] = useState("");
  const [createProject, { isLoading: isLoadingCreateProject }] =
    useCreateProjectMutation();

  const { data, isLoading, isError } = useGetProjectManagerQuery("", {
    refetchOnMountOrArgChange: true,
  });

  const isFormValid = () => {
    return (
      title &&
      description &&
      projectCode &&
      startDate &&
      endDate &&
      projectManager
    );
  };

  const handleChange = (value: string) => {
    setProjectCode(value);
    //const value = e.target.value;
    // const regex = /^[A-Za-z0-9-_]*$/;

    // // Check if the value matches the regex
    // if (regex.test(value)) {
    //   setProjectCode(value); // Update the state only if valid
    // } else {
    //   // Show a toast message when an invalid character is entered
    //   toast.error("Special characters not allowed");
    // }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Prepare the form data to submit
    const formData = {
      title: title,
      clientName: clientName,
      description: description,
      projectCode: projectCode,
      startDate: startDate,
      endDate: endDate,
      projectManager: projectManager,
    };
    try {
      const response = await createProject(formData);
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
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setProjectManager("");
      setProjectCode("");
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.data.message);
      console.error("Error creating Project:", err.data.Message);
    }
  };

  return (
    <div className="flex relative py-7 w-full  items-center justify-between">
      <h1
        className={`${
          isSmallText ? "text-lg" : "text-2xl"
        } font-semibold dark:text-white flex items-center text-maintext tracking-wider`}
      >
        <PresentationIcon className="mr-2" />
        {name}
      </h1>
      {buttonName !== "" ? (
        <>
          <div className="flex items-center space-x-4 mr-5">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="commonbtn flex items-center gap-2">
                  <div>
                    <PlusSquare size={22} />
                  </div>
                  {buttonName}
                </Button>
              </DialogTrigger>
              <DialogContent className=" max-w-4xl">
                <DialogHeader>
                  <DialogTitle className="text-maintext tracking-wide">
                    Create Project
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 ">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-2 flex-col">
                      <Label className="after:content-['*'] after:text-red-500 after:ml-1">
                        Project Name
                      </Label>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        placeholder="Enter project name"
                      />
                    </div>

                    <div className="flex items-start gap-2 flex-col">
                      <Label className=" ">Client Name</Label>
                      <Input
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        required
                        placeholder="Enter client name"
                      />
                    </div>

                    <div className="flex items-start gap-2 flex-col">
                      <Label className="after:content-['*'] after:text-red-500 after:ml-1">
                        Project Code
                      </Label>
                      <Input
                        value={projectCode}
                        onChange={(e) => {
                          const newValue = e.target.value;

                          handleChange(newValue);
                        }}
                        required
                        placeholder="Enter project code"
                      />
                    </div>

                    <div className="flex items-start gap-2 flex-col">
                      <Label className="after:content-['*'] after:text-red-500 after:ml-1">
                        Start Date
                      </Label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>

                    <div className="flex items-start gap-2 flex-col">
                      <Label className="after:content-['*'] after:text-red-500 after:ml-1">
                        End Date
                      </Label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>

                    <div className="flex items-start gap-2 flex-col">
                      <Label className="after:content-['*'] after:text-red-500 after:ml-1">
                        Project Manager
                      </Label>
                      <Select
                        value={projectManager}
                        onValueChange={(value) => setProjectManager(value)}
                      >
                        <SelectTrigger className="col-span-7 p-2 border rounded-md">
                          <SelectValue placeholder="Select Project Manager" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {data?.map((user) => (
                              <SelectItem
                                key={user.username}
                                value={user.username}
                              >
                                {user.username}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 flex-col">
                    <Label className="after:content-['*'] after:text-red-500 after:ml-1">
                      Project Description
                    </Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="submit"
                      className={`commonbtn ${
                        !isFormValid() || isLoadingCreateProject
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                      disabled={!isFormValid() || isLoadingCreateProject}
                    >
                      {isLoadingCreateProject
                        ? "Creating..."
                        : "Create Project"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </>
      ) : (
        ""
      )}
    </div>
  );
};

export default ProjectsHeader;
