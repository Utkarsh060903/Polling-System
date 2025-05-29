#  Live Polling System

## Features

###  Teacher Features
- **Create New Polls**: Teachers can create engaging polls with custom questions
- **Live Results Dashboard**: Real-time visualization of polling results as students respond
- **Smart Poll Management**: New questions can only be asked when no active poll exists or all students have responded
- **Configurable Time Limits**: Set maximum response time for each poll (Good to have feature)
- **Student Management**: Ability to kick students from the session (Good to have feature)
- *Interactive Chat**: Built-in chat system for real-time communication with students

### Student Features
- **Unique Identity**: Enter name on first visit (persisted per browser tab)
- **Session Persistence**: Refresh-friendly - redirects to welcome page but maintains progress when clicking "Student"
- **Quick Response**: Submit answers to active polls instantly
- **Live Results Access**: View polling results immediately after submitting answers
- **Auto-timeout**: 60-second maximum response time with automatic result display
- **Student Chat**: Participate in discussions with teacher and other students

## Technology Stack

### Frontend
- **React.js**
- **Socket.io Client**
- **Modern CSS/Styling**

### Backend
- **Express.js**
- **Socket.io**
- **Node.js**

## Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/utkarsh060903/polling-system.git
   ```

2. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd client
   npm install
   ```

4. **Start the Backend Server**
   ```bash
   cd server
   node index.js
   ```

5. **Start the Frontend Application**
   ```bash
   cd client
   npm run dev
   ```

6. **Access the Application**
   - Open your browser and navigate to `http://localhost:5173`
   - Choose your role: Teacher or Student
