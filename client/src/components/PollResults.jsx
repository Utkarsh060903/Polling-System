import React from "react";

const PollResults = ({
  results,
  isFullScreen = false,
  userRole = "student",
  onAskNewQuestion,
}) => {
  if (!results) return null;

  const handleAskNew = () => {
    if (onAskNewQuestion) onAskNewQuestion();
  };

  const ResultsContent = () => (
    <div className="space-y-6 p-4">
      <div className="rounded-md overflow-hidden shadow-sm">
        <div className="bg-[#373737] text-white px-4 py-2 rounded-t-md text-sm">
          {results.question}
        </div>
        <div className="bg-white border border-[#7765DA] rounded-b-md p-4 space-y-4">
          {Object.entries(results.summary).map(([option, votes], index) => {
            const percentage =
              results.responses.length > 0
                ? Math.round((votes / results.responses.length) * 100)
                : 0;

            return (
              <div key={option} className="relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[#373737] font-medium">
                    <span className="inline-block w-5 h-5 mr-2 bg-[#F2F2F2] text-[#7765DA] rounded-full text-center text-xs font-bold">
                      {index + 1}
                    </span>
                    {option}
                  </span>
                  <span className="text-sm text-[#373737] font-medium">
                    {percentage}%
                  </span>
                </div>
                <div className="w-full bg-[#F2F2F2] h-6 rounded-full overflow-hidden">
                  <div
                    className="h-6 bg-[#7765DA] transition-all duration-1000"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-sm text-[#6E6E6E]">
        <p>Total responses: {results.responses.length}</p>
        {results.responses.length > 0 && (
          <>
            <p className="text-xs text-[#6E6E6E] mt-2 mb-1">Responses from:</p>
            <div className="flex flex-wrap gap-1">
              {results.responses.map((response, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-[#F2F2F2] px-2 py-1 rounded text-[#373737]"
                >
                  {response.studentName}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {userRole === "teacher" && (
        <button
          onClick={handleAskNew}
          style={{
            background:
              "linear-gradient(99.18deg, #8F64E1 -46.89%, #1D68BD 223.45%)",
          }}
          className="text-white text-sm px-5 py-2 rounded-full font-medium hover:opacity-90 end"
        >
          + Ask a new question
        </button>
      )}
    </div>
  );

  if (isFullScreen) {
    return (
      <div className="min-h-screen bg-[#F2F2F2] p-6 flex justify-center items-center">
        <div className="w-full max-w-xl">
          <ResultsContent />
        </div>
      </div>
    );
  }

  return <ResultsContent />;
};

export default PollResults;
