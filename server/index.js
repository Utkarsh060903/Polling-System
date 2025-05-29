import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import 'dotenv/config';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected successfully.');
})
.catch((err) => {
  console.error('MongoDB connection error:', err.message);
});


// Schema
const pollSchema = new mongoose.Schema({
  question: String,
  options: [String],
  responses: [{
    studentName: String,
    answer: String,
    timestamp: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Poll = mongoose.model('Poll', pollSchema);

// In-memory state
let activePoll = null;
let connectedStudents = new Set();
let pollTimer = null;

// Socket.IO
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_teacher', () => {
    socket.join('teachers');
    socket.isTeacher = true; // Mark this socket as teacher
    console.log('Teacher joined');
    
    // Send current state to teacher
    socket.emit('students_update', Array.from(connectedStudents));
    
    if (activePoll) {
      const results = calculateResults();
      socket.emit('active_poll', activePoll);
      socket.emit('poll_results', results);
    }
  });

  socket.on('join_student', (studentName) => {
    socket.studentName = studentName;
    socket.join('students');
    socket.isStudent = true; // Mark this socket as student
    connectedStudents.add(studentName);
    console.log('Student joined:', studentName);

    // Update all teachers with new student list
    io.to('teachers').emit('students_update', Array.from(connectedStudents));

    // Send active poll to newly joined student
    if (activePoll && activePoll.isActive) {
      const hasAnswered = activePoll.responses.some(r => r.studentName === studentName);
      console.log(`Sending active poll to ${studentName}, hasAnswered: ${hasAnswered}`);
      
      socket.emit('active_poll', {
        ...activePoll,
        hasAnswered,
        timeRemaining: activePoll.timeRemaining || 0
      });
      
      // If student hasn't answered, send new_poll to trigger poll view
      if (!hasAnswered) {
        socket.emit('new_poll', {
          ...activePoll,
          hasAnswered: false,
          timeRemaining: activePoll.timeRemaining || 0
        });
      }
    }
  });

  socket.on('create_poll', async (pollData) => {
    try {
      console.log('Creating new poll:', pollData);
      
      // Clear any existing poll and timer
      clearExistingTimer();
      
      if (activePoll) {
        // Mark previous poll as inactive in database
        await Poll.findByIdAndUpdate(activePoll._id, { isActive: false });
        console.log('Previous poll marked as inactive');
      }

      const newPoll = new Poll({
        question: pollData.question,
        options: pollData.options,
        responses: []
      });

      await newPoll.save();

      activePoll = {
        _id: newPoll._id,
        question: pollData.question,
        options: pollData.options,
        responses: [],
        isActive: true,
        timeRemaining: 60,
        duration: 60
      };

      console.log('New poll created and saved to memory:', activePoll);

      // First, notify teachers that poll was created successfully
      io.to('teachers').emit('poll_created', activePoll);
      
      // Then notify all students of new poll - this is the key fix
      console.log('Sending new poll to all students...');
      io.to('students').emit('new_poll', {
        ...activePoll,
        hasAnswered: false
      });
      
      // Also emit to all sockets (fallback)
      io.emit('new_poll_broadcast', {
        ...activePoll,
        hasAnswered: false
      });

      // Start the timer after everything is set up
      startPollTimer();
      
      console.log('Poll creation process completed');
      
    } catch (error) {
      console.error('Error creating poll:', error);
      socket.emit('poll_error', 'Failed to create poll. Please try again.');
    }
  });

  socket.on('submit_answer', async ({ answer }) => {
    if (!activePoll || !socket.studentName) {
      socket.emit('answer_error', 'No active poll or invalid student');
      return;
    }

    try {
      const alreadyAnswered = activePoll.responses.find(r => r.studentName === socket.studentName);
      if (alreadyAnswered) {
        socket.emit('answer_error', 'You have already answered this question');
        return;
      }

      const response = {
        studentName: socket.studentName,
        answer,
        timestamp: new Date()
      };

      activePoll.responses.push(response);

      // Update database
      await Poll.findByIdAndUpdate(activePoll._id, {
        $push: { responses: response }
      });

      console.log(`Answer submitted by ${socket.studentName}: ${answer}`);

      // Notify student that answer was submitted successfully
      socket.emit('answer_submitted', { answer });

      // Send updated results to everyone
      const results = calculateResults();
      io.emit('poll_results', results);

      // Check if all students have answered
      if (allStudentsAnswered()) {
        console.log('All students have answered, ending poll');
        endPoll();
      }

    } catch (error) {
      console.error('Error submitting answer:', error);
      socket.emit('answer_error', 'Failed to submit answer. Please try again.');
    }
  });

  socket.on('end_poll_manually', () => {
    if (activePoll) {
      console.log('Poll ended manually by teacher');
      endPoll();
    }
  });












  socket.on('join_chat', (data) => {
  console.log('User joined chat:', data.username, 'Role:', data.userRole);
  
  // Broadcast to others that user joined chat
  socket.broadcast.emit('user_joined_chat', {
    username: data.username,
    userRole: data.userRole,
    timestamp: new Date()
  });
});

socket.on('send_chat_message', (messageData) => {
  if (!messageData.message || !messageData.username) {
    socket.emit('chat_error', 'Invalid message data');
    return;
  }

  console.log('Chat message from', messageData.username, ':', messageData.message);

  // Broadcast message to all connected clients
  io.emit('chat_message', {
    username: messageData.username,
    message: messageData.message,
    timestamp: messageData.timestamp || new Date(),
    userRole: messageData.userRole
  });
});

socket.on('typing', (data) => {
  if (data.username) {
    // Broadcast typing indicator to others
    socket.broadcast.emit('user_typing', {
      username: data.username
    });
  }
});

socket.on('stop_typing', () => {
  // Broadcast stop typing to others
  socket.broadcast.emit('user_stopped_typing');
});

socket.on('kick_student', (data) => {
  // Only teachers can kick students
  if (!socket.isTeacher) {
    socket.emit('kick_error', 'Only teachers can kick students');
    return;
  }

  const { studentName } = data;
  if (!studentName) {
    socket.emit('kick_error', 'Student name is required');
    return;
  }

  console.log('Teacher attempting to kick student:', studentName);

  // Find the student socket
  const studentSocket = Array.from(io.sockets.sockets.values())
    .find(s => s.studentName === studentName && s.isStudent);

  if (studentSocket) {
    // Remove student from connected students
    connectedStudents.delete(studentName);

    // Notify the student they've been kicked
    studentSocket.emit('kicked_from_session', {
      reason: 'Removed by teacher',
      timestamp: new Date()
    });

    // Broadcast to all users that student was kicked
    io.emit('student_kicked', {
      studentName: studentName,
      timestamp: new Date()
    });

    // Update teachers with new student list
    io.to('teachers').emit('students_update', Array.from(connectedStudents));

    // Disconnect the student
    setTimeout(() => {
      studentSocket.disconnect(true);
    }, 1000);

    console.log('Student kicked successfully:', studentName);
  } else {
    socket.emit('kick_error', 'Student not found or already disconnected');
  }
});

// Add this handler for when students are kicked
socket.on('kicked_from_session', () => {
  console.log('Student received kick notification');
});

  socket.on('disconnect', () => {
    if (socket.studentName) {
      connectedStudents.delete(socket.studentName);
      io.to('teachers').emit('students_update', Array.from(connectedStudents));
      console.log('Student disconnected:', socket.studentName);
    }
    console.log('User disconnected:', socket.id);
  });
});

