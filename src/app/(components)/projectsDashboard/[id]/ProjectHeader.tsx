import { Calendar, Clock, FilterX, Grid3X3, Table } from "lucide-react";
import React, { useEffect } from "react";
import { TaskSelectionFilter } from "./TaskSelectionFilter";
import { Button } from "@mui/material";
import { HeaderFilter } from "./HeaderFilter";
import { SprintFilter } from "./SprintFilter";
import ProjectSectionHeader from "./ProjectSectionHeader";
import { SubTaskFilter } from "./SubTaskFilter";
import { useGetProjectHoursEstimationQuery } from "@/store/api";

type Props = {
  activeTab: string;
  setActiveTab: (tabName: string) => void;
  priority: string;
  setPriority: (priorityName: string) => void;
  assignedTo: string;
  setAssignedTo: (assignedTo: string) => void;
  sprint: string;
  setSprint: (assignedTo: string) => void;
  email: string;
  projectId: number;
  isTaskOrSubTask: string;
  setIsTaskOrSubTask: (isTask: string) => void;
};

const ProjectHeader = ({
  activeTab,
  setActiveTab,
  priority,
  setPriority,
  assignedTo,
  setAssignedTo,
  sprint,
  setSprint,
  email,
  projectId,
  isTaskOrSubTask,
  setIsTaskOrSubTask,
}: Props) => {
  const projectName = sessionStorage.getItem("projectName");

  useEffect(() => {
    sessionStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  const { data } = useGetProjectHoursEstimationQuery(
    { projectId },
    { refetchOnMountOrArgChange: true }
  );

  return (
    <div className="space-y-3">
      <div className="py-8">
        <ProjectSectionHeader
          name={projectName || "Project"}
          buttonName="Create New Sprint"
          email={email}
          projectId={projectId}
        />
      </div>
      <div className="p-1 flex  gap-6 items-center dark:border-gray-600 ">
        <div className="bg-green-600  p-1 px-6 flex items-center justify-center text-white font-semibold  rounded-full">
          Estimated Hours : {data?.totalHours}
        </div>
        <div className="bg-blue-600 text-white font-semibold  p-1 px-6  rounded-full">
          Total Consumed Hours : {data?.consumedHours}
        </div>
        <div className="bg-red-600  text-white font-semibold p-1 px-6  rounded-full">
          Total Hours Overrun : {data?.hoursOverrun}
        </div>
      </div>

      <div className="flex  flex-col gap-2   p-1 dark:border-stroke-dark ">
        <div className="flex items-center p-1 w-full justify-between  gap-2">
          <div className="flex items-center gap-4">
            <SubTaskFilter
              isTaskOrSubTask={isTaskOrSubTask}
              setIsTaskOrSubTask={setIsTaskOrSubTask}
              setPriority={setPriority}
              email={email}
            />
            <SprintFilter
              sprint={sprint}
              setSprint={setSprint}
              projectId={String(projectId)}
            />
            {isTaskOrSubTask === "Task" ? (
              <HeaderFilter priority={priority} setPriority={setPriority} />
            ) : (
              ""
            )}
            <TaskSelectionFilter
              assignedTo={assignedTo}
              setAssignedTo={setAssignedTo}
              email={email}
            />
          </div>

          <div className="bg-bgsecondary ">
            <Button
              className=""
              onClick={() => {
                setPriority("");
                setAssignedTo("X");
                setSprint("");
                setIsTaskOrSubTask("Task");
              }}
            >
              <FilterX className="text-iconcolor" />
            </Button>
          </div>
        </div>
        <div className="flex flex-1 bg-bgsecondary rounded-lg items-center gap-1 md:gap-4">
          <TabButton
            name="Kanban Board"
            icon={<Grid3X3 className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
          <TabButton
            name="Timeline"
            icon={<Clock className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
          <TabButton
            name="Table"
            icon={<Table className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
          <TabButton
            name="Calendar"
            icon={<Calendar className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
          {/* <TabButton
            name="User Workload"
            icon={<BookUser className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          /> */}
        </div>
      </div>
    </div>
  );
};

type TabButtonProps = {
  name: string;
  icon: React.ReactNode;
  setActiveTab: (tabName: string) => void;
  activeTab: string;
};

const TabButton = ({ name, icon, setActiveTab, activeTab }: TabButtonProps) => {
  const isActive = activeTab === name;

  return (
    <button
      className={`relative flex items-center gap-2 px-1 py-2 text-gray-500 after:absolute after:-bottom-[4px] after:left-0 after:h-[1px] after:w-full hover:text-blue-600 dark:text-neutral-500 dark:hover:text-white sm:px-2 lg:px-4 ${
        isActive ? "text-blue-600 after:bg-blue-600 dark:text-white" : ""
      }`}
      onClick={() => setActiveTab(name)}
    >
      {icon}
      {name}
    </button>
  );
};

export default ProjectHeader;
