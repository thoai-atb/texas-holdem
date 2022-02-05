import React from "react";

export function Toolbar() {
  return (
    <div className="w-full flex items-center justify-center pointer-events-auto">
      <button className="bg-purple-600 text-white cursor-pointer p-4 rounded-full uppercase m-8 text-4xl w-64 text-center active:brightness-50">
        Bet
      </button>
    </div>
  );
}
