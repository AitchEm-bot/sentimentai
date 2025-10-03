import { useEffect, useState, useRef } from 'react';

export function useAudioVisualizer(audioContext: AudioContext | null, mediaStream: MediaStream | null) {
  const [volume, setVolume] = useState<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!audioContext || !mediaStream) {
      return;
    }

    try {
      // Create analyser node
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      // Connect media stream to analyser
      const source = audioContext.createMediaStreamSource(mediaStream);
      source.connect(analyser);

      analyserRef.current = analyser;

      // Array to hold frequency data
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Function to update volume
      const updateVolume = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average volume
        const sum = dataArray.reduce((acc, val) => acc + val, 0);
        const average = sum / bufferLength;

        // Normalize to 0-1 range
        const normalizedVolume = Math.min(average / 128, 1);

        setVolume(normalizedVolume);

        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (analyserRef.current) {
          source.disconnect();
        }
      };
    } catch (error) {
      console.error('Error creating audio analyser:', error);
    }
  }, [audioContext, mediaStream]);

  return volume;
}
