<<<<<<< HEAD
import io from "socket.io-client";
=======

import io from 'socket.io-client';
>>>>>>> c33ea7f81ce8043e88a606d33c522dce0c0249d5

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

<<<<<<< HEAD
  connect(serverUrl = "https://polling-intervue-server.onrender.com/") {
=======
  connect(serverUrl = 'https://polling-intervue-server.onrender.com') {
>>>>>>> c33ea7f81ce8043e88a606d33c522dce0c0249d5
    if (!this.socket) {
      console.log("Connecting to server:", serverUrl);

      this.socket = io(serverUrl, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 5000,
      });

      this.socket.on("connect", () => {
        console.log("Connected to server");
        this.connected = true;
        this.reconnectAttempts = 0;
      });

      this.socket.on("disconnect", (reason) => {
        console.log("Disconnected from server:", reason);
        this.connected = false;
      });

      this.socket.on("connect_error", (error) => {
        console.error("Connection error:", error);
        this.reconnectAttempts++;
      });

      this.socket.on("reconnect", (attemptNumber) => {
        console.log("Reconnected after", attemptNumber, "attempts");
        this.connected = true;
      });

      this.socket.on("reconnect_failed", () => {
        console.error(
          "Failed to reconnect after",
          this.maxReconnectAttempts,
          "attempts"
        );
      });
    }

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log("Disconnecting from server");
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  // Connection status
  isConnected() {
    return this.connected && this.socket && this.socket.connected;
  }

  // Teacher methods
  joinTeacher() {
    if (this.socket) {
      console.log("Joining as teacher");
      this.socket.emit("join_teacher");
    }
  }

  createPoll(pollData) {
    if (this.socket && this.isConnected()) {
      console.log("Creating poll:", pollData);
      this.socket.emit("create_poll", pollData);
    } else {
      console.error("Cannot create poll - not connected to server");
    }
  }

  endPollManually() {
    if (this.socket && this.isConnected()) {
      console.log("Ending poll manually");
      this.socket.emit("end_poll_manually");
    }
  }

  // Student methods
  joinStudent(studentName) {
    if (this.socket && this.isConnected()) {
      console.log("Joining as student:", studentName);
      this.socket.emit("join_student", studentName);
    } else {
      console.error("Cannot join as student - not connected to server");
    }
  }

  submitAnswer(answer) {
    if (this.socket && this.isConnected()) {
      console.log("Submitting answer:", answer);
      this.socket.emit("submit_answer", { answer });
    } else {
      console.error("Cannot submit answer - not connected to server");
    }
  }

  // Event listeners
  onActivePoll(callback) {
    if (this.socket) {
      this.socket.on("active_poll", (data) => {
        console.log("Active poll received:", data);
        callback(data);
      });
    }
  }

  onNewPoll(callback) {
    if (this.socket) {
      this.socket.on("new_poll", (data) => {
        console.log("New poll received:", data);
        callback(data);
      });
    }
  }

  onPollResults(callback) {
    if (this.socket) {
      this.socket.on("poll_results", (data) => {
        console.log("Poll results received:", data);
        callback(data);
      });
    }
  }

  onPollEnded(callback) {
    if (this.socket) {
      this.socket.on("poll_ended", (data) => {
        console.log("Poll ended:", data);
        callback(data);
      });
    }
  }

  onPollCreated(callback) {
    if (this.socket) {
      this.socket.on("poll_created", (data) => {
        console.log("Poll created successfully:", data);
        callback(data);
      });
    }
  }

  onTimerUpdate(callback) {
    if (this.socket) {
      this.socket.on("timer_update", (timeLeft) => {
        callback(timeLeft);
      });
    }
  }

  onStudentsUpdate(callback) {
    if (this.socket) {
      this.socket.on("students_update", (students) => {
        console.log("Students updated:", students);
        callback(students);
      });
    }
  }

  joinChat(username, userRole) {
    if (this.socket && this.isConnected()) {
      console.log("Joining chat as:", username, "Role:", userRole);
      this.socket.emit("join_chat", { username, userRole });
    }
  }

  sendChatMessage(messageData) {
    if (this.socket && this.isConnected()) {
      console.log("Sending chat message:", messageData);
      this.socket.emit("send_chat_message", messageData);
    } else {
      console.error("Cannot send chat message - not connected to server");
    }
  }

  sendTypingIndicator(username) {
    if (this.socket && this.isConnected()) {
      this.socket.emit("typing", { username });
    }
  }

  stopTypingIndicator() {
    if (this.socket && this.isConnected()) {
      this.socket.emit("stop_typing");
    }
  }

  kickStudent(studentName) {
    if (this.socket && this.isConnected()) {
      console.log("Kicking student:", studentName);
      this.socket.emit("kick_student", { studentName });
    } else {
      console.error("Cannot kick student - not connected to server");
    }
  }

  onChatMessage(callback) {
    if (this.socket) {
      this.socket.on("chat_message", (data) => {
        console.log("Chat message received:", data);
        callback(data);
      });
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on("user_typing", (data) => {
        console.log("User typing:", data);
        callback(data);
      });
    }
  }

  onUserStoppedTyping(callback) {
    if (this.socket) {
      this.socket.on("user_stopped_typing", () => {
        console.log("User stopped typing");
        callback();
      });
    }
  }

  onStudentKicked(callback) {
    if (this.socket) {
      this.socket.on("student_kicked", (data) => {
        console.log("Student kicked:", data);
        callback(data);
      });
    }
  }

  onKickedFromSession(callback) {
    if (this.socket) {
      this.socket.on("kicked_from_session", (data) => {
        console.log("Kicked from session:", data);
        callback(data);
      });
    }
  }

  onUserJoinedChat(callback) {
    if (this.socket) {
      this.socket.on("user_joined_chat", (data) => {
        console.log("User joined chat:", data);
        callback(data);
      });
    }
  }

  onChatError(callback) {
    if (this.socket) {
      this.socket.on("chat_error", (error) => {
        console.error("Chat error:", error);
        callback(error);
      });
    }
  }

  onKickError(callback) {
    if (this.socket) {
      this.socket.on("kick_error", (error) => {
        console.error("Kick error:", error);
        callback(error);
      });
    }
  }

  onPollError(callback) {
    if (this.socket) {
      this.socket.on("poll_error", (error) => {
        console.error("Poll error:", error);
        callback(error);
      });
    }
  }

  onAnswerError(callback) {
    if (this.socket) {
      this.socket.on("answer_error", (error) => {
        console.error("Answer error:", error);
        callback(error);
      });
    }
  }

  onAnswerSubmitted(callback) {
    if (this.socket) {
      this.socket.on("answer_submitted", (data) => {
        console.log("Answer submitted successfully:", data);
        callback(data);
      });
    }
  }

  onConnect(callback) {
    if (this.socket) {
      this.socket.on("connect", callback);
    }
  }

  onDisconnect(callback) {
    if (this.socket) {
      this.socket.on("disconnect", callback);
    }
  }

  onConnectError(callback) {
    if (this.socket) {
      this.socket.on("connect_error", callback);
    }
  }

  onReconnect(callback) {
    if (this.socket) {
      this.socket.on("reconnect", callback);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      console.log("Removing all event listeners");
      this.socket.removeAllListeners();
    }
  }

  removeListener(event) {
    if (this.socket) {
      console.log("Removing listener for event:", event);
      this.socket.off(event);
    }
  }

  // Utility methods
  getSocket() {
    return this.socket;
  }

  forceReconnect() {
    if (this.socket) {
      console.log("Forcing reconnection");
      this.socket.disconnect();
      this.socket.connect();
    }
  }
}

const socketService = new SocketService();

export default socketService;
