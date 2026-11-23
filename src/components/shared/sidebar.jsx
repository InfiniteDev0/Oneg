import React from "react";
import {
  Home,
  Search,
  Bell,
  UserPlus,
  MessageCircle,
  Zap,
  CircleEllipsis,
  User,
  X,
} from "lucide-react";
import { Button } from "../ui/button";

const SidebarItem = ({ icon: Icon, label, badge, active }) => (
  <div className="flex items-center gap-5 p-2 px-5 w-full cursor-pointer hover:bg-zinc-900 rounded-full transition-all duration-200 group">
    <div className="relative">
      <Icon size={23}  className={active ? "text-blue-400" : ""}/>
      {/* Blue dot notification for Home/Grok */}
      {badge && (
        <div className="absolute -top-1 -right-0.5 w-2 h-2 bg-sky-500 rounded-full border-2 border-black" />
      )}
    </div>
    <span
      className={`text-lg pr-4 `}
    >
      {label}
    </span>
  </div>
);

const Sidebar = () => {
  const menuItems = [
    { icon: Home, label: "Home", badge: true, active: true },
    { icon: Search, label: "Explore" },
    { icon: Bell, label: "Notifications" },
    { icon: UserPlus, label: "Follow" },
    { icon: MessageCircle, label: "Chat" },
    { icon: User, label: "Profile" },
    { icon: CircleEllipsis, label: "More" },
  ];

  return (
    <div className="flex flex-col  w-72 h-full  px-3 justify-between ">
      <div className="flex flex-col gap-1 mt-3">
        {/* Navigation Links */}
        {menuItems.map((item, index) => (
          <div key={index} className="flex items-center">
            <SidebarItem {...item} />
            {item.promo && (
              <span className="bg-sky-500  text-[11px] font-bold px-1.5 py-0.5 rounded-sm ml-[-10px]">
                {item.promo}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* User Profile Section */}
      <div className="my-4 flex flex-col items-center justify-between  rounded-full cursor-pointer transition-colors">
        {/* Post Button */}
        <Button className="my-4 w-full !py-3 rounded-full text-lg transition-colors">
          Post
        </Button>
        <div className="flex items-center p-2 rounded-lg bg-black/90 justify-between w-full gap-3">
          <div className="flex items-center  gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-700">
              <img
                src="https://i.pravatar.cc/350"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm">ز بن محمد (الخبري)</span>
                <span className="text-zinc-500 text-xs">🔒</span>
              </div>
              <span className="text-zinc-500 text-sm">@infinitedev0</span>
            </div>
          </div>
          <CircleEllipsis size={18} className="text-white" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
