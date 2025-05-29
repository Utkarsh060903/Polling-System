import React, { useState } from "react";

const ActivePoll = ({
  activePoll,
  timeRemaining,
  hasAnswered,
  onSubmitAnswer,
}) => {
  const [selectedOption, setSelectedOption] = useState(null);

  if (!activePoll) return null;

  const handleSubmit = () => {
    if (selectedOption) {
      onSubmitAnswer(selectedOption);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 flex items-center justify-center">
      <div className="w-full max-w-xl">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-[#373737]">Question 1</h2>
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-[#373737]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span
              className={`font-semibold ${
                timeRemaining <= 10 ? "text-red-600" : "text-[#6E6E6E]"
              }`}
            >
              00:{String(Math.max(0, timeRemaining)).padStart(2, "0")}
            </span>
          </div>
        </div>

        <div
          className="text-white rounded-t-lg px-4 py-3 font-semibold"
          style={{
            background: "linear-gradient(90deg, #343434 0%, #6E6E6E 100%)",
          }}
        >
          {activePoll.question}
        </div>

        <div className="border-2 border-[#7765DA] rounded-b-lg p-4 space-y-3">
          {activePoll.options.map((option, index) => {
            const isSelected = selectedOption === option;
            const isDisabled = hasAnswered || timeRemaining <= 0;
            return (
              <button
                key={index}
                onClick={() => setSelectedOption(option)}
                disabled={isDisabled}
                className={`w-full text-left rounded-md px-4 py-3 border transition-all flex items-center gap-3 
                  ${
                    isSelected
                      ? "border-[#7765DA] bg-white"
                      : "bg-[#F2F2F2] border-transparent"
                  } 
                  ${
                    !isDisabled
                      ? "hover:border-[#7765DA]"
                      : "opacity-50 cursor-not-allowed"
                  }
                `}
              >
                <div
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-semibold border
                  ${
                    isSelected
                      ? "bg-[#7765DA] text-white border-[#7765DA]"
                      : "bg-white text-[#6E6E6E] border-[#6E6E6E]"
                  }
                `}
                >
                  {index + 1}
                </div>
                <span
                  className={`font-medium ${
                    isSelected ? "text-[#373737]" : "text-[#6E6E6E]"
                  }`}
                >
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-center mt-6">
          <button
            onClick={handleSubmit}
            disabled={!selectedOption || hasAnswered || timeRemaining <= 0}
            className="px-6 py-2 text-white rounded-full font-medium transition-all
              bg-gradient-to-r from-[#7765DA] to-[#4F0DCE]
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </div>

        {hasAnswered && (
          <div className="mt-4 text-center text-green-600 font-medium">
            ✅ Answer submitted! Waiting for results...
          </div>
        )}

        {timeRemaining <= 0 && !hasAnswered && (
          <div className="mt-4 text-center text-red-600 font-medium">
            ⏰ Time's up! Moving to results...
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivePoll;