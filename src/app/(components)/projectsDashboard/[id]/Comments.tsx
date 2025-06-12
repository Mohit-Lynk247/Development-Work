"use client";

import CircularLoading from "@/components/Sidebar/loading";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddCommentMutation,
  useGetMentionedUsersQuery,
  useGetTaskCommentsQuery,
} from "@/store/api";
import { MentionedUser } from "@/store/interfaces";
import Link from "next/link";
import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";

type Props = {
  email: string;
  taskId: number;
  taskCode: string;
};

const Comments = ({ taskId, email, taskCode }: Props) => {
  const [newComment, setNewComment] = useState("");
  const [currentQuery, setCurrentQuery] = useState("");
  const [userSuggestions, setUserSuggestions] = useState<MentionedUser[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isUserSelected, setIsUserSelected] = useState(false);

  const { data: users, isLoading: loading } = useGetMentionedUsersQuery(
    { name: currentQuery },
    { skip: !currentQuery || isUserSelected }
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewComment(value);

    const atIndex = value.lastIndexOf("@");

    if (atIndex !== -1) {
      const searchText = value.slice(atIndex + 1).trim();

      if (searchText.length > 0 && !isUserSelected) {
        setCurrentQuery(searchText);
        setShowDropdown(true);
      } else {
        setCurrentQuery("");
        setShowDropdown(false);
      }
    } else {
      setCurrentQuery("");
      setShowDropdown(false);
    }
  };

  const handleUserSelect = (user: MentionedUser) => {
    const atIndex = newComment.lastIndexOf("@");

    if (atIndex !== -1) {
      const beforeAt = newComment.slice(0, atIndex);
      const afterAt = newComment.slice(atIndex);

      const newCommentValue = `${beforeAt}[${user.username}] ${afterAt.slice(
        user.username.length + 1
      )}`;

      setNewComment(newCommentValue);
    }

    setIsUserSelected(false);
    setUserSuggestions([]);
    setShowDropdown(false);
  };

  const handleBlur = () => {
    setIsUserSelected(false);
  };

  const [addComment, { isLoading: isLoadingAddComment }] =
    useAddCommentMutation();

  const { data, isLoading, error, refetch } = useGetTaskCommentsQuery(
    { taskId: taskId, email: email },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  const handleAddComment = async (event: React.FormEvent) => {
    event.preventDefault();
    const currentDateTime = new Date();

    currentDateTime.setHours(currentDateTime.getHours() + 5);
    currentDateTime.setMinutes(currentDateTime.getMinutes() + 30);
    const indianTimeISOString = currentDateTime.toISOString();
    const formData = {
      text: newComment,
      taskId: taskId,
      userEmail: email,
      commentTime: indianTimeISOString,
      taskCode: taskCode,
    };
    try {
      const response = addComment(formData);
      toast.success("Comment added Successfully");
      setNewComment("");
    } catch (err: any) {
      toast.error(err.data.message);
      console.error("Error creating role:", err.data.Message);
    }
  };

  return (
    <div className="">
      <div className=" overflow-y-auto   max-h-[30vh] h-[30vh] px-2 space-y-2 dark:text-white ">
        {data?.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-white">
            <p>No comments yet</p>
          </div>
        ) : (
          data?.map((comment, index) => {
            const commentDate = new Date(comment.commentTime);
            const formattedDate = commentDate.toISOString().split("T")[0];
            const formattedTime = commentDate
              .toISOString()
              .split("T")[1]
              .slice(0, 5);
            const formattedCommentTime = `${formattedDate} ${formattedTime}`;

            return (
              <div
                key={index + 1}
                className=" space-y-[-8px] p-2 bg-bgprimary rounded-lg    dark:border-gray-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-maintext  text-[0.8rem]">
                    {comment.username}
                  </span>
                  <span className="text-xs  text-secondarytext dark:text-white">
                    {formattedCommentTime}
                  </span>
                </div>

                <p className="text-maintext text-sm dark:text-white ">
                  {(() => {
                    const result = [];
                    let currentText = "";
                    let isInsideBrackets = false;
                    let mention = "";

                    for (let i = 0; i < comment.text.length; i++) {
                      const char = comment.text[i];

                      if (char === "[") {
                        if (currentText) {
                          result.push(currentText);
                        }
                        currentText = "";
                        isInsideBrackets = true;
                      } else if (char === "]" && isInsideBrackets) {
                        result.push(
                          <Link href={`/user?email=${email}`}>
                            <span
                              key={i}
                              className="dark:text-white text-blue"
                              style={{
                                cursor: "pointer",
                                textDecoration: "underline",
                              }}
                              onClick={(e) => {
                                const content = (
                                  e.target as HTMLElement
                                ).textContent?.slice(1, -1);
                                if (content) {
                                  sessionStorage.setItem("userName", content);
                                }
                              }}
                            >
                              {`[${mention}]`}
                            </span>
                          </Link>
                        );

                        mention = "";
                        isInsideBrackets = false;
                      } else if (isInsideBrackets) {
                        mention += char;
                      } else {
                        currentText += char;
                      }
                    }
                    if (currentText) {
                      result.push(currentText);
                    }

                    return result;
                  })()}
                </p>
              </div>
            );
          })
        )}
      </div>
      <div className="mt-4 space-y-4">
        <div>
          <Textarea
            value={newComment}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Add a comment..."
          />

          {showDropdown && currentQuery && !loading && (
            <div
              className="left-0 bg-white border mt-1 rounded-md shadow-lg"
              style={{
                width: "100%",
                maxHeight: "200px",
                overflowY: "auto",
              }}
            >
              <ul>
                {users?.length! > 0 ? (
                  users?.map((user: MentionedUser) => (
                    <li
                      key={user.userId}
                      className="p-2 cursor-pointer hover:bg-gray-200"
                      onClick={() => handleUserSelect(user)}
                    >
                      {user.username}
                    </li>
                  ))
                ) : (
                  <li className="p-2 text-gray-500">No users available</li>
                )}
              </ul>
            </div>
          )}

          {loading && (
            <div>
              <CircularLoading />
            </div>
          )}
        </div>
        <Button onClick={handleAddComment} className="commonbtn">
          Add Comment
        </Button>
      </div>
    </div>
  );
};

export default Comments;
