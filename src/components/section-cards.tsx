import {
  AlarmClock,
  Circle,
  Clock,
  Hourglass,
  Ratio,
  Timer,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGetAttendanceCardsDataQuery } from "@/store/api";
import CircularLoading from "./Sidebar/loading";

type Props = {
  email: string;
  fromDate: string;
  toDate: string;
  teamId: number;
};

export function SectionCards({ email, fromDate, toDate, teamId }: Props) {
  const { data, isLoading } = useGetAttendanceCardsDataQuery(
    {
      email,
      fromDate,
      toDate,
      teamId,
    },
    { refetchOnMountOrArgChange: true }
  );

  function isPositiveChange(percentage?: string): boolean {
    if (!percentage) return false; // handles undefined, null, empty string

    return percentage.trim().startsWith("+");
  }

  return (
    <div className="grid grid-cols-4  gap-5  p-2 px-2">
      <Card className="@container/card  hover:bg-[#ebf2ff]  gap-2 py-1   ">
        <CardHeader className="relative px-2  py-3 ">
          <div className="flex items-start justify-between ">
            <CardDescription className="text-maintext text-sm  font-semibold gap-2 flex items-center">
              <div className="rounded-full  bg-[#dbeafe] p-1 flex items-center justify-center">
                <Circle size={22} color="#059669" />
              </div>
              On-Time Arrivals
            </CardDescription>
          </div>
        </CardHeader>
        <div className="text-2xl  px-4    font-semibold flex   items-start justify-between">
          {" "}
          {data?.onTimeArrival}{" "}
          <div className="">
            <Badge
              variant="outline"
              className="flex gap-1 border-none p-0   rounded-lg text-sm"
            >
              {data?.onTimePercentage}
              <div className=" rounded-full p-1">
                <TrendingUpIcon size={18} className="text-green-400" />
              </div>
            </Badge>
          </div>
        </div>
        <CardFooter className="flex items-center gap-2  text-secondarytext  py-3  px-4 text-[0.8rem]">
          {isPositiveChange(data?.onTimePercentage!) ? (
            <>
              {" "}
              Trending up this period{" "}
              <TrendingUpIcon size={15} className="text-secondarytext" />
            </>
          ) : (
            <>
              Down this period{" "}
              <TrendingDownIcon size={15} className="text-secondarytext" />
            </>
          )}
        </CardFooter>
      </Card>

      <Card className="@container/card  gap-2  hover:bg-[#ebf2ff]   ">
        <CardHeader className="relative px-2  py-3 ">
          <div className="flex items-start justify-between ">
            <CardDescription className="text-maintext text-sm   font-semibold gap-2 flex items-center">
              <div className="rounded-full  bg-[#dbeafe] p-1 flex items-center justify-center">
                <Hourglass size={22} color="#D97706" />
              </div>
              Late Arrivals
            </CardDescription>
          </div>
        </CardHeader>
        <div className="text-2xl  px-4    font-semibold flex   items-start justify-between">
          {" "}
          {data?.lateArrival}{" "}
          <div className="">
            <Badge
              variant="outline"
              className="flex gap-1 border-none p-0   rounded-lg text-[0.8rem]"
            >
              {data?.lateArrivalPercentage}
              <div className=" rounded-full p-1">
                <TrendingUpIcon size={18} className="text-green-400  " />
              </div>
            </Badge>
          </div>
        </div>
        <CardFooter className="flex items-center gap-2  text-secondarytext  py-3  px-4 text-[0.8rem]">
          {isPositiveChange(data?.lateArrivalPercentage!) ? (
            <>
              {" "}
              Trending up this period{" "}
              <TrendingUpIcon size={15} className="text-secondarytext" />
            </>
          ) : (
            <>
              Down this period{" "}
              <TrendingDownIcon size={15} className="text-secondarytext" />
            </>
          )}
        </CardFooter>
      </Card>

      <Card className="@container/card  gap-2 hover:bg-[#ebf2ff]    ">
        <CardHeader className="relative px-2  py-3 ">
          <div className="flex items-start justify-between ">
            <CardDescription className="text-maintext  text-sm  font-semibold gap-2 flex items-center">
              <div className="rounded-full  bg-[#dbeafe] p-2 flex items-center justify-center">
                <Ratio size={22} color="#2563EB" />
              </div>
              Average Active Time
            </CardDescription>
          </div>
        </CardHeader>
        <div className="text-2xl  px-4   gap-5   font-semibold flex   items-start justify-between">
          {" "}
          {data?.avgActiveTime}{" "}
          <div className="">
            <Badge
              variant="outline"
              className="flex gap-1 border-none p-0   rounded-lg text-[0.8rem]"
            >
              {data?.avgActiveTimePercentage}
              <div className=" rounded-full p-1">
                <TrendingUpIcon size={18} className="text-green-400  " />
              </div>
            </Badge>
          </div>
        </div>
        <CardFooter className="flex items-center gap-2  text-secondarytext  py-3  px-4 text-[0.8rem]">
          {isPositiveChange(data?.avgActiveTimePercentage!) ? (
            <>
              {" "}
              Trending up this period{" "}
              <TrendingUpIcon size={15} className="text-secondarytext" />
            </>
          ) : (
            <>
              Down this period{" "}
              <TrendingDownIcon size={15} className="text-secondarytext" />
            </>
          )}
        </CardFooter>
      </Card>

      <Card className="@container/card  gap-2  hover:bg-[#ebf2ff]   ">
        <CardHeader className="relative px-2  py-3 ">
          <div className="flex items-start justify-between ">
            <CardDescription className="text-maintext  text-sm  font-semibold gap-2 flex items-center">
              <div className="rounded-full  bg-[#dbeafe] p-2 flex items-center justify-center">
                <Timer size={22} color="#F43F5E" />
              </div>
              Average Break Time
            </CardDescription>
          </div>
        </CardHeader>
        <div className="text-2xl  px-4    font-semibold flex   items-start justify-between">
          {" "}
          {data?.breakTime}{" "}
          <div className="">
            <Badge
              variant="outline"
              className="flex gap-1 border-none p-0   rounded-lg text-[0.8rem]"
            >
              {data?.breakTimePercentage}
              <div className=" rounded-full p-1">
                <TrendingUpIcon size={18} className="text-green-400  " />
              </div>
            </Badge>
          </div>
        </div>
        <CardFooter className="flex items-center gap-2  text-secondarytext  py-3  px-4 text-[0.8rem]">
          {isPositiveChange(data?.breakTimePercentage!) ? (
            <>
              {" "}
              Trending up this period{" "}
              <TrendingUpIcon size={15} className="text-secondarytext" />
            </>
          ) : (
            <>
              Down this period{" "}
              <TrendingDownIcon size={15} className="text-secondarytext" />
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
