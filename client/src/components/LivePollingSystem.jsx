
// import React from "react";
// import { useState, useEffect } from "react";
// import socketService from "../services/SocketService";
// import WelcomeScreen from "./WelcomeScreen";
// import StudentNameEntry from "./StudentNameEntry";
// import TeacherDashboard from "./TeacherDashboard";
// import StudentDashboard from "./StudentDashboard";
// import ActivePoll from "./ActivePoll";
// import PollResults from "./PollResults";
// import ChatComponent from './ChatComponent';

// const LivePollingSystem = () => {
//   const [currentView, setCurrentView] = useState("welcome");
//   const [userRole, setUserRole] = useState("");
//   const [studentName, setStudentName] = useState("");
//   const [isChatMinimized, setIsChatMinimized] = useState(true);
// const [kickedStudents, setKickedStudents] = useState(new Set());

//   // Poll states
//   const [activePoll, setActivePoll] = useState(null);
//   const [pollResults, setPollResults] = useState(null);
//   const [timeRemaining, setTimeRemaining] = useState(60);
//   const [hasAnswered, setHasAnswered] = useState(false);

//   // Teacher states
//   const [connectedStudents, setConnectedStudents] = useState([]);
//   const [error, setError] = useState("");

//   // Helper function to determine if current user is a student
//   const isStudent = () => {
//     return userRole === "student" || 
//            currentView === "student-dashboard" || 
//            currentView === "student-name" ||
//            (currentView === "poll" && userRole !== "teacher") ||
//            (currentView === "results" && userRole !== "teacher") ||
//            (userRole === "" && currentView !== "welcome" && currentView !== "teacher-dashboard");
//   };

//   useEffect(() => {
//     // Initialize socket connection
//     socketService.connect();

//     // Check if student name exists in sessionStorage
//     const savedName = sessionStorage.getItem("studentName");
//     if (savedName) {
//       setStudentName(savedName);
//     }

//     // Set up socket event listeners
//     setupSocketListeners();

//     // Cleanup on unmount
//     return () => {
//       socketService.removeAllListeners();
//       socketService.disconnect();
//     };
//   }, []);

//   const setupSocketListeners = () => {
//     socketService.onActivePoll((poll) => {
//       console.log("Received active poll:", poll, "User role:", userRole);
//       setActivePoll(poll);
//       setHasAnswered(poll.hasAnswered || false);
//       setTimeRemaining(poll.timeRemaining || 60);
      
//       // Clear previous results when new poll becomes active
//       setPollResults(null);
      
//       if (poll.hasAnswered) {
//         setCurrentView("results");
//       } else if (isStudent()) {
//         // Force student to poll view for active poll
//         setCurrentView("poll");
//       }
//     });

//     socketService.onNewPoll((poll) => {
//       console.log("Received new poll:", poll, "User role:", userRole, "Current view:", currentView);
//       setActivePoll(poll);
//       setHasAnswered(false); // Reset answered state for new poll
//       setTimeRemaining(poll.duration || 60);
//       setPollResults(null); // Clear previous results
      
//       // Force students to see new poll - use helper function
//       if (isStudent()) {
//         console.log("Redirecting to poll view - detected as student");
//         setCurrentView("poll");
//       }
//     });

//     socketService.onPollResults((results) => {
//       console.log("Received poll results:", results, "User role:", userRole, "Current view:", currentView);
//       setPollResults(results);
      
//       // Only automatically show results to:
//       // 1. Teachers (always)
//       // 2. Students who have answered the current poll
//       if (userRole === "teacher" || 
//           currentView === "teacher-dashboard" ||
//           (userRole === "student" && hasAnswered) ||
//           (currentView !== "welcome" && currentView !== "teacher-dashboard" && hasAnswered)) {
//         setCurrentView("results");
//       }
//       // Students who haven't answered stay in their current view
//     });

//     socketService.onPollEnded((results) => {
//       console.log("Poll ended:", results);
//       setPollResults(results);
//       setActivePoll(null); // Clear active poll when it ends
      
//       // Show results to everyone when poll officially ends
//       setCurrentView("results");
//     });

//     socketService.onTimerUpdate((time) => {
//       setTimeRemaining(time);
//     });

//     socketService.onStudentsUpdate((students) => {
//       setConnectedStudents(students);
//     });

//     socketService.onPollError((message) => {
//       setError(message);
//       setTimeout(() => setError(""), 5000);
//     });

