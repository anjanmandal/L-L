Text-to-Video Generator
A server-side application that takes a text prompt as input, generates a response using OpenAI's GPT-3.5-turbo, converts the text to speech (TTS), and combines the audio and text into a video with dynamically rendered subtitles. The application is built using Node.js, Express, and FFmpeg.

Features
Text Generation: Uses OpenAI's GPT-3.5-turbo to generate a response to a given text prompt.
Text-to-Speech Conversion: Converts the generated text into audio using say, a TTS library.
Video Creation: Combines audio and dynamically rendered text into a video file with custom styling.
Dynamic Subtitles: Renders text subtitles on the video, displayed in timed chunks.
Express Server: Provides an endpoint to accept prompts and returns the generated video as a response.
Prerequisites
Node.js (v14 or later)
FFmpeg (Installed automatically through dependencies)
Libraries
express: For creating server routes and handling HTTP requests.
dotenv: For loading environment variables.
cors: To handle Cross-Origin Resource Sharing.
openai: To interact with the OpenAI API.
fluent-ffmpeg, ffmpeg-static, ffprobe-static: For audio and video processing.
say: For converting text to speech.
Setup
Clone the Repository

bash
Copy code
git clone https://github.com/your-username/Text-to-Video.git
cd Text-to-Video
Install Dependencies

bash
Copy code
npm install
Set Up Environment Variables

Create a .env file in the root directory and add your OpenAI API key:

env
Copy code
OPENAI_API_KEY=your_openai_api_key
PORT=5000  # Optional, defaults to 5000 if not set
Ensure Output Directory Exists

The application saves temporary audio and video files to an output directory. This will be created automatically if it doesn’t exist.

Usage
Start the Server
To start the Express server, run:

bash
Copy code
node index.js
Endpoint: /api/generate
Method: POST
Description: Submits a text prompt, generates a response, converts it to audio, and returns a video with the spoken text as subtitles.

Request Body:

json
Copy code
{
  "prompt": "Your text prompt here"
}
Response: Returns the generated video file with text and audio.

How It Works
Prompt Submission: The /api/generate endpoint accepts a prompt in the request body.
Text Generation: The application uses OpenAI's API to generate a response based on the given prompt.
Text-to-Speech: The response text is converted to an audio file (.wav) using the say library.
Video Creation:
The text is split into chunks (e.g., 5 words per chunk).
Each chunk is displayed as subtitles on the video, timed to match the audio.
Text chunks fade in and out, creating a dynamic visual effect.
Sending the Video: The generated video is sent as a response. Temporary audio and video files are deleted after they are sent.
Code Structure
Server Setup: The server uses Express to handle routing and CORS to allow cross-origin requests.
Text and Video Generation:
The generateAudioFromText function converts text into a .wav audio file.
The generateVideoFromTextAndAudio function uses FFmpeg to combine the audio and text chunks into a video.
FFmpeg Customization:
The filterComplex configuration in FFmpeg creates text overlays with timing and fade effects for each chunk.
Custom fonts are used for text rendering, with a check for the font file’s existence before video generation.
Functions Explained
generateAudioFromText(text): Converts a given text to audio using TTS (say library) and returns the audio file path.
splitText(text, chunkSize): Splits the text into word chunks for easier timing in subtitles.
generateVideoFromTextAndAudio(text, audioPath): Combines audio with dynamic text chunks into a video, timed to match the audio duration.
escapeFFmpegText(text): Escapes special characters in text to ensure compatibility with FFmpeg.
Dependencies
Install the following libraries:

express
dotenv
cors
openai
fluent-ffmpeg
ffmpeg-static
ffprobe-static
say
Example Request
Use a tool like Postman to send a POST request:

Endpoint: http://localhost:5000/api/generate

Method: POST

Body:

json
Copy code
{
  "prompt": "Write a motivational message"
}
Expected Response: A video file with audio and synchronized subtitles based on the generated text.

Error Handling
Missing Prompt: Returns a 400 status with an error message if the prompt is missing.
OpenAI API Errors: Catches and logs errors related to the OpenAI API.
FFmpeg Errors: Catches and logs FFmpeg-related errors during video generation.
Known Issues
Dependency Compatibility: The say library may not work as expected on all operating systems. Ensure your system has compatible TTS voices installed.
Audio Sync: The timing for text chunks may vary slightly depending on the audio duration and word count.
Future Enhancements
Improve text chunking logic for more natural timing.
Add support for additional languages and voices in TTS.
Allow customizations such as font style, text color, and background.
License
This project is licensed under the Anjan Mandal
