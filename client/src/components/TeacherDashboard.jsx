import React, { useState } from "react";
import sparkleSVG from "../assets/sparkle.svg";

const TeacherDashboard = ({ onCreatePoll }) => {
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", ""]);
  const [correctOptions, setCorrectOptions] = useState([false, false]);
  const [timeLimit, setTimeLimit] = useState("60");

  const handleCreatePoll = () => {
    if (newQuestion.trim() && newOptions.every((opt) => opt.trim())) {
      onCreatePoll({
        question: newQuestion.trim(),
        options: newOptions,
        correct: correctOptions,
        timeLimit,
      });
      setNewQuestion("");
      setNewOptions(["", ""]);
      setCorrectOptions([false, false]);
    }
  };

  const addOption = () => {
    setNewOptions([...newOptions, ""]);
    setCorrectOptions([...correctOptions, false]);
  };

  const updateOption = (index, value) => {
    const updated = [...newOptions];
    updated[index] = value;
    setNewOptions(updated);
  };

  const updateCorrectOption = (index, value) => {
    const updated = [...correctOptions];
    updated[index] = value === "yes";
    setCorrectOptions(updated);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header Badge */}
      <div
        style={{
          background: "linear-gradient(90deg, #7565D9 0%, #4D0ACD 100%)",
        }}
        className="inline-flex gap-2 items-center px-4 py-1 text-white text-sm font-medium rounded-full mb-6"
      >
        <img src={sparkleSVG} alt="" /> Intervue Poll
      </div>

      {/* Title and Description */}
      <h1 className="text-4xl font-bold text-gray-900 mb-2">
        Let's <span className="font-black">Get Started</span>
      </h1>
      <p className="text-gray-600 mb-8 text-lg">
        you'll have the ability to create and manage polls, ask questions, and
        monitor your students' responses in real-time.
      </p>

      <div className="mb-8">
        <label className="block font-semibold text-gray-900 text-lg mb-2">
          Enter your question
        </label>

        <div className="w-[60%]">
          <div className="flex justify-end mb-1">
            <select
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 text-gray-700 bg-white min-w-[120px] shadow-sm focus:outline-none focus:ring-1 focus:ring-purple-600"
            >
              <option value="30">30 seconds</option>
              <option value="60">60 seconds</option>
              <option value="90">90 seconds</option>
            </select>
          </div>

          <div className="relative">
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              rows={4}
              maxLength={100}
              placeholder="Type your question here..."
              className="w-full p-4 pr-12 border border-gray-300 rounded-lg resize-none text-gray-900 bg-[#F2F2F2] text-base"
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-600">
              {newQuestion.length}/100
            </div>
          </div>
        </div>
      </div>

      {/* Options Section */}
      <div className="mb-8 w-[60%]">
        <div className="flex justify-between items-center mb-6">
          <label className="block font-semibold text-gray-900 text-lg">
            Edit Options
          </label>
          <label className="block font-semibold text-gray-900 text-lg">
            Is it Correct?
          </label>
        </div>

        {newOptions.map((option, index) => (
          <div key={index} className="flex items-center gap-4 mb-4">
            {/* Option Number */}
            <div
              style={{
                background:
                  "linear-gradient(243.94deg, #8F64E1 -50.82%, #4E377B 216.33%)",
              }}
              className="w-8 h-8 text-white rounded-full flex items-center justify-center font-medium text-sm"
            >
              {index + 1}
            </div>

            {/* Option Input */}
            <input
              type="text"
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded-lg text-gray-900 bg-gray-100 text-base"
              placeholder={`Option ${index + 1}`}
            />

            <div className="flex items-center gap-4 min-w-[120px]">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name={`correct-${index}`}
                  value="yes"
                  checked={correctOptions[index] === true}
                  onChange={() => updateCorrectOption(index, "yes")}
                  className="w-4 h-4 text-purple-600 accent-purple-600"
                />
                <span className="text-gray-700 font-medium">Yes</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name={`correct-${index}`}
                  value="no"
                  checked={correctOptions[index] === false}
                  onChange={() => updateCorrectOption(index, "no")}
                  className="w-4 h-4 text-purple-600 accent-purple-600"
                />
                <span className="text-gray-700 font-medium">No</span>
              </label>
            </div>
          </div>
        ))}

        <button
          onClick={addOption}
          className="text-[#7451B6] border border-[#7451B6] px-4 py-2 rounded-lg text-sm font-medium mt-2"
        >
          + Add More option
        </button>
      </div>

      <div className="border w-full border-[#B6B6B6] my-8"></div>

      <div className="flex justify-end">
        <button
          style={{
            background:
              "linear-gradient(99.18deg, #8F64E1 -46.89%, #1D68BD 223.45%)",
          }}
          onClick={handleCreatePoll}
          className="text-white font-semibold py-3 px-8 rounded-full disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          disabled={
            !newQuestion.trim() || !newOptions.every((opt) => opt.trim())
          }
        >
          Ask Question
        </button>
      </div>
    </div>
  );
};

export default TeacherDashboard;
