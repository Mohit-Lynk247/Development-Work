"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  PlusSquare,
  Pencil,
  Download,
  EllipsisVertical,
  ChevronLeft,
  Timer,
  Trash2,
} from "lucide-react";
import { SubTask, Task as TaskType } from "@/store/interfaces";
import {
  useCloseTaskMutation,
  useCreateSubTaskMutation,
  useDeleteAttachmentMutation,
  useDownloadAttachmentMutation,
  useGetProjectUsersQuery,
  useGetTaskQuery,
  useGetTotalTaskTimeQuery,
  useReopenTaskMutation,
  useUpdateSubTaskProgressMutation,
  useUpdateTaskAssigneeMutation,
  useUpdateTaskMutation,
  useUpdateTaskProgressMutation,
  useUpdateTaskStatusMutation,
  useUploadAttachmentMutation,
} from "@/store/api";
import { toast } from "react-hot-toast";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Comments from "../Comments";
import SubTaskTable from "../(SubTask)/SubTaskTable";
import { useSearchParams } from "next/navigation";
import TaskHistory from "../History";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import TaskActivity from "./TaskActivity";
import CircularLoading from "@/components/Sidebar/loading";
import ErrorDialog from "@/app/ErrorDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const TaskPageFull = () => {
  const projectId = sessionStorage.getItem("projectId");
  const taskIdFromSession = sessionStorage.getItem("taskId");
  const taskId = Number(taskIdFromSession);
  const email = useSearchParams().get("email");

  const {
    data: task,
    isLoading,
    error,
  } = useGetTaskQuery(
    { taskId: Number(taskId) },
    { refetchOnMountOrArgChange: true }
  );

  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [isLoadingSubTasks, setIsLoadingSubTasks] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  localStorage.removeItem("persist:root");
  localStorage.removeItem("ally-supports-cache");

  const PriorityTag = ({ priority }: { priority: TaskType["priority"] }) => {
    return (
      <div
        className={`rounded-full px-2 py-1 text-xs font-semibold ${
          priority === "Urgent"
            ? "bg-red-200 text-red-700"
            : priority === "High"
            ? "bg-orange-200 text-orange-700"
            : priority === "Medium"
            ? "bg-yellow-200 text-yellow-700"
            : priority === "Low"
            ? "bg-green-200 text-green-700"
            : "bg-blue-200 text-blue-700"
        }`}
      >
        {priority}
      </div>
    );
  };

  const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf", ".xls", ".xlsx"];

  const [uploadAttachment, { isLoading: isLoadingUploadAttachment }] =
    useUploadAttachmentMutation();
  const [uploadProgress, setUploadProgress] = useState(0);

  const [deleteAttachmentQuery, { isLoading: isLoadingDeleteAttachment }] =
    useDeleteAttachmentMutation();

  const [downloadAttachmentQuery, { isLoading: isLoadingDownloadAttachment }] =
    useDownloadAttachmentMutation();

  const maxSize = 1.5 * 1024 * 1024; // in bytes

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      // Read the file as a data URL
      reader.readAsDataURL(file);

      // Using the load event to resolve the Promise
      reader.onload = () => {
        resolve(reader.result as string); // Cast result to string
      };

      // Using the error event to reject the Promise
      reader.onerror = (error) => {
        reject(new Error("Error converting file to base64"));
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      if (fileExtension && !allowedExtensions.includes(`.${fileExtension}`)) {
        toast.error("File extension not allowed!");
      } else if (file.size > maxSize) {
        toast.error("File size must be less than 1.5 MB!");
      } else {
        const base64String = await fileToBase64(file);
        const uploadAttachmentBody = {
          taskId: taskId!,
          fileBase64: base64String,
          fileName: file.name,
          uploadedBy: email!,
        };
        try {
          const response = await uploadAttachment(uploadAttachmentBody);
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
        } catch (err: any) {
          toast.error(err.data.message);
          console.error("Error creating role:", err.data.Message);
        }
      }
    }
  };

  const deleteAttachment = async () => {
    try {
      const response = await deleteAttachmentQuery({
        taskId,
        isSubTask: false,
        email: email!,
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
    } catch (err: any) {
      toast.error(err.data.message);
      console.error("Error creating role:", err.data.Message);
    }
  };

  function downloadFile(base64String: string, fileName: string) {
    const base64Data = base64String.startsWith("data:")
      ? base64String.split(",")[1] // Extract the part after the comma
      : base64String;
    const binaryString = atob(base64Data);
    const byteArray = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }

    const blob = new Blob([byteArray], { type: "application/octet-stream" }); // MIME type can vary based on file type
    const fileURL = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = fileURL;
    link.download = fileName;

    link.click();

    URL.revokeObjectURL(fileURL);
  }

  const downloadAttachment = async () => {
    try {
      const response = await downloadAttachmentQuery({
        taskId,
        isSubTask: false,
      });
      downloadFile(response.data?.fileBase64!, response.data?.fileName!);
    } catch (err: any) {
      toast.error(err.data);
      console.error(err);
    }
  };

  const { data: users } = useGetProjectUsersQuery({ projectId: projectId! });

  const taskTagsSplit = task?.tags
    ? task.tags.split(",").filter((tag) => tag.trim() !== "")
    : [];

  const [isProgressStarted, setIsProgressStarted] = useState(
    task?.inProgressStartTime === null ? false : true
  );
  const [timeDiff, setTimeDiff] = useState<string>("");

  const targetTime = new Date(task?.inProgressStartTime!);

  let targetTimeLocal = new Date();
  let count = 0;

  const updateTime = () => {
    if (isProgressStarted === true && task?.inProgressStartTime !== null) {
      const currentTime = new Date();
      let diff = currentTime.getTime() - targetTime.getTime();

      if (task?.inProgressTimeinMinutes !== null)
        diff += Number(task?.inProgressTimeinMinutes!) * 60 * 1000;

      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = (minutes % 60).toString().padStart(2, "0");
      const remainingSeconds = (seconds % 60).toString().padStart(2, "0");

      setTimeDiff(`${hours}:${remainingMinutes}:${remainingSeconds}`);
      setEditedConsumedHours(
        `${hours}:${remainingMinutes}:${remainingSeconds}`
      );
      setInitialEditedConsumedHours(
        `${hours}:${remainingMinutes}:${remainingSeconds}`
      );
    } else {
      if (count === 0) {
        const minutes = Number(task?.inProgressTimeinMinutes);
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = (minutes % 60).toString().padStart(2, "0");
        setTimeDiff(`${hours}:${remainingMinutes}:00`);
        setEditedConsumedHours(`${hours}:${remainingMinutes}:00`);
        setInitialEditedConsumedHours(`${hours}:${remainingMinutes}:00`);
        targetTimeLocal = new Date();
        count = 1;
      } else {
        const currentTime = new Date();
        let diff = currentTime.getTime() - targetTimeLocal!.getTime();

        if (task?.inProgressTimeinMinutes !== null)
          diff += Number(task?.inProgressTimeinMinutes!) * 60 * 1000;

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = (minutes % 60).toString().padStart(2, "0");
        const remainingSeconds = (seconds % 60).toString().padStart(2, "0");

        setTimeDiff(`${hours}:${remainingMinutes}:${remainingSeconds}`);
        setEditedConsumedHours(
          `${hours}:${remainingMinutes}:${remainingSeconds}`
        );
        setInitialEditedConsumedHours(
          `${hours}:${remainingMinutes}:${remainingSeconds}`
        );
      }
    }
  };

  useEffect(() => {
    if (!isProgressStarted && task?.inProgressTimeinMinutes !== null) {
      const minutes = Number(task?.inProgressTimeinMinutes);
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = (minutes % 60).toString().padStart(2, "0");
      setTimeDiff(`${hours}:${remainingMinutes}:00`);
      setEditedConsumedHours(`${hours}:${remainingMinutes}:00`);
      setInitialEditedConsumedHours(`${hours}:${remainingMinutes}:00`);
    }

    let intervalId: NodeJS.Timeout | null = null;

    if (isProgressStarted) {
      intervalId = setInterval(updateTime, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isProgressStarted, task]);

  const [isEditable, setIsEditable] = useState(false);
  const [isTaskNameEditable, setIsTaskNameEditable] = useState(false);
  const [isConsumedHoursEditable, setIsConsumedHoursEditable] = useState(false);
  const [editedText, setEditedText] = useState(task?.points);
  const [editedConsumedHours, setEditedConsumedHours] = useState(
    task?.inProgressTime!
  );
  const [initialEditedConsumedHours, setInitialEditedConsumedHours] =
    useState("");
  const [isHovered, setIsHovered] = useState(true);
  const [isAssigneeEditable, setIsAssigneeEditable] = useState(false);
  const [isAssigneeHovered, setIsAssigneeHovered] = useState(true);
  const [assignee, setAssignee] = useState(task?.assignee?.username);
  const [isDescriptionEditable, setIsDescriptionEditable] = useState(false);
  const [isDescriptionHovered, setIsDescriptionHovered] = useState(true);
  const [taskName, setTaskName] = useState(task?.title);
  const [initailTaskName, setInitialTaskName] = useState(task?.title);
  const [description, setDescription] = useState(task?.description || "");
  const roles = sessionStorage.getItem("userRoles") || "";
  const [PMUser, setPMUser] = useState(
    roles.split(",").includes("PROJECT_MANAGER")
  );

  const [initialDescription, setInitialDescription] = useState(
    task?.description || ""
  );
  const [initialAssignee, setInitialAssignee] = useState(
    task?.assignee?.username || ""
  );
  const [initialPoints, setInitialPoints] = useState(task?.points || "");
  const [initialStatus, setInitialStatus] = useState(task?.status || "");

  const [isSaveButtonEnabled, setIsSaveButtonEnabled] = useState(false);

  const [subTaskName, setSubTaskName] = useState("");
  const [subTtaskStatus, setSubTaskStatus] = useState("To Do");
  const [subTaskDescription, setSubTaskDescription] = useState("");
  const [subTaskStartDate, setSubTaskStartDate] = useState("");
  const [subTaskDueDate, setSubTaskDueDate] = useState("");
  const [subTaskAssignedUserId, setSubTaskAssignedUserId] = useState("");
  const [isEditableStatus, setIsEditableStatus] = useState(false);
  const [taskStatus, setTaskStatus] = useState(task?.status || "");
  const [isDateEditable, setIsDateEditable] = useState(false);
  const [startDate, setStartDate] = useState(task?.startDate);
  const [dueDate, setDueDate] = useState(task?.dueDate);
  const [initialStartDate, setInitialStartDate] = useState(task?.startDate);
  const [initialDueDate, setInitialDueDate] = useState(task?.dueDate);
  const [createSubTask, { isLoading: isLoadingCreateSubTask }] =
    useCreateSubTaskMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [reopenStatus, setReopenStatus] = useState("");
  const [newComment, setNewComment] = useState("");
  const [closeCompletedTask] = useCloseTaskMutation();
  const [updateTaskAssignee] = useUpdateTaskAssigneeMutation();
  const [updateTaskStatus] = useUpdateTaskStatusMutation();
  const [updateTaskProgress] = useUpdateTaskProgressMutation();

  const assignTask = async (taskId: number, email: string) => {
    try {
      const response = await updateTaskAssignee({ taskId, email });
      if (response.error) {
        if ("data" in response.error) {
          const errorData = response.error.data as { message: string };
          toast.error(errorData.message);
        } else {
          toast.error("An unexpected error occurred");
        }
      } else {
        toast.success(String(response.data));
      }
    } catch (err) {
      toast.error("Some Error occurred, please try again later");
    }
  };

  const isFormValid = () => {
    return (
      subTaskName &&
      subTaskDescription &&
      subTaskStartDate &&
      subTaskDueDate &&
      subTaskAssignedUserId
    );
  };

  const { data, isLoading: isLoadingProjectUsers } = useGetProjectUsersQuery({
    projectId: projectId!,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Prepare the form data to submit
    const formData = {
      title: subTaskName,
      description: subTaskDescription,
      status: subTtaskStatus,
      startDate: subTaskStartDate,
      dueDate: subTaskDueDate,
      assignedUserId: subTaskAssignedUserId,
      authorUserId: email!,
      taskId: Number(taskId),
    };
    try {
      const response = createSubTask(formData);
      setSubTaskName("");
      setSubTaskDescription("");
      setSubTaskStartDate("");
      setSubTaskDueDate("");
      setSubTaskAssignedUserId("");
      toast.success("Task Created Successfully");
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.data.message);
      console.error("Error creating role:", err.data.Message);
    }
  };

  useEffect(() => {
    if (task) {
      setDescription(task.description || "");
      setTaskStatus(task.status || "");
      setInitialStatus(task.status || "");
      setAssignee(task?.assignee?.username || "");
      setEditedText(task?.points);
      setInitialAssignee(task?.assignee?.username || "");
      setInitialDescription(task.description || "");
      setTaskName(task.title);
      const formattedStartDate = new Date(task.startDate!)
        .toISOString()
        .split("T")[0];
      setStartDate(formattedStartDate);
      const formattedDueDate = new Date(task.dueDate!)
        .toISOString()
        .split("T")[0];
      setDueDate(formattedDueDate);
      setInitialDueDate(task.dueDate || "");
      setInitialStartDate(task.startDate || "");
      setInitialPoints(task.points || "");
      setInitialTaskName(task.title);
      setSubTasks(task?.subTasks || []);
      setInitialStatus(task?.status || "");
      setIsSaveButtonEnabled(false);
      setIsProgressStarted(task?.inProgressStartTime === null ? false : true);
      setIsLoadingSubTasks(false);
    }
  }, [task]);

  useEffect(() => {
    const isChanged =
      description !== initialDescription ||
      assignee !== initialAssignee ||
      taskStatus !== initialStatus ||
      editedText !== initialPoints ||
      editedConsumedHours !== initialEditedConsumedHours ||
      startDate !== initialStartDate ||
      dueDate !== initialDueDate ||
      taskName !== initailTaskName;

    setIsSaveButtonEnabled(isChanged);
  }, [
    description,
    assignee,
    editedText,
    taskStatus,
    startDate,
    taskName,
    initailTaskName,
    dueDate,
    initialStartDate,
    initialDueDate,
    initialDescription,
    initialAssignee,
    initialPoints,
    initialStatus,
    editedConsumedHours,
    initialEditedConsumedHours,
  ]);

  const handleEditClick = () => {
    setIsEditable(true);
  };

  const handleEditTaskNameClick = () => {
    setIsTaskNameEditable(true);
  };

  const handleEditConsumedHoursClick = () => {
    setIsConsumedHoursEditable(true);
  };

  const handleEditAssigneeClick = () => {
    setIsAssigneeEditable(true);
  };

  const handleDateEditClick = () => {
    setIsDateEditable(true);
  };

  const handleEditDescriptionClick = () => {
    setIsDescriptionEditable(true);
  };

  const handleBlur = () => {
    setIsEditable(false);
    setIsHovered(true);
    setIsConsumedHoursEditable(false);
    setIsDateEditable(false);
    setIsTaskNameEditable(false);
  };

  const handleAssigneeBlur = () => {
    setIsAssigneeEditable(false);
    setIsAssigneeHovered(true);
  };

  const handleDescriptionBlur = () => {
    setIsDescriptionEditable(false);
    setIsDescriptionHovered(true);
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  };

  const [updateTask, { isLoading: isLoadingUpdateTask }] =
    useUpdateTaskMutation();

  const handleSaveChanges = async (event: React.FormEvent) => {
    event.preventDefault();

    // Prepare the form data to submit
    const updateTaskData = {
      taskId: taskId,
      taskPoints: editedText,
      assignee: assignee,
      taskDescription: description,
      editedConsumedHours: editedConsumedHours,
      startDate: startDate!,
      dueDate: dueDate!,
      email: email!,
      taskName: taskName!,
    };
    try {
      const response = await updateTask(updateTaskData);
      if (
        // @ts-ignore
        response.error?.data.status === "Error" ||
        // @ts-ignore
        response.error?.data.status === "Fail"
      ) {
        // @ts-ignore
        toast.error(response.error?.data.message);
      } else {
        // @ts-ignore
        toast.success(response.data?.message);
      }
    } catch (err: any) {
      toast.error(err.data.message);
      console.error("Error creating role:", err.data.Message);
    }
  };

  const [reopenTaskApi, { isLoading: isLoadingReopenTask }] =
    useReopenTaskMutation();

  const reopenTask = async (event: React.FormEvent) => {
    event.preventDefault();

    // Prepare the form data to submit
    const reopenTaskObj = {
      status: reopenStatus,
      comment: newComment,
      email: email!,
      taskId: taskId,
    };
    try {
      const response = await reopenTaskApi(reopenTaskObj);
      if (
        // @ts-ignore
        response.error?.data.status === "Error" ||
        // @ts-ignore
        response.error?.data.status === "Fail"
      ) {
        // @ts-ignore
        toast.error(response.error?.data.message);
      } else {
        // @ts-ignore
        toast.success(response.data?.message);
        setNewComment("");
        setReopenStatus("");
        setIsTaskDialogOpen(false);
      }
    } catch (err: any) {
      toast.error(err.data.message);
      console.error("Error creating role:", err.data.Message);
    }
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorTaskId, setErrorTaskId] = useState("");
  const [taskOrSubTask, setTaskOrSubTask] = useState("Task");
  const [updateSubTaskProgress] = useUpdateSubTaskProgressMutation();
  const [isTaskAssigned, setIsTaskAssigned] = useState(false);

  // Flag to conditionally render the additional button
  const [showAdditionalButton, setShowAdditionalButton] = useState(true);

  const handleOpenErrorDialog = () => {
    setIsDialogOpen(true);
    setErrorMessage("Something went wrong! Please check the error details.");
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const userEmail = useSearchParams().get("email");
  useEffect(() => {
    if (task?.assignee?.email === userEmail) {
      setIsTaskAssigned(true);
    }
  }, [task]);

  // Handler for the additional button click
  const handleAdditionalButtonClick = async () => {
    try {
      const newState = !isProgressStarted;
      if (taskOrSubTask === "Task") {
        const response = await updateTaskProgress({
          taskId: Number(errorTaskId),
          email: email!,
          progressStart: false,
        });
        if (response.error) {
          if ("data" in response.error) {
            const errorData = response.error.data as { message: string };
            toast.error(errorData.message);
          } else {
            toast.error("An unexpected error occurred");
          }
        } else {
          try {
            const response = await updateTaskProgress({
              taskId: Number(task?.id),
              email: email!,
              progressStart: true,
            });
            if (response.error) {
              if ("data" in response.error) {
                const errorData = response.error.data as { message: string };
                toast.error(errorData.message);
              } else {
                toast.error("An unexpected error occurred");
              }
            } else {
              setIsDialogOpen(false);
              setIsProgressStarted(newState);
              toast.success(String(response.data.message));
            }
          } catch (error) {
            console.error("Error updating task progress:", error);
          }
        }
      } else {
        const response = await updateSubTaskProgress({
          taskId: Number(errorTaskId),
          email: email!,
          progressStart: false,
        });
        if (response.error) {
          if ("data" in response.error) {
            const errorData = response.error.data as { message: string };
            toast.error(errorData.message);
          } else {
            toast.error("An unexpected error occurred");
          }
        } else {
          try {
            const response = await updateTaskProgress({
              taskId: Number(task?.id),
              email: email!,
              progressStart: true,
            });
            if (response.error) {
              if ("data" in response.error) {
                const errorData = response.error.data as { message: string };
                toast.error(errorData.message);
              } else {
                toast.error("An unexpected error occurred");
              }
            } else {
              setIsDialogOpen(false);
              setIsProgressStarted(newState);
              toast.success(String(response.data.message));
            }
          } catch (error) {
            console.error("Error updating task progress:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error updating task progress:", error);
    }
  };

  const toggleProgress = async () => {
    const newState = !isProgressStarted;
    if (newState) {
      try {
        const response = await updateTaskProgress({
          taskId: Number(task?.id),
          email: email!,
          progressStart: true,
        });
        if (response.error) {
          if ("data" in response.error) {
            const errorData = response.error.data as { message: string };
            const match = errorData.message.match(/(?:\?)([^=]+)/);
            if (match) {
              const valueBetween = match[1];
              setTaskOrSubTask(valueBetween);
            }
            const str = errorData.message.split("?");
            const str2 = errorData.message.split("=");
            setErrorMessage(str[0]);
            setErrorTaskId(str2[1]);
            setIsDialogOpen(true);
          } else {
            toast.error("An unexpected error occurred");
          }
        } else {
          setIsProgressStarted(newState);
          toast.success(String(response.data.message));
        }
      } catch (error) {
        console.error("Error updating task progress:", error);
      }
    } else {
      try {
        const response = await updateTaskProgress({
          taskId: Number(task?.id),
          email: email!,
          progressStart: false,
        });
        if (response.error) {
          if ("data" in response.error) {
            const errorData = response.error.data as { message: string };
            toast.error(errorData.message);
          } else {
            toast.error("An unexpected error occurred");
          }
        } else {
          setIsProgressStarted(newState);
          toast.success(String(response.data.message));
        }
      } catch (error) {
        console.error("Error updating task progress:", error);
      }
    }
  };

  const closeTask = async (taskId: number) => {
    try {
      const response = await closeCompletedTask({ taskId, email: email! });
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
    } catch (err) {
      toast.error("Some Error occurred, please try again later");
    }
  };

  const moveTaskFromDropdown = async (taskId: number, toStatus: string) => {
    try {
      const response = await updateTaskStatus({
        taskId,
        status: toStatus,
        email: email!,
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
    } catch (err) {
      toast.error("Some Error occurred, please try again later");
    }
  };

  const taskStatusList = [
    "To Do",
    "Work In Progress",
    "Under Review",
    "Completed",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const regex = /^[a-zA-Z0-9_\s]*$/;
    // Check if the value matches the regex
    if (regex.test(value)) {
      setSubTaskName(value); // Update the state only if valid
    } else {
      // Show a toast message when an invalid character is entered
      toast.error(
        "Invalid character! Only letters, numbers, and underscores are allowed."
      );
    }
  };

  const [triggerQuery, setTriggerQuery] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const {
    data: totalTimeData,
    isLoading: isTotalTimeLoading,
    refetch,
  } = useGetTotalTaskTimeQuery(
    { taskId: sessionStorage.getItem("taskId")! },
    {
      skip: !triggerQuery,
    }
  );

  const handleClick = () => {
    setTriggerQuery(true);
    setIsPopoverOpen(true);
    refetch();
  };

  const isValueSelected = () => {
    return newComment && reopenStatus;
  };

  if (isLoading)
    return (
      <div>
        <CircularLoading />
      </div>
    );

  return (
    <div className="w-full max-h-full overflow-y-auto mx-auto  p-6 bg-bgsecondary rounded-xl shadow-lg space-y-6 dark:bg-gray-800 dark:text-white">
      {/* Task Title and Description */}
      {isDialogOpen && (
        <ErrorDialog
          message={errorMessage}
          descriptionMessage="Click proceed if you want to pause the other task and start the progress of this task"
          taskId={errorTaskId}
          closeDialog={handleCloseDialog}
          showAdditionalButton={showAdditionalButton}
          onAdditionalButtonClick={handleAdditionalButtonClick}
        />
      )}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <button onClick={() => window.history.back()}>
            <ChevronLeft className="mr-5 text-iconcolor" />
          </button>
          {isTaskNameEditable ? (
            <Input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              className="border p-1 rounded w-[60vh]"
            />
          ) : (
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl text-maintext font-semibold">
                  {taskName} - {task?.code}
                </h1>

                <Pencil
                  size={16}
                  className="text-iconcolor hover:text-blue-700"
                  onClick={handleEditTaskNameClick}
                />
              </div>
            </div>
          )}
          <div className="flex space-x-4 ml-auto">
            {task?.status! === "Closed" ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex h-8 w-6 mt-1 mr-3 flex-shrink-0 items-center justify-center dark:text-neutral-500">
                    <EllipsisVertical
                      size={20}
                      className="text-iconcolor hover:text-blue-700"
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <Dialog
                      open={isTaskDialogOpen}
                      onOpenChange={setIsTaskDialogOpen}
                    >
                      <div className="my-3 flex justify-between">
                        <DialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              setIsTaskDialogOpen(true);
                            }}
                          >
                            Reopen Task{" "}
                          </DropdownMenuItem>
                        </DialogTrigger>
                      </div>
                      <DialogContent className="max-w-[65vw] mt-5 mb-5 overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="font-semibold text-lg">
                            Reopen Task
                          </DialogTitle>
                        </DialogHeader>
                        <Card>
                          <CardHeader>
                            <CardDescription>
                              Please provide the below data for reopening the
                              task
                            </CardDescription>
                          </CardHeader>

                          <CardContent className="space-y-2">
                            <div className="grid grid-cols-8 items-center gap-4 mr-1">
                              <Label className="text-center">Task Status</Label>
                              <Select
                                value={reopenStatus}
                                onValueChange={(value) =>
                                  setReopenStatus(value)
                                }
                              >
                                <SelectTrigger className="col-span-3 p-2 border rounded-md">
                                  <SelectValue placeholder="Task Status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectItem value="To Do">To Do</SelectItem>
                                    <SelectItem value="Work In Progress">
                                      Work In Progress
                                    </SelectItem>
                                    <SelectItem value="Under Review">
                                      Under Review
                                    </SelectItem>
                                    <SelectItem value="Completed">
                                      Completed
                                    </SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              <Label className="text-center">
                                Reopen Comments
                              </Label>
                              <textarea
                                value={newComment}
                                onChange={(e) => {
                                  setNewComment(e.target.value);
                                }}
                                onBlur={handleBlur}
                                className="w-full p-2 border rounded-md col-span-3 shadow-sm resize-none dark:bg-gray-800 dark:border-gray-300"
                                placeholder="Add a comment..."
                              />{" "}
                            </div>
                          </CardContent>

                          <CardFooter>
                            <Button
                              className="ml-auto"
                              onClick={reopenTask}
                              disabled={!isValueSelected()}
                            >
                              Reopen Task
                            </Button>
                          </CardFooter>
                        </Card>
                      </DialogContent>
                    </Dialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:border-none focus:outline-none">
                    <EllipsisVertical
                      size={20}
                      className="text-iconcolor hover:text-blue-700"
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => {
                        assignTask(task?.id!, email!);
                      }}
                    >
                      Assign To Me
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />

                    <DropdownMenuLabel className="text-maintext">
                      Move Task To :
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                      className="text-secondarytext"
                      onClick={() => {
                        moveTaskFromDropdown(task?.id!, "To Do");
                      }}
                    >
                      To Do
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-secondarytext"
                      onClick={() => {
                        moveTaskFromDropdown(task?.id!, "Work In Progress");
                      }}
                    >
                      Work In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-secondarytext"
                      onClick={() => {
                        moveTaskFromDropdown(task?.id!, "Under Review");
                      }}
                    >
                      Under Review
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-secondarytext"
                      onClick={() => {
                        moveTaskFromDropdown(task?.id!, "Completed");
                      }}
                    >
                      Completed
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-secondarytext"
                      onClick={() => {
                        closeTask(task?.id!);
                      }}
                    >
                      Close Task
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {isTaskAssigned ? (
                  <>
                    <Button onClick={toggleProgress} className="commonbtn">
                      {isProgressStarted ? "Pause Progress" : "Start Progress"}
                    </Button>
                  </>
                ) : (
                  ""
                )}
              </>
            )}
          </div>
        </div>

        <div className="space-y-4 text-gray-600 dark:text-gray-400">
          <div className="text-sm flex justify-between items-center">
            {isDateEditable ? (
              <div className="flex gap-4">
                {" "}
                {/* Use flex and gap to space inputs */}
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)} // Update state as user types
                  onBlur={handleBlur} // Trigger onBlur event when user clicks outside
                  onKeyDown={handleKeyDown} // Trigger onBlur when Enter key is pressed
                  className="border p-1 rounded w-30" // Style the input
                />
                -
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)} // Update state as user types
                  onBlur={handleBlur} // Trigger onBlur event when user clicks outside
                  onKeyDown={handleKeyDown} // Trigger onBlur when Enter key is pressed
                  className="border p-1 rounded w-30" // Style the input
                />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>
                  {formatDate(startDate!)} - {formatDate(dueDate!)}
                </span>

                {/* Pencil icon that appears when hovering over the parent */}
                <Pencil
                  size={16}
                  className="text-iconcolor hover:text-blue-700"
                  onClick={handleDateEditClick}
                />
              </div>
            )}
            <>
              <span className="text-gray-600 text-lg inline-flex items-center mr-5">
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <PopoverTrigger asChild onClick={handleClick}>
                    <Timer className="mr-2 text-blue-600 cursor-pointer " />
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="grid gap-4">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="flex w-full items-center space-x-2">
                            {" "}
                            {/* Added space-x-4 here */}
                            <h4 className="font-medium leading-none">
                              Total Consumed Time :
                            </h4>
                            <h6 className=""></h6>
                            {isTotalTimeLoading ? (
                              <CircularLoading />
                            ) : (
                              <>{totalTimeData}</>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground ">
                            Total consumed time including task and subTasks.
                          </p>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <div className="text-center text-lg font-semibold dark:text-white">
                  {isConsumedHoursEditable ? (
                    <Input
                      type="text"
                      value={editedConsumedHours}
                      onChange={(e) =>
                        setEditedConsumedHours(String(e.target.value))
                      }
                      autoFocus
                      placeholder="00:00:00"
                      className="border p-1 rounded w-24"
                      onBlur={handleBlur}
                    />
                  ) : (
                    <div className="flex items-center">
                      <div className="flex items-center">
                        <span className="cursor-pointer  ">
                          Consumed time: {editedConsumedHours}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                {task?.status! === "Closed" ? (
                  <>
                    {PMUser ? (
                      <>
                        <Pencil
                          size={16}
                          className="text-iconcolor hover:text-blue-700"
                          onClick={handleEditConsumedHoursClick}
                        />
                      </>
                    ) : (
                      ""
                    )}
                  </>
                ) : (
                  ""
                )}
              </span>
            </>
          </div>

          <div className="text-sm  flex justify-between items-center">
            {isEditable ? (
              <Input
                type="text"
                value={editedText}
                onChange={(e) => setEditedText(Number(e.target.value))}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                autoFocus
                className="border p-1 rounded w-24"
              />
            ) : (
              <div
                className="flex items-center gap-2"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(true)}
              >
                <span className="cursor-pointer text-secondarytext">
                  Estimated hours: {editedText}
                </span>

                <Pencil
                  size={16}
                  className="text-iconcolor hover:text-blue-700"
                  onClick={handleEditClick}
                />
              </div>
            )}
          </div>

          <div className="text-sm">
            <span className="ml-auto text-gray-500 dark:text-gray-300">
              Author: {task?.author?.username}
            </span>
          </div>

          <div className="text-sm relative">
            {isAssigneeEditable ? (
              <Select
                value={assignee}
                onValueChange={(value) => setAssignee(value)}
              >
                <SelectTrigger
                  onBlur={handleAssigneeBlur}
                  autoFocus
                  onKeyDown={handleKeyDown}
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {users?.map((user) => (
                      <SelectItem key={user.userId} value={user.username}>
                        {user.username}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            ) : (
              <div
                className="flex items-center gap-2"
                onMouseEnter={() => setIsAssigneeHovered(true)}
                onMouseLeave={() => setIsAssigneeHovered(true)}
              >
                <span className="cursor-pointer">Assignee: {assignee}</span>

                <Pencil
                  size={16}
                  className="text-iconcolor hover:text-blue-700"
                  onClick={handleEditAssigneeClick}
                />
              </div>
            )}
          </div>

          <div className="flex items-center text-sm gap-2 relative">
            Priority:
            <span className="text-secondarytext dark:text-gray-300 whitespace-nowrap">
              {task?.priority && <PriorityTag priority={task.priority} />}
            </span>
          </div>

          <div className="text-sm relative">
            {isEditableStatus ? (
              <select
                value={taskStatus}
                onChange={(e) => setTaskStatus(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="border p-1 rounded w-40"
              >
                {taskStatusList?.map((obj) => (
                  <option key={obj} value={obj}>
                    {obj}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2 text-secondarytext">
                <span className="cursor-pointer">Status: {taskStatus}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">Tags:</span>

            <div
              className="flex flex-wrap items-center gap-2"
              ref={containerRef}
            >
              {taskTagsSplit
                .slice(0, taskTagsSplit.length)
                .map((tag, index) => (
                  <div
                    key={tag}
                    ref={index === 0 ? tagRef : null}
                    className="rounded-full bg-mainborder/70 text-white px-2 py-1 text-xs dark:text-black"
                  >
                    {tag}
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="text-sm relative">
          {isDescriptionEditable ? (
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              className="border p-1 rounded w-full h-24 resize-none"
            />
          ) : (
            <div
              className="flex items-center"
              onMouseEnter={() => setIsDescriptionHovered(true)}
              onMouseLeave={() => setIsDescriptionHovered(true)}
            >
              <p className="text-gray-700 dark:text-gray-300 cursor-pointer">
                {description || "Loading description..."}
              </p>

              <div
                className={`ml-2 cursor-pointer ${
                  isDescriptionHovered ? "opacity-100" : "opacity-0"
                } transition-opacity`}
              >
                <Pencil
                  size={16}
                  className="text-iconcolor hover:text-blue-700"
                  onClick={handleEditDescriptionClick}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSaveChanges}
            disabled={!isSaveButtonEnabled}
            className={`commonbtn ${
              !isSaveButtonEnabled && "opacity-50 cursor-not-allowed"
            }`}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Attachments Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Attachments</h2>
        <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <div className="flex items-center space-x-1">
                {(task?.attachments?.length ?? 0) > 0 ? (
                  <>
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-2xl text-gray-500">📎</span>
                    </div>
                    <span className="text-secondarytext dark:text-gray-100">
                      {task?.attachments?.[0]?.fileName}
                    </span>
                    <button
                      className=" hover:text-blue-800"
                      onClick={downloadAttachment}
                    >
                      <Download size={20} className="text-iconcolor" />
                    </button>
                  </>
                ) : (
                  <div className="text-red-500">
                    Please upload a document of size less than 1 mb
                  </div>
                )}
              </div>

              {(task?.attachments?.length ?? 0) > 0 ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="text-iconcolor hover:text-blue-800">
                      <Trash2 size={20} />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-maintext">
                        Are you sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-secondarytext">
                        Do you want to remove the Attachment ?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        onClick={() => {
                          //setOpen(false);
                        }}
                      >
                        No
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="commonbtn w-20"
                        onClick={deleteAttachment}
                      >
                        Yes
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                ""
              )}
            </div>
          </div>
          <div className="mt-4">
            <div>
              {isLoadingUploadAttachment && (
                <Progress value={uploadProgress} max={100} color="blue" />
              )}
              {(task?.attachments?.length ?? 0) > 0 ? (
                ""
              ) : (
                <button
                  className="commonbtn"
                  onClick={() => document.getElementById("fileInput")?.click()}
                >
                  + Add Attachment
                </button>
              )}

              {/* Hidden file input */}
              <input
                id="fileInput"
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Subtasks Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Subtasks</h2>
          <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="commonbtn flex items-center">
                  <PlusSquare />
                  Add Subtasks
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[50vw] lg:max-w-[60vw] max-h-[29vw] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="mb-1">Create SubTask</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                  <div className=" grid  gap-4 grid-cols-2 py-2">
                    <div className="flex flex-col gap-2">
                      <Label>
                        Task Name
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        value={subTaskName}
                        onChange={handleChange}
                        required
                        placeholder="Enter Task Name"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label>
                        Start Date
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={subTaskStartDate}
                        onChange={(e) => setSubTaskStartDate(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label>
                        Due Date<span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Input
                        type="date"
                        value={subTaskDueDate}
                        onChange={(e) => setSubTaskDueDate(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label>
                        Assignee<span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Select
                        value={subTaskAssignedUserId}
                        onValueChange={(value) =>
                          setSubTaskAssignedUserId(value)
                        }
                      >
                        <SelectTrigger className=" p-2 border rounded-md">
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel className="text-maintext">
                              Assignee
                            </SelectLabel>
                            {data?.map((user) => (
                              <SelectItem
                                className="text-secondarytext"
                                key={user.username}
                                value={String(user.userId)!}
                              >
                                {user.username}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2  col-span-2">
                      <Label>
                        Description
                        <span className="text-red-500 ml-1">*</span>
                      </Label>
                      <Textarea
                        value={subTaskDescription}
                        onChange={(e) => setSubTaskDescription(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter className="flex items-center justify-end py-1  w-full">
                    <Button
                      type="submit"
                      className={`commonbtn ${
                        !isFormValid() || isLoadingCreateSubTask
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                      disabled={!isFormValid() || isLoadingCreateSubTask}
                    >
                      {isLoadingCreateSubTask
                        ? "Creating..."
                        : "Create SubTask"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </>
        </div>

        {/* Line separator under Subtasks heading */}
        <div className="mt-2 border-t-1 border-gray-300 dark:border-gray-600"></div>
        <div className="flex items-center justify-between mt-4"></div>

        <div className="mt-4 space-y-2">
          {isLoadingSubTasks ? (
            <span className="text-gray-500 dark:text-gray-400">
              Loading subtasks...
            </span>
          ) : subTasks.length > 0 ? (
            <SubTaskTable
              subTasks={subTasks}
              email={email!}
              projectId={projectId!}
            />
          ) : (
            <span className="text-gray-500 dark:text-gray-400">
              No subtasks available.
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Comments</h2>
        <div className="mt-2 border-t-1 border-gray-300 dark:border-gray-600"></div>
        <div className="border-1 border-gray-300 p-4 rounded-lg dark:border-gray-600">
          <div className="mt-4 space-y-3">
            <Comments taskId={taskId} email={email!} taskCode={task?.code!} />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <Tabs defaultValue="alerts" className="w-full">
          <TabsList className="grid  grid-cols-2 w-[400px] h-[44px]">
            <TabsTrigger value="alerts" className=" text-md">
              Task History
            </TabsTrigger>
            <TabsTrigger value="activity" className=" text-md ">
              Activity
            </TabsTrigger>
          </TabsList>
          <div className="mt-2 mb-2 border-t-1 border-gray-300 dark:border-gray-600"></div>

          <TabsContent value="alerts" className="w-full">
            <Card className="shadow-none">
              <TaskHistory
                taskId={taskId}
                estimatedHours={String(task?.points)!}
                task={task}
                fullPageFlag={true}
              />
            </Card>
          </TabsContent>
          <TabsContent value="activity">
            <Card className="shadow-none">
              <CardHeader>
                <CardDescription>
                  {task?.title} - {task?.code} Activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <TaskActivity taskId={task?.id!} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TaskPageFull;
