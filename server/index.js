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
  correct: [Boolean],
  timeLimit: { type: Number, default: 60 },
  responses: [{
    studentName: String,
    answer: String,
    isCorrect: Boolean,
    timestamp: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Poll = mongoose.model('Poll', pollSchema);


let activePoll = null;
let connectedStudents = new Set();
let pollTimer = null;


io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_teacher', () => {
    socket.join('teachers');
    socket.isTeacher = true;
    console.log('Teacher joined');
    

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
    socket.isStudent = true;
    connectedStudents.add(studentName);
    console.log('Student joined:', studentName);

    io.to('teachers').emit('students_update', Array.from(connectedStudents));

    if (activePoll && activePoll.isActive) {
      const hasAnswered = activePoll.responses.some(r => r.studentName === studentName);
      console.log(`Sending active poll to ${studentName}, hasAnswered: ${hasAnswered}`);
      
      socket.emit('active_poll', {
        ...activePoll,
        hasAnswered,
        timeRemaining: activePoll.timeRemaining || 0
      });

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
      
      clearExistingTimer();
      
      if (activePoll) {
        await Poll.findByIdAndUpdate(activePoll._id, { isActive: false });
        console.log('Previous poll marked as inactive');
      }

      // Extract and validate time limit
      const timeLimit = parseInt(pollData.timeLimit) || 60;
      console.log(`Poll time limit set to: ${timeLimit} seconds`);

      const newPoll = new Poll({
        question: pollData.question,
        options: pollData.options,
        correct: pollData.correct || [],
        timeLimit: timeLimit,
        responses: []
      });

      await newPoll.save();

      activePoll = {
        _id: newPoll._id,
        question: pollData.question,
        options: pollData.options,
        correct: pollData.correct || [],
        timeLimit: timeLimit,
        responses: [],
        isActive: true,
        timeRemaining: timeLimit,
        duration: timeLimit
      };

      console.log(`New poll created with ${timeLimit} seconds timer:`, activePoll.question);

      io.to('teachers').emit('poll_created', activePoll);
      
<<<<<<< HEAD

=======
      // Then notify all students of new poll
>>>>>>> c33ea7f81ce8043e88a606d33c522dce0c0249d5
      console.log('Sending new poll to all students...');
      io.to('students').emit('new_poll', {
        ...activePoll,
        hasAnswered: false
      });
      

      io.emit('new_poll_broadcast', {
        ...activePoll,
        hasAnswered: false
      });

<<<<<<< HEAD

      startPollTimer();
=======
      // Start the timer with the specified duration
      startPollTimer(timeLimit);
>>>>>>> c33ea7f81ce8043e88a606d33c522dce0c0249d5
      
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

      // Check if answer is correct
      const answerIndex = activePoll.options.indexOf(answer);
      const isCorrect = answerIndex !== -1 && activePoll.correct && activePoll.correct[answerIndex] === true;

      const response = {
        studentName: socket.studentName,
        answer,
        isCorrect,
        timestamp: new Date()
      };

      activePoll.responses.push(response);

      await Poll.findByIdAndUpdate(activePoll._id, {
        $push: { responses: response }
      });

      console.log(`Answer submitted by ${socket.studentName}: ${answer} (${isCorrect ? 'Correct' : 'Incorrect'})`);

<<<<<<< HEAD
      socket.emit('answer_submitted', { answer });
=======
      // Notify student that answer was submitted successfully
      socket.emit('answer_submitted', { answer, isCorrect });
>>>>>>> c33ea7f81ce8043e88a606d33c522dce0c0249d5

      const results = calculateResults();
      io.emit('poll_results', results);

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

  // Chat functionality
  socket.on('join_chat', (data) => {
<<<<<<< HEAD
  console.log('User joined chat:', data.username, 'Role:', data.userRole);
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

  io.emit('chat_message', {
    username: messageData.username,
    message: messageData.message,
    timestamp: messageData.timestamp || new Date(),
    userRole: messageData.userRole
  });
});

socket.on('typing', (data) => {
  if (data.username) {
    socket.broadcast.emit('user_typing', {
      username: data.username
    });
  }
});

socket.on('stop_typing', () => {
  socket.broadcast.emit('user_stopped_typing');
});

socket.on('kick_student', (data) => {
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


  const studentSocket = Array.from(io.sockets.sockets.values())
    .find(s => s.studentName === studentName && s.isStudent);

  if (studentSocket) {

    connectedStudents.delete(studentName);


    studentSocket.emit('kicked_from_session', {
      reason: 'Removed by teacher',
=======
    console.log('User joined chat:', data.username, 'Role:', data.userRole);
    
    // Broadcast to others that user joined chat
    socket.broadcast.emit('user_joined_chat', {
      username: data.username,
      userRole: data.userRole,
>>>>>>> c33ea7f81ce8043e88a606d33c522dce0c0249d5
      timestamp: new Date()
    });
  });

<<<<<<< HEAD

    io.emit('student_kicked', {
      studentName: studentName,
      timestamp: new Date()
=======
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
>>>>>>> c33ea7f81ce8043e88a606d33c522dce0c0249d5
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

<<<<<<< HEAD
socket.on('kicked_from_session', () => {
  console.log('Student received kick notification');
});
=======
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
>>>>>>> c33ea7f81ce8043e88a606d33c522dce0c0249d5

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
function startPollTimer(duration = 60) {
  let timeLeft = duration;
  
  console.log(`Starting poll timer: ${duration} seconds`);

  pollTimer = setInterval(() => {
    timeLeft--;
    
    if (activePoll) {
      activePoll.timeRemaining = timeLeft;
    }
    
    io.emit('timer_update', timeLeft);

    console.log(`Poll timer: ${timeLeft} seconds remaining`);

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
    
    try {
      await Poll.findByIdAndUpdate(activePoll._id, { isActive: false });
    } catch (error) {
      console.error('Error updating poll status:', error);
    }
    
    activePoll.isActive = false;
    const finalResults = calculateResults();
    
    io.emit('poll_ended', finalResults);
    io.emit('poll_results', finalResults);
    
    console.log('Poll ended. Final results:', finalResults.summary);
    console.log(`Total responses: ${finalResults.totalResponses}/${finalResults.totalStudents}`);
    
<<<<<<< HEAD
=======
    // Reset active poll after a delay to allow students to see results
    setTimeout(() => {
      console.log('Clearing active poll from memory');
    }, 5000);
>>>>>>> c33ea7f81ce8043e88a606d33c522dce0c0249d5
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
  const correctAnswers = {};
  
  // Initialize counters
  activePoll.options.forEach((opt, index) => {
    summary[opt] = 0;
    correctAnswers[opt] = activePoll.correct && activePoll.correct[index] === true;
  });
  
  // Count responses
  activePoll.responses.forEach(response => {
    if (summary.hasOwnProperty(response.answer)) {
      summary[response.answer]++;
    }
  });
  
  // Calculate accuracy statistics
  const correctResponsesCount = activePoll.responses.filter(r => r.isCorrect).length;
  const accuracy = activePoll.responses.length > 0 
    ? Math.round((correctResponsesCount / activePoll.responses.length) * 100) 
    : 0;
  
  return {
    question: activePoll.question,
    options: activePoll.options,
    correct: activePoll.correct,
    responses: activePoll.responses,
    summary,
    correctAnswers,
    totalResponses: activePoll.responses.length,
    totalStudents: connectedStudents.size,
    correctResponsesCount,
    accuracy,
    isActive: activePoll.isActive,
    timeLimit: activePoll.timeLimit,
    timeRemaining: activePoll.timeRemaining
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

app.get('/api/poll/:id', async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    res.json(poll);
  } catch (error) {
    console.error('Error fetching poll:', error);
    res.status(500).json({ error: 'Error fetching poll' });
  }
});

app.delete('/api/poll/:id', async (req, res) => {
  try {
    const poll = await Poll.findByIdAndDelete(req.params.id);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    res.json({ message: 'Poll deleted successfully' });
  } catch (error) {
    console.error('Error deleting poll:', error);
    res.status(500).json({ error: 'Error deleting poll' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    activePoll: activePoll ? {
      question: activePoll.question,
      timeRemaining: activePoll.timeRemaining,
      timeLimit: activePoll.timeLimit,
      responses: activePoll.responses.length
    } : null,
    connectedStudents: connectedStudents.size,
    serverUptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO ready for connections`);
});