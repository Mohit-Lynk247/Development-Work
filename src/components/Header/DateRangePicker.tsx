"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";

interface Props {
  date: DateRange | undefined;
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  onRangeSelect: () => void;
}

export function DatePickerWithRange({ date, setDate, onRangeSelect }: Props) {
  const handleRangeChange = (selectedRange: DateRange | undefined) => {
    setDate(selectedRange);
    //onRangeSelect();
  };

  const handlePopoverClose = () => {
    //onRangeSelect();
  };

  return (
    <div className={cn("grid gap-2")}>
      <Popover onOpenChange={(open) => !open && handlePopoverClose()}>
        <PopoverTrigger asChild className="border-none bg-bgsecondary  shadow-none">
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              " justify-start w-full text-left   font-medium text-secondarytext",
              !date?.from && !date?.to && "text-muted-foreground"
            )}
          >
            <CalendarIcon size={20} />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a Date Range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-none" align="start">
          <Calendar
            initialFocus
            mode="range"
            selected={date}
            onSelect={handleRangeChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