// Helper Functions
function startPollTimer() {
  let timeLeft = 60;
  
  console.log('Starting poll timer: 60 seconds');

  pollTimer = setInterval(() => {
    timeLeft--;
    
    if (activePoll) {
      activePoll.timeRemaining = timeLeft;
    }
    
    // Send timer update to all connected clients
    io.emit('timer_update', timeLeft);

    if (timeLeft <= 0) {
      console.log('Poll timer expired');
      endPoll();
    }
  }, 1000);
}

function clearExistingTimer() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
    console.log('Poll timer cleared');
  }
}

async function endPoll() {
  clearExistingTimer();
  
  if (activePoll) {
    console.log('Ending poll:', activePoll.question);
    
    // Mark poll as inactive in database
    try {
      await Poll.findByIdAndUpdate(activePoll._id, { isActive: false });
    } catch (error) {
      console.error('Error updating poll status:', error);
    }
    
    activePoll.isActive = false;
    const finalResults = calculateResults();
    
    // Send final results to everyone
    io.emit('poll_ended', finalResults);
    io.emit('poll_results', finalResults);
    
    console.log('Poll ended. Final results:', finalResults.summary);
    
    // Reset active poll after sending results
    // Don't set activePoll to null immediately to allow students to see results
  }
}

function allStudentsAnswered() {
  if (!activePoll || connectedStudents.size === 0) {
    return false;
  }
  return activePoll.responses.length >= connectedStudents.size;
}

function calculateResults() {
  if (!activePoll) return null;
  
  const summary = {};
  activePoll.options.forEach(opt => {
    summary[opt] = activePoll.responses.filter(r => r.answer === opt).length;
  });
  
  return {
    question: activePoll.question,
    options: activePoll.options,
    responses: activePoll.responses,
    summary,
    totalResponses: activePoll.responses.length,
    totalStudents: connectedStudents.size,
    isActive: activePoll.isActive
  };
}

// REST API
app.get('/api/polls', async (req, res) => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 });
    res.json(polls);
  } catch (error) {
    console.error('Error fetching polls:', error);
    res.status(500).json({ error: 'Error fetching polls' });
  }
});

app.get('/api/active-poll', (req, res) => {
  const results = activePoll ? calculateResults() : null;
  res.json({
    activePoll: activePoll || null,
    results: results,
    connectedStudents: Array.from(connectedStudents)
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    activePoll: activePoll ? activePoll.question : null,
    connectedStudents: connectedStudents.size
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});