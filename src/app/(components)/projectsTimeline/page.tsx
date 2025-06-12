"use client";

import React, { useMemo, useState } from "react";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
import "gantt-task-react/dist/index.css";
import { useSearchParams } from "next/navigation";
import { useGetProjectsQuery } from "@/store/api";
import Header from "@/components/Header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type taskTypeItems = "task" | "milestone" | "project";

const ProjectsTimeline = () => {
  const isDarkMode = 1;

  const userEmail = useSearchParams().get("email");
  const {
    data: projects,
    isLoading,
    error,
  } = useGetProjectsQuery({ email: userEmail!, closedFlag: false });

  // style for timeline view
  const defaultTaskStyle = {
    backgroundColor: "#6366F1",
    progressColor: "#10B981",
    backgroundSelectedColor: "#4338CA",
    progressSelectedColor: "#059669",
  };

  const [displayOptions, setDisplayOptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-US",
  });

  const ganttProjects = useMemo(() => {
    if (!projects || projects.length === 0) {
      return [];
    }

    return projects
      .filter(
        (project) =>
          project != null &&
          project.startDate &&
          project.endDate &&
          project.name
      )
      .map((project) => ({
        start: project.startDate
          ? new Date(project.startDate as string)
          : new Date(),
        end: project.endDate ? new Date(project.endDate as string) : new Date(),
        name: project.name || "Untitled Project",
        id: `Task-${project.id}`,
        type: "project" as taskTypeItems,
        progress: project.completionStatus,
        isDisabled: false,
        styles: defaultTaskStyle,
      }));
  }, [projects]);

  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div>An error occurred while fetching tasks</div>;

  if (ganttProjects.length === 0) {
    return <div>No Projects available.</div>;
  }

  const handleViewModeChange = (value: String) => {
    setDisplayOptions((prev) => ({
      ...prev,
      viewMode: value as ViewMode,
    }));
  };

  return (
    <div className="  bg-bgsecondary p-2  mt-8 rounded-lg space-y-2">
      <div className=" grid grid-cols-2  ">
        <Header
          name="Project Tasks Timeline"
          hasFilters={false}
          hasTeamFilter={false}
        />

        <div className=" flex items-center justify-end ">
          <Select
            value={displayOptions.viewMode}
            onValueChange={(value) => handleViewModeChange(value)}
          >
            <SelectTrigger className="w-60">
              <SelectValue placeholder="Select a value" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value={ViewMode.Day}>Day</SelectItem>
              <SelectItem value={ViewMode.Week}>Week</SelectItem>
              <SelectItem value={ViewMode.Month}>Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className=" dark:bg-dark-secondary mt-7 dark:text-white">
        <Gantt
          tasks={ganttProjects}
          {...displayOptions}
          columnWidth={displayOptions.viewMode === ViewMode.Month ? 150 : 100}
          listCellWidth="100px"
          headerHeight={20}
          // projectProgressColor="#4f46e5"
          // barBackgroundColor={isDarkMode ? "#101214" : "#001742"}
          // barBackgroundSelectedColor={isDarkMode ? "#000" : "#4f46e5"}
          todayColor="#f8f6ff"
        />
        <div className="px-4 pb-5 pt-1"></div>
      </div>
    </div>
  );
};

export default ProjectsTimeline;
