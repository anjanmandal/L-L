// Import required libraries
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import OpenAI from 'openai';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import ffprobePath from 'ffprobe-static'; // Import ffprobe-static
import path from 'path';
import fs from 'fs';
import say from 'say';
import { fileURLToPath } from 'url';

// Initialize dotenv
dotenv.config();

// Constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, 'output');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Set ffmpeg and ffprobe paths
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath.path); // Set ffprobe path
console.log('ffmpeg path:', ffmpegPath);
console.log('ffprobe path:', ffprobePath.path);

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());

// Route to handle prompt submission
app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;
  console.log(prompt);

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  try {
    // Generate a response from OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });
    const textResponse = completion.choices[0].message.content.trim();
    console.log("trace input--------",textResponse);

    // Generate audio from text
    const audioPath = await generateAudioFromText(textResponse);

    // Generate video from text and audio with dynamic text
    const videoPath = await generateVideoFromTextAndAudio(textResponse, audioPath);

    // Send the video file as a stream
    res.sendFile(videoPath, (err) => {
      if (err) {
        console.error('Error sending video file:', err);
      }

      // Delete the video and audio files after sending
      fs.unlink(videoPath, (err) => {
        if (err) {
          console.error('Error deleting video file:', err);
        }
      });
      fs.unlink(audioPath, (err) => {
        if (err) {
          console.error('Error deleting audio file:', err);
        }
      });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while processing your request.');
  }
});

// Function to generate audio from text
async function generateAudioFromText(text) {
  return new Promise((resolve, reject) => {
    const audioPath = path.join(outputDir, `audio_${Date.now()}.wav`);

    // Use 'say' library for TTS
    say.export(text, null, 1.0, audioPath, (err) => {
      if (err) {
        console.error('Error generating audio:', err);
        reject(err);
      } else {
        console.log('Audio saved to:', audioPath);
        resolve(audioPath);
      }
    });
  });
}

// Function to split text into smaller chunks (e.g., words or phrases)
function splitText(text, chunkSize = 5) {
  const words = text.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
  }

  return chunks;
}

// Function to escape text for FFmpeg
function escapeFFmpegText(text) {
  return text
    .replace(/'/g, "\\'")
    .replace(/:/g, '\\:')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n');
}

// Function to generate a video from text and audio with dynamic text
async function generateVideoFromTextAndAudio(text, audioPath) {
  return new Promise((resolve, reject) => {
    // Define the output video path
    const videoPath = path.join(outputDir, `output_${Date.now()}.mp4`);

    // Split the text into chunks (e.g., 5 words per chunk)
    const textChunks = splitText(text, 5);
    const escapedChunks = textChunks.map(chunk => escapeFFmpegText(chunk.trim()));

    // Construct the absolute path to the font file
    const fontPath = path.join(__dirname, 'fonts', 'Arial.ttf').replace(/\\/g, '/');

    // Log the font path to verify correctness
    console.log('Using font file:', fontPath);

    // Check if font file exists
    if (!fs.existsSync(fontPath)) {
      console.error('Font file does not exist:', fontPath);
      reject(new Error('Font file not found.'));
      return;
    }

    // Get audio duration using ffprobe
    ffmpeg.ffprobe(audioPath, (err, metadata) => {
      if (err) {
        console.error('Error getting audio metadata:', err);
        reject(err);
        return;
      }

      const duration = metadata.format.duration; // in seconds
      const totalWords = text.split(/\s+/).length;
      const timePerWord = duration / totalWords;
      const chunkSize = 5;
      const timePerChunk = timePerWord * chunkSize;

      // Assign timings to each text chunk
      const timings = [];
      let currentTime = 0;

      escapedChunks.forEach((chunk, index) => {
        const start = currentTime;
        const end = currentTime + timePerChunk;
        timings.push({
          text: chunk,
          start: start,
          end: end
        });
        currentTime += timePerChunk;
      });

      // Generate filter_complex string with multiple drawtext filters
      const filterComplex = timings.map((segment, index) => {
        // Add fade-in and fade-out for modern look
        const fadeDuration = 0.5; // seconds

        return `drawtext=fontfile='${fontPath}':` +
               `text='${segment.text}':` +
               `fontsize=40:` +
               `fontcolor=white:` +
               `x=(w-text_w)/2:` +
               `y=(h-text_h)/2:` +
               `box=1:` +
               `boxcolor=black@0.5:` +
               `boxborderw=5:` +
               `enable='between(t,${segment.start},${segment.end})':` +
               `alpha='if(between(t,${segment.start},${segment.start + fadeDuration}), (t-${segment.start})/${fadeDuration}, ` +
               `if(between(t,${segment.end - fadeDuration},${segment.end}), (${segment.end}-t)/${fadeDuration}, 1))'`;
      }).join(',');

      console.log('Filter Complex:', filterComplex);

      // Initialize FFmpeg command
      ffmpeg()
        // Input 1: Black video background with specified duration
        .input('color=c=black:s=1280x720:d=' + duration)
        .inputOptions(['-f lavfi'])

        // Input 2: Audio file
        .input(audioPath)

        // Apply the dynamic drawtext filters
        .complexFilter(filterComplex)

        // Output options
        .outputOptions([
          '-c:v libx264',       // Video codec
          '-pix_fmt yuv420p',   // Pixel format
          `-t ${duration}`      // Duration of the output video
        ])

        // Set audio codec
        .audioCodec('aac')

        // Log the FFmpeg command
        .on('start', (commandLine) => {
          console.log('Spawned FFmpeg with command:', commandLine);
        })

        // Handle successful completion
        .on('end', () => {
          console.log('Video created at:', videoPath);
          resolve(videoPath);
        })

        // Handle errors
        .on('error', (err, stdout, stderr) => {
          console.error('Error creating video:', err);
          console.error('FFmpeg stderr:', stderr);
          reject(err);
        })

        // Save the output video
        .save(videoPath);
    });
  });
}

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server started on port ${PORT}`);
}); 