import React, { useMemo, useState } from "react";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { useGetProjectTasksQuery } from "@/store/api";
import CircularLoading from "@/components/Sidebar/loading";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  projectId: string;
  sprint: string;
  assignedTo: string;
  priority: string;
  isTaskOrSubTask: string;
  email: string;
};

type taskTypeItems = "task" | "milestone" | "project";

const Timeline = ({
  projectId,
  sprint,
  assignedTo,
  priority,
  isTaskOrSubTask,
  email,
}: Props) => {
  localStorage.removeItem("persist:root");
  localStorage.removeItem("ally-supports-cache");

  const { theme } = useTheme();

  let isDarkMode = theme === "dark";
  const {
    data: tasks,
    isLoading,
    error,
  } = useGetProjectTasksQuery({
    projectId,
    sprint,
    assignedTo,
    priority,
    isTaskOrSubTask,
    email: email!,
    page: 1,
    limit: 9999999999,
  });

  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-US",
  });

  const defaultTaskStyle = {
    backgroundColor: "#6366F1", // Task bar color
    progressColor: "#10B981", // Progress bar color
    backgroundSelectedColor: "#4338CA",
    progressSelectedColor: "#059669",
  };
  const ganttTasks = useMemo(() => {
    if (!tasks || tasks.tasks.length === 0) {
      return [];
    }

    return tasks.tasks
      .filter(
        (task) => task != null && task.startDate && task.dueDate && task.title
      )
      .map((task) => ({
        start: task.startDate ? new Date(task.startDate as string) : new Date(),
        end: task.dueDate ? new Date(task.dueDate as string) : new Date(),
        name: task.title || "Untitled Task",
        id: `Task-${task.id}`,
        type: "task" as taskTypeItems,
        progress: task.points ? (task.points / 10) * 100 : 0,
        isDisabled: false,
        styles: defaultTaskStyle,
      }));
  }, [tasks]);

  if (ganttTasks.length === 0) {
    return <div>No tasks available for the selected project.</div>;
  }

  const handleViewModeChange = (value: String) => {
    console.log(value);
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: value as ViewMode,
    }));
  };

  if (isLoading)
    return (
      <div>
        <CircularLoading />
      </div>
    );
  if (error) return <div>An error occurred while fetching tasks</div>;

  return (
    <div className="bg-bgsecondary p-1 rounded-md">
      <div className="flex flex-wrap items-center justify-between gap-2   p-2">
        <h1 className=" text-lg font-bold text-maintext dark:text-white">
          Project Tasks Timeline
        </h1>
        <div className="relative inline-block w-64">
          <Select
            value={displayOptions.viewMode}
            onValueChange={(value) => handleViewModeChange(value)}
          >
            <SelectTrigger className="w-full dark:border-dark-secondary dark:bg-dark-secondary dark:text-white">
              <SelectValue placeholder="Select view mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ViewMode.Day}>Day</SelectItem>
              <SelectItem value={ViewMode.Week}>Week</SelectItem>
              <SelectItem value={ViewMode.Month}>Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="overflow-hidden rounded-md bg-white shadow dark:bg-dark-secondary dark:text-white">
        <div className="timeline">
          <Gantt
            tasks={ganttTasks}
            {...displayOptions}
            headerHeight={20}
            columnWidth={displayOptions.viewMode === ViewMode.Month ? 150 : 100}
            listCellWidth="150px"
            // barBackgroundColor={isDarkMode ? "#101214" : "#4f46e5"}
            // barBackgroundSelectedColor={isDarkMode ? "#000" : "#60A5FA"}
          />
        </div>
        <div className="px-4 pb-5 pt-1"></div>
      </div>
    </div>
  );
};

export default Timeline;