//     socketService.onAnswerError((message) => {
//       setError(message);
//       setTimeout(() => setError(""), 5000);
//     });

//     socketService.onPollCreated((data) => {
//       console.log("Poll created:", data);
//       setError("");
//     });

//     socketService.onAnswerSubmitted((data) => {
//       console.log("Answer submitted successfully:", data);
//       setHasAnswered(true);
//     });







//     socketService.onKickedFromSession((data) => {
//     console.log('You have been kicked from the session:', data);
//     setError('You have been removed from the session by the teacher');
    
//     // Redirect to welcome screen after a delay
//     setTimeout(() => {
//       setCurrentView('welcome');
//       setUserRole('');
//       setStudentName('');
//       sessionStorage.removeItem('studentName');
//     }, 3000);
//   });

//   socketService.onStudentKicked((data) => {
//     console.log('Student was kicked:', data);
//     setKickedStudents(prev => new Set([...prev, data.studentName]));
//   });

//   socketService.onChatError((error) => {
//     setError(error);
//     setTimeout(() => setError(""), 5000);
//   });

//   socketService.onKickError((error) => {
//     setError(error);
//     setTimeout(() => setError(""), 5000);
//   });
//   };

//   const handleRoleSelection = (role) => {
//     setUserRole(role);
//     if (role === "teacher") {
//       socketService.joinTeacher();
//       setCurrentView("teacher-dashboard");
//     } else {
//       if (studentName) {
//         socketService.joinStudent(studentName);
//         setCurrentView("student-dashboard");
//       } else {
//         setCurrentView("student-name");
//       }
//     }
//   };

//   const handleStudentNameSubmit = (name) => {
//     sessionStorage.setItem("studentName", name);
//     setStudentName(name);
//     socketService.joinStudent(name);
//     setCurrentView("student-dashboard");
//   };

//   const handleCreatePoll = (pollData) => {
//     console.log("Creating poll:", pollData);
//     socketService.createPoll(pollData);
//   };

//   const handleSubmitAnswer = (answer) => {
//     console.log("Submitting answer:", answer);
//     socketService.submitAnswer(answer);
//     setHasAnswered(true);
//   };

//   const handleContinueToPoll = () => {
//     setCurrentView("poll");
//   };

//   const handleAskNewQuestion = () => {
//     if (userRole === 'teacher') {
//       setCurrentView('teacher-dashboard');
//       setPollResults(null);
//       setActivePoll(null);
//     }
//   };

//   const handleBackToDashboard = () => {
//     if (userRole === 'student') {
//       setCurrentView('student-dashboard');
//     } else if (userRole === 'teacher') {
//       setCurrentView('teacher-dashboard');
//     }
//   };







//   const handleToggleChat = () => {
//   setIsChatMinimized(!isChatMinimized);
// };


//   // Add debug logging for view and role changes
//   useEffect(() => {
//     console.log("Current view changed to:", currentView, "User role:", userRole);
//   }, [currentView, userRole]);

//   // Add a useEffect to ensure socket listeners are updated when userRole changes
//   useEffect(() => {
//     if (userRole) {
//       console.log("User role set to:", userRole, "Re-setting up listeners if needed");
//     }
//   }, [userRole]);


//   return (
//   <div className="relative">
//     {(() => {
//       switch (currentView) {
//         case "welcome":
//           return <WelcomeScreen onRoleSelect={handleRoleSelection} />;

//         case "student-name":
//           return <StudentNameEntry onNameSubmit={handleStudentNameSubmit} />;

//         case "teacher-dashboard":
//           return (
//             <>
//               <TeacherDashboard
//                 connectedStudents={connectedStudents}
//                 error={error}
//                 pollResults={pollResults}
//                 onCreatePoll={handleCreatePoll}
//               />
//                <ChatComponent
//                 userRole={userRole}
//                 studentName={studentName}
//                 connectedStudents={connectedStudents}
//                 socketService={socketService}
//                 isMinimized={isChatMinimized}
//                 onToggleMinimize={handleToggleChat}
//               />
//             </>
//           );

//         case "student-dashboard":
//           return (
//             <>
//               <StudentDashboard
//                 studentName={studentName}
//                 activePoll={activePoll}
//                 onContinueToPoll={handleContinueToPoll}
//               />
//               <ChatComponent
//                 userRole={userRole}
//                 studentName={studentName}
//                 connectedStudents={connectedStudents}
//                 socketService={socketService}
//                 isMinimized={isChatMinimized}
//                 onToggleMinimize={handleToggleChat}
//               />
//             </>
//           );

