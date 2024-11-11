Listen And Learn - Text-to-Video Generator
A full-stack application that generates video content from a text prompt. This project consists of a backend built with Node.js and Express that handles text generation and video processing, and a frontend built with React, providing a user-friendly interface with dark mode and 3D visual effects.

Table of Contents
Features
Tech Stack
Prerequisites
Installation
Backend Overview
Frontend Overview
Usage
How It Works
Project Structure
Known Issues
Future Enhancements
License
Features

AI-Powered Text Generation: Generates responses to user prompts using OpenAI's GPT-3.5-turbo.
Text-to-Speech and Video Creation: Converts text responses into speech and combines them with dynamic subtitles to create video content.
Dark Mode Support: Toggle dark/light themes for the interface.
Three.js Visual Effects: 3D star background for a visually engaging experience.
Tech Stack
Backend
Node.js and Express
OpenAI API for text generation
FFmpeg for video and audio processing
dotenv, cors, fluent-ffmpeg, say
Frontend
React with functional components and hooks
Material-UI for component styling
Three.js for 3D graphics
Axios for API requests
Prerequisites
Node.js (v14 or later)
FFmpeg
OpenAI API Key
Installation
1. Clone the Repository
bash

git clone https://github.com/your-username/ListenAndLearn.git
cd ListenAndLearn
2. Install Backend and Frontend Dependencies
bash

# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install
3. Set Up Environment Variables
Create a .env file in the Backend directory and add your OpenAI API key:

env
OPENAI_API_KEY=your_openai_api_key
PORT=5000  # Optional, defaults to 5000
Backend Overview
The backend is responsible for processing text prompts, generating text responses with OpenAI, converting the text to speech, and creating a video file with synchronized subtitles.

Key Files and Functions
index.js: Sets up the Express server and handles routes.
generateAudioFromText: Converts text to .wav audio using the say library.
generateVideoFromTextAndAudio: Uses FFmpeg to create a video with dynamic subtitles.
API Endpoint
POST /api/generate: Accepts a text prompt and returns a generated video file.
Frontend Overview
The frontend is a React application with a user-friendly interface that allows users to enter a text prompt and receive a video response.

Key Features
Responsive Layout: Optimized for various screen sizes.
3D Background: Animated starry background using Three.js.
Dark Mode: Toggle between light and dark themes.
Main Components
App.js: Contains the main interface, form handling, and video display.
Material-UI Styling: Uses custom styles for TextField and Button components.
Usage
Starting the Server
Backend: Run the following commands from the Backend directory:

bash
node index.js
Frontend: In a new terminal, navigate to the Frontend directory and run:

bash
npm start
Open http://localhost:3000 in a browser to access the application.

Submitting a Prompt
Enter a prompt in the text field.
Click "Generate Video".
Wait for the video to be generated and displayed below.
How It Works
Frontend: The user enters a text prompt, which is sent to the backend.
Backend:
Generates a text response with OpenAI's API.
Converts the response text to audio.
Creates a video with synchronized text subtitles.
Frontend: Receives the video file and displays it.

Project Structure
bash
ListenAndLearn/
├── Backend/
│   ├── index.js                 # Main server file
│   ├── controllers/             # Contains API logic
│   ├── output/                  # Temporary files for generated audio and video
│   ├── .env                     # Environment variables
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js               # Main React component
│   │   ├── components/          # Additional components
│   ├── package.json
│   ├── .env                     # Environment variables for frontend
└── README.md                    # Project documentation

Known Issues
Cross-Origin Requests: Make sure CORS is configured correctly for deployment.
Audio Sync: Subtitle timing may vary with different prompt lengths.
Browser Compatibility: say library compatibility can vary across OS.
Future Enhancements
Support for multiple languages.
Customizable video output options (e.g., text color, background).
Integration with cloud storage for video management.
License
This project is licensed under the MIT License. See the LICENSE file for more information.
