import React from "react";
import { Shell } from "lucide-react";

import jelly1 from "../assets/fish/jellyfish.png";
import jelly2 from "../assets/fish/jellyfish2.png";
import fishLeft from "../assets/fish/fishmovingleft.png";
import fishRight from "../assets/fish/fishmovingright.png";
import sharkRight from "../assets/fish/sharkmovingright.png";
import sharkLeft from "../assets/fish/sharkmovingleft.png";

const MarineBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">

      {/* ================= BACKGROUND ================= */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#071427] via-[#0b2745] to-[#050b18]" />
      <div className="absolute inset-0 bg-radial-gradient opacity-50" />
      <div className="ocean-fog" />
      <div className="caustics" />

      {/* ================= LIGHT RAYS ================= */}
      <div className="absolute inset-0">
        <div className="absolute left-[20%] w-40 h-full bg-gradient-to-b from-cyan-300/10 to-transparent -skew-x-12 animate-light-ray" />
        <div className="absolute left-[65%] w-32 h-full bg-gradient-to-b from-blue-300/10 to-transparent skew-x-12 animate-light-ray-delayed" />
      </div>

      {/* ================= FAR DEPTH (SHARKS) ================= */}
      <div className="absolute top-[18%] -left-[600px] opacity-20 depth-far animate-shark-cruise-right">
        <img src={sharkRight} className="w-[380px] animate-shark-body-heavy" />
      </div>

      <div
        className="absolute top-[45%] -right-[700px] opacity-25 depth-far animate-shark-cruise-left"
        style={{ animationDelay: "25s" }}
      >
        <img src={sharkLeft} className="w-[420px] animate-shark-body-heavy" />
      </div>

      {/* ================= MID DEPTH (JELLYFISH) ================= */}
      <div className="absolute top-[25%] left-[15%] opacity-35 depth-mid animate-jelly-drift">
        <img src={jelly1} className="w-24 animate-jelly-pulse" />
      </div>

      <div
        className="absolute top-[40%] right-[20%] opacity-25 depth-mid animate-jelly-drift-slow"
        style={{ animationDelay: "6s" }}
      >
        <img src={jelly2} className="w-32 animate-jelly-pulse-slow" />
      </div>

      <div
        className="absolute top-[55%] left-[45%] opacity-30 depth-mid animate-jelly-drift"
        style={{ animationDelay: "12s" }}
      >
        <img src={jelly1} className="w-20 animate-jelly-pulse" />
      </div>

      {/* ================= NEAR SURFACE (FISH) ================= */}
      <div className="absolute top-[20%] -left-[200px] opacity-45 depth-near animate-fish-school-right">
        <img src={fishRight} className="w-16" />
      </div>

      <div
        className="absolute top-[30%] -right-[200px] opacity-40 depth-near animate-fish-school-left"
        style={{ animationDelay: "8s" }}
      >
        <img src={fishLeft} className="w-14" />
      </div>

      <div
        className="absolute top-[35%] -left-[300px] opacity-35 depth-near animate-fish-school-right"
        style={{ animationDelay: "15s" }}
      >
        <img src={fishRight} className="w-12" />
      </div>

      {/* ================= SEA FLOOR ================= */}
      <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-blue-950 to-transparent">
        <div className="absolute bottom-0 left-1/4 w-20 h-28 bg-gradient-to-t from-teal-600/30 to-transparent rounded-t-full animate-sway" />
        <div className="absolute bottom-0 left-1/2 w-14 h-36 bg-gradient-to-t from-emerald-600/30 to-transparent rounded-t-full animate-sway-delayed" />
        <div className="absolute bottom-0 right-1/4 w-24 h-32 bg-gradient-to-t from-teal-700/30 to-transparent rounded-t-full animate-sway" />

        <Shell className="absolute bottom-6 left-1/3 w-6 h-6 text-orange-300/20" />
        <Shell className="absolute bottom-8 right-1/3 w-5 h-5 text-pink-300/20" />
      </div>

      {/* ================= BUBBLES ================= */}
      <div className="absolute bottom-20 left-1/4 opacity-30">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-100/20 rounded-full animate-bubble"
            style={{ left: `${i * 18}px`, animationDelay: `${i * 1.2}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default MarineBackground;
