import Image from "next/image";
import React from "react";
import { logo } from "../../../public/assets/images/image";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Book, ChevronDown, Group, SearchIcon, SparkleIcon, StarHalf, StarIcon, User } from "lucide-react";
import { Separator } from "../ui/separator";
import Link from "next/link";

const Navbar = () => {
    const navLinks = [
        {icon: <User/> , href: "/blog?for-you" , link:"For you"},
        {icon: <Group/> , href: "/blog?communities" , link:"Communities"},
        {icon: <SparkleIcon/> , href: "/pricing" , link:"Premium"},
        {icon: <SearchIcon className="size-4"/> , href: "" , link:"Search"},
    ]
  return (
    <nav className="flex  items-center  backdrop-blur-3xl border-b h-12 border-gray-900 justify-between px-3  w-full fixed z-50">
      <div className="flex items-center">
        <div className="rounded-xl flex items-center justify-center">
          <Image
            src={logo}
            alt="Oneg_logo"
            width={25}
            height={25}
            className="rounded-sm"
            loading="eager"
          />
        </div>
        {/* dropdown option */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              <h2 className="flex text-lg gap-1 items-center">
                Oneg <ChevronDown className="size-3" />
              </h2>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className={"space-y-1"}>
            <DropdownMenuItem className="flex items-center gap-2 text-sm">
              <StarIcon className="size-4" />
              Following
            </DropdownMenuItem>
            <Separator />
            <DropdownMenuItem className="flex items-center gap-2 text-sm">
              <Book className="size-4" />
              Educational
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex items-center gap-2">
        {/* navlinks and cta */}
        <div className="flex items-center gap-2 ">
          {navLinks.map((item, index) => {
            return (
              <div
                className={`flex items-center  w-fit text-[15px] rounded-full ${item.link == "Search" ? " bg-black !w-8 !h-8 flex items-center justify-center text-white " : "hover:bg-black/10 px-3 py-2"}`}
                key={index}
              >
                {item.link == "Search" ? item.icon : ""}
                <Link href={item.href}>
                  {item.link == "Search" ? "" : item.link}
                </Link>
              </div>
            );
          })}
        </div>
        <Link href={'/auth'}>
          <Button className="rounded-full text-white bg-[#0067b7] text-sm px-5 h-full py-2">
            Get Started
          </Button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
