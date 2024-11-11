import React, { useState } from 'react';
import axios from 'axios';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  IconButton,
  useMediaQuery,
  CssBaseline,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { VideoCameraFront as VideoIcon, DarkMode, LightMode } from '@mui/icons-material';

function App() {
  const [prompt, setPrompt] = useState('');
  const [videoURL, setVideoURL] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#8e44ad' }, // Title color remains subtle purple
      background: {
        paper: darkMode ? 'rgba(255, 255, 255, 0.1)' : '#f5f5f5',
        default: darkMode ? '#121212' : '#ffffff',
      },
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: '10px',
              backgroundColor: 'transparent', // Fully transparent background
              color: darkMode ? '#ffffff' : '#000000',
              '& fieldset': {
                borderColor: darkMode ? '#d1c4e9' : '#8e44ad', // Light purple for border
              },
              '&:hover fieldset': {
                borderColor: darkMode ? '#b39ddb' : '#732d91', // Darker shade on hover
              },
              '&.Mui-focused fieldset': {
                borderColor: darkMode ? '#b39ddb' : '#732d91', // Darker shade when focused
              },
            },
            '& .MuiInputBase-input': {
              color: darkMode ? '#ffffff' : '#000000', // Text color in each mode
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '10px',
            padding: '10px 20px',
            fontSize: '16px',
            textTransform: 'none',
            backgroundColor: '#000000', // Modern black color for button
            color: '#ffffff', // White text for contrast
            '&:hover': {
              backgroundColor: '#333333', // Slightly lighter black on hover
            },
          },
        },
      },
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt) return;

    setLoading(true);
    setVideoURL('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/generate',
        { prompt },
        { responseType: 'blob' }
      );

      const videoBlob = new Blob([response.data], { type: 'video/mp4' });
      const videoURL = URL.createObjectURL(videoBlob);
      setVideoURL(videoURL);
    } catch (error) {
      console.error('Error fetching video:', error);
      alert('An error occurred while fetching the video.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        {/* Three.js Canvas for background */}
        <Canvas style={{ position: 'absolute', top: 0, left: 0, zIndex: -1, width: '100%', height: '100%' }}>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </Canvas>

        <Container maxWidth="sm" sx={{ pt: 5, position: 'relative', zIndex: 1 }}>
          <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
            <Typography
              variant="h4"
              component="h1"
              color="#000000"
              backgroundColor="white"
              borderRadius="20px"
              padding="10px 20px"
              sx={{ fontWeight: 'bold', display: 'inline-block' }}
            >
              Listen And Learn
            </Typography>
          </Box>

          <Paper elevation={3} sx={{ p: 3, backdropFilter: 'blur(10px)', background: theme.palette.background.paper }}>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Enter your prompt here..."
                multiline
                fullWidth
                rows={5}
                variant="outlined"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                startIcon={<VideoIcon />}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Video'}
              </Button>
            </form>
            {videoURL && (
              <Box mt={3}>
                <video src={videoURL} controls style={{ width: '100%', borderRadius: '10px' }} />
              </Box>
            )}
          </Paper>
        </Container>

        {/* Dark Mode Toggle Button at Bottom Right */}
        <IconButton
          onClick={() => setDarkMode(!darkMode)}
          color="inherit"
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            },
            borderRadius: '50%',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
          }}
        >
          {darkMode ? <LightMode /> : <DarkMode />}
        </IconButton>
      </div>
    </ThemeProvider>
  );
}

export default App;