//         case "poll":
//           if (!activePoll) {
//             return (
//               <div className="min-h-screen bg-[#F2F2F2] p-6 flex justify-center items-center">
//                 <div className="text-center">
//                   <p className="text-lg text-[#373737]">No active poll found</p>
//                   <p className="text-sm text-[#6E6E6E]">Waiting for teacher to create a poll...</p>
//                   <button
//                     onClick={handleBackToDashboard}
//                     className="mt-4 px-4 py-2 bg-[#7765DA] text-white rounded-lg hover:opacity-90"
//                   >
//                     Back to Dashboard
//                   </button>
//                 </div>
//                 <ChatComponent
//                   userRole={userRole}
//                   studentName={studentName}
//                   connectedStudents={connectedStudents}
//                   socketService={socketService}
//                   isMinimized={isChatMinimized}
//                   onToggleMinimize={handleToggleChat}
//                 />
//               </div>
//             );
//           }
          
//           return (
//             <>
//               <ActivePoll
//                 activePoll={activePoll}
//                 timeRemaining={timeRemaining}
//                 hasAnswered={hasAnswered}
//                 onSubmitAnswer={handleSubmitAnswer}
//               />
//               <ChatComponent
//                 userRole={userRole}
//                 studentName={studentName}
//                 connectedStudents={connectedStudents}
//                 socketService={socketService}
//                 isMinimized={isChatMinimized}
//                 onToggleMinimize={handleToggleChat}
//               />
//             </>
//           );

//         case 'results':
//           return (
//             <>
//               <PollResults 
//                 results={pollResults} 
//                 isFullScreen={true} 
//                 userRole={userRole}
//                 onAskNewQuestion={handleAskNewQuestion}
//                 onBackToDashboard={handleBackToDashboard}
//               />
//               <ChatComponent
//                 userRole={userRole}
//                 studentName={studentName}
//                 connectedStudents={connectedStudents}
//                 socketService={socketService}
//                 isMinimized={isChatMinimized}
//                 onToggleMinimize={handleToggleChat}
//               />
//             </>
//           );

//         default:
//           return <WelcomeScreen onRoleSelect={handleRoleSelection} />;
//       }
//     })()}
    
//     {/* Error display */}
//     {error && (
//       <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
//         {error}
//       </div>
//     )}
//   </div>
// );
// };

// export default LivePollingSystem;

import React from "react";
import { useState, useEffect } from "react";
import socketService from "../services/SocketService";
import WelcomeScreen from "./WelcomeScreen";
import StudentNameEntry from "./StudentNameEntry";
import TeacherDashboard from "./TeacherDashboard";
import StudentDashboard from "./StudentDashboard";
import ActivePoll from "./ActivePoll";
import PollResults from "./PollResults";
import ChatComponent from './ChatComponent';
import KickedOutScreen from './KickedOutScreen'; // Add this import

