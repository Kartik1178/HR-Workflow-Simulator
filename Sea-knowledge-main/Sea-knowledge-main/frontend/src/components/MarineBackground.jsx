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

      {/* ================= OCEAN COLOR BODY ================= */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, #0a1f33 0%, #08243f 35%, #041226 70%, #010308 100%)"
        }}
      />

      {/* ================= GLOBAL WATER HAZE (VERY IMPORTANT) ================= */}
      <div className="water-haze" />

      {/* ================= DEPTH ABSORPTION ================= */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,5,15,0.45) 60%, rgba(0,0,0,0.85) 100%)"
        }}
      />

      {/* ================= FOG LAYERS ================= */}
      <div className="ocean-fog" />
      <div className="ocean-fog ocean-fog-deep" />

      {/* ================= CAUSTIC LIGHT ================= */}
      <div className="caustics" />

      {/* ================= LIGHT SHAFTS ================= */}
      <div className="absolute inset-0">
        <div
          className="absolute left-[22%] w-44 h-full -skew-x-12"
          style={{
            background:
              "linear-gradient(to bottom, rgba(120,220,255,0.08), transparent)"
          }}
        />
        <div
          className="absolute left-[62%] w-36 h-full skew-x-12"
          style={{
            background:
              "linear-gradient(to bottom, rgba(80,180,255,0.06), transparent)"
          }}
        />
      </div>

      {/* ================= FAR DEPTH (SHARKS) ================= */}
      <div className="absolute top-[20%] -left-[620px] depth-far animate-shark-cruise-right">
        <img
          src={sharkRight}
          className="w-[380px] animate-shark-body-heavy"
          alt="Shark"
        />
      </div>

      <div className="absolute top-[48%] -right-[740px] depth-far animate-shark-cruise-left">
        <img
          src={sharkLeft}
          className="w-[420px] animate-shark-body-heavy"
          alt="Shark"
        />
      </div>

      {/* ================= MID DEPTH (JELLYFISH — STABLE) ================= */}
      <div className="absolute top-[58%] left-[18%] depth-mid animate-jelly-float">
        <img
          src={jelly1}
          className="w-24 jelly-dim animate-jelly-pulse"
          alt="Jellyfish"
        />
      </div>

      <div className="absolute top-[64%] right-[22%] depth-mid animate-jelly-float-slow">
        <img
          src={jelly2}
          className="w-32 jelly-dim animate-jelly-pulse-slow"
          alt="Jellyfish"
        />
      </div>

      <div className="absolute top-[70%] left-[46%] depth-mid animate-jelly-float">
        <img
          src={jelly1}
          className="w-20 jelly-dim animate-jelly-pulse"
          alt="Jellyfish"
        />
      </div>

      {/* ================= NEAR SURFACE FISH ================= */}
      <div className="absolute top-[22%] -left-[240px] depth-near animate-fish-curve-right">
        <img src={fishRight} className="w-14" alt="Fish" />
      </div>

      <div className="absolute top-[30%] -right-[260px] depth-near animate-fish-curve-left">
        <img src={fishLeft} className="w-12" alt="Fish" />
      </div>

      <div className="absolute top-[36%] -left-[300px] depth-mid animate-fish-curve-right">
        <img src={fishRight} className="w-10" alt="Fish" />
      </div>

      {/* ================= SEA FLOOR ================= */}
      <div
        className="absolute bottom-0 w-full h-48"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.95), rgba(2,6,17,0.9), transparent)"
        }}
      >
        <Shell className="absolute bottom-10 left-1/3 w-6 h-6 text-orange-300/15" />
        <Shell className="absolute bottom-12 right-1/3 w-5 h-5 text-pink-300/15" />
      </div>

    </div>
  );
};

export default MarineBackground;
