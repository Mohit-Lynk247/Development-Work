import React, { useState } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

const NavbarComponent = () => {
  const userEmail = useSearchParams().get("email");

  const data = [
    { title: "Dashboard", link: `/Dashboard?email=${userEmail}` },
    { title: "Screenshots", link: `/screenshots?email=${userEmail}` },
    { title: "Live Streaming", link: `/liveStream?email=${userEmail}` },
    { title: "Geo Tracking", link: `/geoTrack?email=${userEmail}` },
    {
      title: "Projects Dashboard",
      link: `/projectsDashboard?email=${userEmail}`,
    },
    { title: "Attendance", link: `/attendance?email=${userEmail}` },
    { title: "Productivity", link: `/productivity?email=${userEmail}` },
    { title: "Activity", link: `/activity?email=${userEmail}` },
    { title: "User Details", link: `/userDetails?email=${userEmail}` },
    { title: "Alerts", link: `/alerts?email=${userEmail}` },
    { title: "Reports", link: `/reports?email=${userEmail}` },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Filter data based on search query
    if (query === "") {
      setFilteredData(data); // Show all data when no query
    } else {
      setFilteredData(
        data.filter((item) =>
          item.title.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  };

  const handleItemClick = () => {
    setSearchQuery(""); // Clear the search query
  };

  return (
    <div className="relative flex items-center ">
      {/* Search icon */}

      <div className="flex justify-between w-full  rounded-sm">
        <Search
          size={20}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-iconcolor dark:text-white"
          aria-label="Search"
        />
        {/* Search input */}
        <Input
          className="w-full h-9 bg-bgsecondary"
          type="text"
          placeholder="Search..."
          aria-label="Search Input"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {/* Filtered search results dropdown */}
      {searchQuery && (
        <ul className="absolute left-0 w-full  bg-bgsecondary border rounded-sm mt-1 max-h-60 overflow-y-auto shadow-sm z-20 top-full">
          {filteredData.length > 0 ? (
            filteredData.map((item, index) => (
              <li
                key={index}
                className="p-2 cursor-pointe text-secondarytext text-sm hover:text-maintext hover:bg-secondarybtn"
                onClick={() => handleItemClick()}
              >
                <Link
                  href={item.link} // React Router's Link for navigation
                  className="block w-full"
                >
                  {item.title}
                </Link>
              </li>
            ))
          ) : (
            <li className="p-2 text-gray-500">No results found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default NavbarComponent;
