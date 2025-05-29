import React from "react";
import sparkleSVG from "../assets/sparkle.svg";

const KickedOutScreen = ({ onReturnToWelcome }) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="text-center">
        {/* Button-like header with icon */}
        <div
          style={{
            background: "linear-gradient(90deg, #7565D9 0%, #4D0ACD 100%)",
          }}
          className="inline-flex gap-2 items-center px-4 py-1 text-white text-sm font-medium rounded-full mb-6"
        >
          <img src={sparkleSVG} alt="" /> Intervue Poll
        </div>

        {/* Main message */}
        <h1 className="text-4xl font-semibold text-[#1a1a1a] mb-2">
          You’ve been Kicked out !
        </h1>
        <p className="text-[#00000080] text-md">
          Looks like the teacher had removed you from the poll system. Please
          <br />
          Try again sometime.
        </p>
      </div>
    </div>
  );
};

export default KickedOutScreen;
