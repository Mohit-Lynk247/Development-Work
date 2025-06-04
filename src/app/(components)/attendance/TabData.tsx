import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HighlightedUsersTable from "./LateUsersTable";

type Props = {
  userEmail: string;
  fromDate: string;
  toDate: string;
  teamId: number;
};

export function TabsDemo({ userEmail, fromDate, toDate, teamId }: Props) {
  return (
    <div className="w-full">
      <Tabs defaultValue="account" className="w-full ">
        <TabsList className="w-1/3   flex items-center  gap-2 ">
          <TabsTrigger
            className="w-full p-2  font-medium shadow-none"
            value="account"
          >
            Late Comers
          </TabsTrigger>
          <TabsTrigger
            value="password"
            className="w-full shadow-none p-2 font-medium"
          >
            Always on-Time
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account" className=" w-full flex-1">
          <Card className="p-0">
            <CardHeader className="mt-1">
              <CardDescription className="text-secondarytext">
                People who have punched in late the most number of times in
                given period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HighlightedUsersTable
                email={userEmail!}
                adminFlag={true}
                lateFlag={true}
                fromDate={fromDate}
                toDate={toDate}
                teamId={teamId}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card>
            <CardHeader className="mt-1 ">
              <CardDescription className="text-secondarytext  text-sm">
                People who have punched in on-time the most number of times in
                given period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HighlightedUsersTable
                email={userEmail!}
                adminFlag={true}
                lateFlag={false}
                fromDate={fromDate}
                toDate={toDate}
                teamId={teamId}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
