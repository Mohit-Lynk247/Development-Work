"use client";

import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Eye } from "lucide-react";

type Props = {
  onClick: () => void;
  text: String;
};
const ViewButton = ({ text, onClick }: Props) => {
  return (
    <>
      <Tooltip>
        <TooltipTrigger className="viewbtn" onClick={onClick}>
          <Eye />
        </TooltipTrigger>
        <TooltipContent>
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </>
  );
};

export default ViewButton;