const LivePollingSystem = () => {
  const [currentView, setCurrentView] = useState("welcome");
  const [userRole, setUserRole] = useState("");
  const [studentName, setStudentName] = useState("");
  const [isChatMinimized, setIsChatMinimized] = useState(true);
  const [kickedStudents, setKickedStudents] = useState(new Set());

  // Poll states
  const [activePoll, setActivePoll] = useState(null);
  const [pollResults, setPollResults] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [hasAnswered, setHasAnswered] = useState(false);

  // Teacher states
  const [connectedStudents, setConnectedStudents] = useState([]);
  const [error, setError] = useState("");

  // Helper function to determine if current user is a student
  const isStudent = () => {
    return userRole === "student" || 
           currentView === "student-dashboard" || 
           currentView === "student-name" ||
           (currentView === "poll" && userRole !== "teacher") ||
           (currentView === "results" && userRole !== "teacher") ||
           (userRole === "" && currentView !== "welcome" && currentView !== "teacher-dashboard");
  };

  useEffect(() => {
    // Initialize socket connection
    socketService.connect();

    // Check if student name exists in sessionStorage
    const savedName = sessionStorage.getItem("studentName");
    if (savedName) {
      setStudentName(savedName);
    }

    // Set up socket event listeners
    setupSocketListeners();

    // Cleanup on unmount
    return () => {
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, []);

  const setupSocketListeners = () => {
    socketService.onActivePoll((poll) => {
      console.log("Received active poll:", poll, "User role:", userRole);
      setActivePoll(poll);
      setHasAnswered(poll.hasAnswered || false);
      setTimeRemaining(poll.timeRemaining || 60);
      
      // Clear previous results when new poll becomes active
      setPollResults(null);
      
      if (poll.hasAnswered) {
        setCurrentView("results");
      } else if (isStudent()) {
        // Force student to poll view for active poll
        setCurrentView("poll");
      }
    });

    socketService.onNewPoll((poll) => {
      console.log("Received new poll:", poll, "User role:", userRole, "Current view:", currentView);
      setActivePoll(poll);
      setHasAnswered(false); // Reset answered state for new poll
      setTimeRemaining(poll.duration || 60);
      setPollResults(null); // Clear previous results
      
      // Force students to see new poll - use helper function
      if (isStudent()) {
        console.log("Redirecting to poll view - detected as student");
        setCurrentView("poll");
      }
    });

    socketService.onPollResults((results) => {
      console.log("Received poll results:", results, "User role:", userRole, "Current view:", currentView);
      setPollResults(results);
      
      // Only automatically show results to:
      // 1. Teachers (always)
      // 2. Students who have answered the current poll
      if (userRole === "teacher" || 
          currentView === "teacher-dashboard" ||
          (userRole === "student" && hasAnswered) ||
          (currentView !== "welcome" && currentView !== "teacher-dashboard" && hasAnswered)) {
        setCurrentView("results");
      }
      // Students who haven't answered stay in their current view
    });

    socketService.onPollEnded((results) => {
      console.log("Poll ended:", results);
      setPollResults(results);
      setActivePoll(null); // Clear active poll when it ends
      
      // Show results to everyone when poll officially ends
      setCurrentView("results");
    });

    socketService.onTimerUpdate((time) => {
      setTimeRemaining(time);
    });

    socketService.onStudentsUpdate((students) => {
      setConnectedStudents(students);
    });

    socketService.onPollError((message) => {
      setError(message);
      setTimeout(() => setError(""), 5000);
    });

    socketService.onAnswerError((message) => {
      setError(message);
      setTimeout(() => setError(""), 5000);
    });

    socketService.onPollCreated((data) => {
      console.log("Poll created:", data);
      setError("");
    });

    socketService.onAnswerSubmitted((data) => {
      console.log("Answer submitted successfully:", data);
      setHasAnswered(true);
    });

    // Modified kick handler - redirect to kicked-out view instead of welcome
    socketService.onKickedFromSession((data) => {
      console.log('You have been kicked from the session:', data);
      setError('You have been removed from the session by the teacher');
      
      // Redirect to kicked-out screen instead of welcome
      setCurrentView('kicked-out');
      setUserRole('');
      // Keep studentName for display purposes, clear sessionStorage
      sessionStorage.removeItem('studentName');
    });

    socketService.onStudentKicked((data) => {
      console.log('Student was kicked:', data);
      setKickedStudents(prev => new Set([...prev, data.studentName]));
    });

    socketService.onChatError((error) => {
      setError(error);
      setTimeout(() => setError(""), 5000);
    });

    socketService.onKickError((error) => {
      setError(error);
      setTimeout(() => setError(""), 5000);
    });
  };

  const handleRoleSelection = (role) => {
    setUserRole(role);
    if (role === "teacher") {
      socketService.joinTeacher();
      setCurrentView("teacher-dashboard");
    } else {
      if (studentName) {
        socketService.joinStudent(studentName);
        setCurrentView("student-dashboard");
      } else {
        setCurrentView("student-name");
      }
    }
  };

  const handleStudentNameSubmit = (name) => {
    sessionStorage.setItem("studentName", name);
    setStudentName(name);
    socketService.joinStudent(name);
    setCurrentView("student-dashboard");
  };

  const handleCreatePoll = (pollData) => {
    console.log("Creating poll:", pollData);
    socketService.createPoll(pollData);
  };

  const handleSubmitAnswer = (answer) => {
    console.log("Submitting answer:", answer);
    socketService.submitAnswer(answer);
    setHasAnswered(true);
  };

  const handleContinueToPoll = () => {
    setCurrentView("poll");
  };

  const handleAskNewQuestion = () => {
    if (userRole === 'teacher') {
      setCurrentView('teacher-dashboard');
      setPollResults(null);
      setActivePoll(null);
    }
  };

  const handleBackToDashboard = () => {
    if (userRole === 'student') {
      setCurrentView('student-dashboard');
    } else if (userRole === 'teacher') {
      setCurrentView('teacher-dashboard');
    }
  };

  // New handler for returning to welcome from kicked-out screen
  const handleReturnToWelcome = () => {
    setCurrentView('welcome');
    setUserRole('');
    setStudentName('');
    setActivePoll(null);
    setPollResults(null);
    setHasAnswered(false);
    setError('');
  };

  const handleToggleChat = () => {
    setIsChatMinimized(!isChatMinimized);
  };

  // Add debug logging for view and role changes
  useEffect(() => {
    console.log("Current view changed to:", currentView, "User role:", userRole);
  }, [currentView, userRole]);

  // Add a useEffect to ensure socket listeners are updated when userRole changes
  useEffect(() => {
    if (userRole) {
      console.log("User role set to:", userRole, "Re-setting up listeners if needed");
    }
  }, [userRole]);

  return (
    <div className="relative">
      {(() => {
        switch (currentView) {
          case "welcome":
            return <WelcomeScreen onRoleSelect={handleRoleSelection} />;

          case "student-name":
            return <StudentNameEntry onNameSubmit={handleStudentNameSubmit} />;

          case "kicked-out":
            return <KickedOutScreen onReturnToWelcome={handleReturnToWelcome} />;

          case "teacher-dashboard":
            return (
              <>
                <TeacherDashboard
                  connectedStudents={connectedStudents}
                  error={error}
                  pollResults={pollResults}
                  onCreatePoll={handleCreatePoll}
                />
                <ChatComponent
                  userRole={userRole}
                  studentName={studentName}
                  connectedStudents={connectedStudents}
                  socketService={socketService}
                  isMinimized={isChatMinimized}
                  onToggleMinimize={handleToggleChat}
                />
              </>
            );

          case "student-dashboard":
            return (
              <>
                <StudentDashboard
                  studentName={studentName}
                  activePoll={activePoll}
                  onContinueToPoll={handleContinueToPoll}
                />
                <ChatComponent
                  userRole={userRole}
                  studentName={studentName}
                  connectedStudents={connectedStudents}
                  socketService={socketService}
                  isMinimized={isChatMinimized}
                  onToggleMinimize={handleToggleChat}
                />
              </>
            );

          case "poll":
            if (!activePoll) {
              return (
                <div className="min-h-screen bg-[#F2F2F2] p-6 flex justify-center items-center">
                  <div className="text-center">
                    <p className="text-lg text-[#373737]">No active poll found</p>
                    <p className="text-sm text-[#6E6E6E]">Waiting for teacher to create a poll...</p>
                    <button
                      onClick={handleBackToDashboard}
                      className="mt-4 px-4 py-2 bg-[#7765DA] text-white rounded-lg hover:opacity-90"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                  <ChatComponent
                    userRole={userRole}
                    studentName={studentName}
                    connectedStudents={connectedStudents}
                    socketService={socketService}
                    isMinimized={isChatMinimized}
                    onToggleMinimize={handleToggleChat}
                  />
                </div>
              );
            }
            
            return (
              <>
                <ActivePoll
                  activePoll={activePoll}
                  timeRemaining={timeRemaining}
                  hasAnswered={hasAnswered}
                  onSubmitAnswer={handleSubmitAnswer}
                />
                <ChatComponent
                  userRole={userRole}
                  studentName={studentName}
                  connectedStudents={connectedStudents}
                  socketService={socketService}
                  isMinimized={isChatMinimized}
                  onToggleMinimize={handleToggleChat}
                />
              </>
            );

          case 'results':
            return (
              <>
                <PollResults 
                  results={pollResults} 
                  isFullScreen={true} 
                  userRole={userRole}
                  onAskNewQuestion={handleAskNewQuestion}
                  onBackToDashboard={handleBackToDashboard}
                />
                <ChatComponent
                  userRole={userRole}
                  studentName={studentName}
                  connectedStudents={connectedStudents}
                  socketService={socketService}
                  isMinimized={isChatMinimized}
                  onToggleMinimize={handleToggleChat}
                />
              </>
            );

          default:
            return <WelcomeScreen onRoleSelect={handleRoleSelection} />;
        }
      })()}
      
      {/* Error display */}
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}
    </div>
  );
};

export default LivePollingSystem;