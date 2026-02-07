/**
 * Simple TTS helper using REST endpoint (no React Hooks)
 */

export async function speakTextSimple(text: string): Promise<void> {
  try {
    // Call REST endpoint
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice: 'shimmer',
        speed: 1.0,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Convert base64 to audio blob
    const audioBlob = base64ToBlob(data.audio, 'audio/mpeg');
    const audioUrl = URL.createObjectURL(audioBlob);

    // Create and play audio
    const audio = new Audio(audioUrl);

    // Cleanup URL when audio ends
    audio.addEventListener('ended', () => {
      URL.revokeObjectURL(audioUrl);
    });

    await audio.play();
  } catch (error) {
    console.error('[TTS Simple] Error:', error);
    throw error;
  }
}

// Helper function to convert base64 to Blob
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}
