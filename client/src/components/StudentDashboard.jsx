import React from "react";
import sparkleSVG from "../assets/sparkle.svg";

const StudentDashboard = ({ studentName, activePoll, onContinueToPoll }) => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white text-center">
      {!activePoll ? (
        <>
          {/* Intervue Poll Button */}
          <button
            disabled
            style={{
              background: "linear-gradient(90deg, #7565D9 0%, #4D0ACD 100%)",
            }}
            className="mb-6 px-4 py-1 flex gap-2 items-center rounded-full text-sm font-medium text-white shadow-md"
          >
            <img src={sparkleSVG} alt="sparkle" className="w-4 h-4" />
            Intervue Poll
          </button>

          {/* Spinner */}
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#5E3BEE] border-t-transparent mb-6"></div>

          {/* Message */}
          <p className="text-lg font-semibold text-black">
            Wait for the teacher to ask questions..
          </p>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Poll is ready!
          </h3>
          <p className="text-gray-600">
            Click continue to participate in the poll.
          </p>
          <button
            onClick={onContinueToPoll}
            className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Continue to Poll
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
