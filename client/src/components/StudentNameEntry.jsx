import React, { useState } from "react";
import sparkleSVG from "../assets/sparkle.svg";

const StudentNameEntry = ({ onNameSubmit }) => {
  const [tempName, setTempName] = useState("");

  const handleSubmit = () => {
    if (tempName.trim()) {
      onNameSubmit(tempName.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-xl text-center">
        {/* Badge */}
        <div
          style={{
            background: "linear-gradient(90deg, #7565D9 0%, #4D0ACD 100%)",
          }}
          className="inline-flex gap-2 items-center px-4 py-1 text-white text-sm font-medium rounded-full mb-6"
        >
          <img src={sparkleSVG} alt="" /> Intervue Poll
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-semibold text-black mb-4">
          Let’s <span className="font-bold">Get Started</span>
        </h1>

        {/* Subtext */}
        <p className="text-gray-500 mb-8 text-sm leading-relaxed">
          If you’re a student, you’ll be able to{" "}
          <strong className="text-black">submit your answers</strong>,
          participate in live polls, and see how your responses compare with
          your classmates
        </p>

        {/* Input and Button */}
        <div className="space-y-4">
          <input
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Enter your Name"
            className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            onClick={handleSubmit}
            disabled={!tempName.trim()}
            className={`px-8 py-3 rounded-full text-white font-semibold text-base transition-all ${
              tempName.trim()
                ? "bg-[linear-gradient(90deg,_#7B5DF0_0%,_#486AE0_100%)]"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentNameEntry;
