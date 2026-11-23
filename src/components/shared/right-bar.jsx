import React from "react";
import { MoreHorizontal, X, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button";

const RightBar = () => {
  return (
    <div className="flex flex-col gap-4 w-full  overflow-y-auto p-3 sticky top-0">
      {/* 1. Today's News Section */}
      <section className="bg-zinc-900/50  rounded-2xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">Today's News</h2>
          <X size={18} className="text-zinc-500 cursor-pointer" />
        </div>

        <div className="flex flex-col gap-5">
          <NewsItem
            title="Iraq and DR Congo Qualify for 2026 World Cup as Italy Misses Out Again"
            meta="2 days ago · Sports · 140.5K posts"
          />
          <NewsItem
            title="Bosnia Stuns Italy on Penalties to Reach 2026 World Cup"
            meta="2 days ago · Sports · 595.5K posts"
          />
          <NewsItem
            title="Portugal Beats USMNT 2-0 in Final World Cup Tune-Up Friendly"
            meta="3 days ago · Sports · 49.9K posts"
          />
        </div>
      </section>

      {/* 2. Trending Section */}
      <section className="bg-zinc-900/50  rounded-2xl py-4">
        <h2 className="text-lg font-bold text-white px-4 mb-4">
          What's happening
        </h2>
        <div className="flex flex-col">
          <TrendItem category="Trending in Kenya" topic="Fools Day" />
          <TrendItem
            category="Trending in Kenya"
            topic="principal secretaries"
          />
          <TrendItem category="Trending in Kenya" topic="Cabinet Secretaries" />
          <TrendItem category="Trending in Kenya" topic="#NyeriFocus" />
        </div>
        <button className="text-sky-500 px-4 mt-4 text-sm hover:underline">
          Show more
        </button>
      </section>

      {/* 3. Who to Follow Section */}
      <section className="bg-zinc-900/50  rounded-2xl py-4">
        <h2 className="text-lg font-bold text-white px-4 mb-4">
          Who to follow
        </h2>
        <div className="flex flex-col">
          <FollowItem name="Fabrizio Romano" handle="@FabrizioRomano" />
          <FollowItem name="NTV Kenya" handle="@ntvkenya" />
          <FollowItem name="Larry Madowo" handle="@LarryMadowo" />
        </div>
        <button className="text-sky-500 px-4 mt-4 text-sm hover:underline">
          Show more
        </button>
      </section>

      {/* Footer Links */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 px-4 text-[13px] text-zinc-500">
        <span>Terms of Service</span>
        <span>Privacy Policy</span>
        <span>Cookie Policy</span>
        <span>Accessibility</span>
        <span>Ads info</span>
        <span>More...</span>
        <span>© 2026 X Corp.</span>
      </div>
    </div>
  );
};

// --- Sub-Components for Cleanliness ---

const NewsItem = ({ title, meta }) => (
  <div className="cursor-pointer group">
    <h3 className="text-[12px]  text-white leading-tight group-hover:underline mb-1">
      {title}
    </h3>
    <div className="flex items-center gap-2">
      {/* Small circular avatar stack placeholder */}
      <div className="flex -space-x-2">
        <div className="w-5 h-5 rounded-full border border-black bg-zinc-700" />
        <div className="w-5 h-5 rounded-full border border-black bg-zinc-600" />
      </div>
      <span className="text-[13px] text-zinc-500">{meta}</span>
    </div>
  </div>
);

const TrendItem = ({ category, topic }) => (
  <div className="px-4 py-3 hover:bg-zinc-800/50 cursor-pointer transition-colors flex justify-between">
    <div>
      <p className="text-[13px] text-zinc-500">{category}</p>
      <p className="text-[15px]  text-white">{topic}</p>
    </div>
    <MoreHorizontal size={16} className="text-zinc-500" />
  </div>
);

const FollowItem = ({ name, handle }) => (
  <div className="px-4 py-3 hover:bg-zinc-800/50 cursor-pointer transition-colors flex items-center justify-between">
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-full bg-zinc-700" />{" "}
      {/* Avatar Placeholder */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className="text-[14px]  text-white hover:underline">
            {name}
          </span>
        </div>
        <span className="text-[12px] text-zinc-500">{handle}</span>
      </div>
    </div>
    <Button className="px-4 py-1.5 rounded-full text-sm hover:bg-zinc-200">
      Follow
    </Button>
  </div>
);

export default RightBar;
