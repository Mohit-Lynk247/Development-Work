"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button as UiButton } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Check,
  ChevronsUpDown,
  FilterX,
  ScreenShare,
  Users,
} from "lucide-react";
import { Button } from "@mui/material";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/Header/DateRangePicker";
import { UserSelectionFilter } from "@/components/Header/UserSelectionFilter";
import {
  useGetTeamListFilterQuery,
  useGetUserListFilterQuery,
} from "@/store/api";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  isSmallText?: boolean;
  hasFilters?: boolean;
  hasTeamFilter?: boolean;
  date?: DateRange | undefined;
  setDate?: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  onRangeSelect?: () => void;
  clearFilter?: () => void;
  buttonName?: string;
  hasDateFilter?: boolean;
  setSelectedDate?: React.Dispatch<React.SetStateAction<Date>>;
  selectedDate?: Date;
  selectedtab?: string;
  email: string;
  setValue: React.Dispatch<React.SetStateAction<number>>;
  value: number;
};

const AttendanceHeader = ({
  name,
  isSmallText = false,
  hasFilters,
  hasTeamFilter,
  date,
  setDate,
  onRangeSelect,
  clearFilter,
  buttonName,
  hasDateFilter,
  setSelectedDate,
  selectedDate,
  selectedtab,
  email,
  value,
  setValue,
}: Props) => {
  let icon;

  switch (name) {
    case "Attendance":
      icon = <Users className="mr-2" />;
      break;
  }

  const todayWithMidnightTime = new Date();
  todayWithMidnightTime.setHours(0, 0, 0, 0); // Set the time to 00:00:00

  useEffect(() => {
    if (setSelectedDate) setSelectedDate(new Date(todayWithMidnightTime));
  }, []);

  localStorage.removeItem("ally-supports-cache");
  localStorage.removeItem("persist:root");

  const roles = sessionStorage.getItem("userRoles") || "";
  const [ADMINUser, setADMINUser] = useState(
    roles.split(",").includes("ADMIN")
  );

  const [open, setOpen] = React.useState(false);

  const { data, isLoading, error, isSuccess } = useGetTeamListFilterQuery(
    {
      email: email!,
    },
    { refetchOnMountOrArgChange: true }
  );

  return (
    <div className="flex relative w-full  px-6  items-center justify-between">
      <h1
        className={`${
          isSmallText ? "text-lg" : "text-2xl"
        } font-semibold dark:text-white flex items-center   `}
      >
        <span className="text-secondarytext">{icon}</span>
        {name}
      </h1>

      {hasFilters && (
        <div className="  w-[60%] flex items-center justify-end   gap-1  ">
          <div className="flex items-center w-full gap-7  justify-end">
            {hasTeamFilter && (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger
                  asChild
                  className="border-none   bg-bgsecondary  shadow-sm"
                >
                  <UiButton
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className=" justify-between  font-normal  text-secondarytext"
                  >
                    {value
                      ? data?.find((team) => team.id === value)?.name
                      : "Select Team"}
                    <ChevronsUpDown className="opacity-50  text-secondarytext  " />
                  </UiButton>
                </PopoverTrigger>
                <PopoverContent className=" p-0 border-none ">
                  <Command>
                    <CommandInput
                      placeholder="Search Team..."
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>No Teams found.</CommandEmpty>
                      <CommandGroup>
                        {data?.map((team) => (
                          <CommandItem
                            key={team.name}
                            value={team.name}
                            onSelect={() => {
                              setValue(team.id);
                              setOpen(false);
                            }}
                          >
                            {team.name}
                            <Check
                              className={cn(
                                "ml-auto",
                                value === team.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
            <DatePickerWithRange
              date={date}
              setDate={setDate!}
              onRangeSelect={onRangeSelect!}
            />
          </div>
          <Button className="common-iconbtn rounded-lg" onClick={clearFilter}>
            <FilterX size={20} className="text-secondarytext" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default AttendanceHeader;
