"use client";

import CircularLoading from "@/components/Sidebar/loading";
import { useGetTaskActivityQuery } from "@/store/api";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";

// Sample data for demonstration
interface Activity {
  username: string;
  activity: string;
  timestamp: string;
}

type Props = {
  taskId: number;
};

const TaskActivity = ({ taskId }: Props) => {
  const { data, isLoading } = useGetTaskActivityQuery(
    { taskId },
    { refetchOnMountOrArgChange: true }
  );

  const email = useSearchParams().get("email");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Get month (1-indexed)
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const regex = /\[([^\]]+)\]/g;

  // Function to highlight text inside square brackets
  const formatActivityText = (text: string) => {
    return text.split(regex).map((part, index) => {
      if (index % 2 === 1) {
        // This is the part inside square brackets, make it clickable and blue
        return (
          <Link href={`/user?email=${email}`}>
            <span
              style={{
                color: "blue",
                cursor: "pointer",
                textDecoration: "underline",
              }}
              onClick={(e) => {
                const content = (e.target as HTMLElement).textContent?.slice(
                  1,
                  -1
                );
                if (content) {
                  sessionStorage.setItem("userName", content);
                }
              }}
            >
              {`[${part}]`}
            </span>
          </Link>
        );
      }
      // This is the other part of the text, just return it normally
      return part;
    });
  };

  if (isLoading) return <CircularLoading />;

  return (
    <div className="task-activity">
      <h1 className="text-secondarytext font-semibold">Activity - Logs</h1>
      <div className="activity-list mt-2  flex flex-col gap-2">
        {Array.isArray(data) &&
          data?.map((activity, index) => (
            <div
              key={index}
              className="activity-item  p-2 py-3 bg-gray-100 rounded-lg  flex justify-between items-center"
            >
              <div className="left-content ">
                {activity.username != null && (
                  <Link href={`/user?email=${email}`} key={activity.username}>
                    <span
                      className="text-iconcolor text-md"
                      onClick={(e) => {
                        const content = (
                          e.target as HTMLElement
                        ).textContent?.slice(1, -1); // Strip brackets
                        if (content) {
                          sessionStorage.setItem("userName", content); // Store the username in sessionStorage
                        }
                      }}
                    >
                      {`[${activity.username}]`}
                    </span>
                  </Link>
                )}
                {/* <span className="activity ml-2">
                  {formatActivityText(activity.activity)}
                </span>{" "} */}
                <span
                  className={`activity ml-2 text-secondarytext text-sm font-medium ${
                    activity.activity.startsWith(" Reopened")
                      ? "bg-red-200"
                      : ""
                  }`}
                >
                  {formatActivityText(activity.activity)}
                </span>
                {/* Activity description */}
              </div>
              <div className="right-content">
                <span className="timestamp text-secondarytext text-medium">{formatDate(activity.date)}</span>{" "}
                {/* Timestamp on the extreme right */}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default TaskActivity;
