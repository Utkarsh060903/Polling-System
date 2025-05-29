import React, { useState } from "react";
import sparkleSVG from "../assets/sparkle.svg";

const WelcomeScreen = ({ onRoleSelect }) => {
  const [selectedRole, setSelectedRole] = useState("student");

  const handleContinue = () => {
    if (onRoleSelect) {
      onRoleSelect(selectedRole);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-3xl w-full text-center">
        {/* Badge */}
        <div style={{
              background: "linear-gradient(90deg, #7565D9 0%, #4D0ACD 100%)",
            }} className="inline-flex gap-2 items-center px-4 py-1 text-white text-sm font-medium rounded-full mb-6">
          <img src={sparkleSVG} alt="" /> Intervue Poll
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-bold text-[#373737] mb-2">
          Welcome to the <span className="text-[#373737] font-extrabold">Live Polling System</span>
        </h1>

        {/* Subtext */}
        <p className="text-[#6E6E6E] text-base mb-10">
          Please select the role that best describes you to begin using the live polling system
        </p>

        {/* Role Cards */}
        <div className="flex flex-col sm:flex-row justify-center items-stretch gap-6 mb-10">
          <div
            className={`flex-1 min-w-[260px] p-6 border-2 rounded-xl text-left cursor-pointer transition-all ${
              selectedRole === "student"
                ? "border-[#7765DA]"
                : "border-[#E0E0E0]"
            }`}
            onClick={() => setSelectedRole("student")}
          >
            <h3 className="text-lg font-bold text-[#373737] mb-2">I’m a Student</h3>
            <p className="text-sm text-[#6E6E6E]">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry
            </p>
          </div>

          <div
            className={`flex-1 min-w-[260px] p-6 border-2 rounded-xl text-left cursor-pointer transition-all ${
              selectedRole === "teacher"
                ? "border-[#7765DA]"
                : "border-[#E0E0E0]"
            }`}
            onClick={() => setSelectedRole("teacher")}
          >
            <h3 className="text-lg font-bold text-[#373737] mb-2">I’m a Teacher</h3>
            <p className="text-sm text-[#6E6E6E]">
              Submit answers and view live poll results in real-time.
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            style={{
              background: "linear-gradient(99.18deg, #8F64E1 -46.89%, #1D68BD 223.45%)"

            }}
            className="px-12 py-3 rounded-full font-medium text-white text-base bg-gradient-to-r cursor-pointer"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
