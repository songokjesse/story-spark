'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function StorySpark() {
  const [prompt, setPrompt] = useState('');
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  async function generateStory() {
    if (!prompt.trim()) return;
    setLoading(true);
    setStory('');
    setError('');
    try {
      const res = await fetch('/api/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      if (data.story) setStory(data.story);
      else throw new Error(data.error || 'No story generated.');
    } catch (err: any) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // === Narration controls ===
  function speakStory() {
    if (!story) return;
    const utterance = new SpeechSynthesisUtterance(story);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => setIsSpeaking(false);

    // Choose a friendly English voice if available
    const voices = window.speechSynthesis.getVoices();
    const voice =
      voices.find((v) => v.lang.startsWith('en') && v.name.includes('Female')) ||
      voices.find((v) => v.lang.startsWith('en'));
    if (voice) utterance.voice = voice;

    window.speechSynthesis.cancel(); // stop any previous narration
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }

  function stopStory() {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-4 bg-gradient-to-b from-pink-100 to-yellow-100">
      {/* Header */}
      <div className="flex flex-col items-center w-full max-w-md text-center mt-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-4xl font-bold mb-4 text-pink-700"
        >
          🌙 Story Spark
        </motion.h1>

        <p className="text-gray-700 mb-6">
          Type a few words and let the magic unfold ✨
        </p>

        <Input
          className="w-full mb-4"
          placeholder="e.g. a dragon who loves painting"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />

        <Button
          className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-xl"
          onClick={generateStory}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin h-5 w-5" /> Spinning a tale...
            </span>
          ) : (
            'Tell Me a Story'
          )}
        </Button>
      </div>

      {/* Loading shimmer */}
      {loading && (
        <div className="w-full max-w-md mt-10 mb-16 animate-pulse">
          <Card className="rounded-2xl shadow-md bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4 space-y-3">
              <div className="h-4 bg-pink-200/60 rounded w-3/4"></div>
              <div className="h-4 bg-pink-200/50 rounded w-full"></div>
              <div className="h-4 bg-pink-200/40 rounded w-5/6"></div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Story output */}
      {!loading && story && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md mt-10 mb-16"
        >
          <Card className="rounded-2xl shadow-md bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4 text-left">
              <h2 className="text-lg font-semibold mb-2 text-pink-700">
                Your Story ✨
              </h2>
              <p className="whitespace-pre-line leading-relaxed text-gray-800">
                {story}
              </p>

              {/* Narration + Retry controls */}
              <div className="flex flex-wrap gap-3 mt-4">
                <Button
                  onClick={isSpeaking ? stopStory : speakStory}
                  className="bg-pink-500 text-white"
                >
                  {isSpeaking ? '🔇 Stop' : '🔊 Listen'}
                </Button>

                <Button variant="outline" size="sm" onClick={generateStory}>
                  🔄 Generate Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Error state + Retry */}
      {!loading && error && (
        <div className="w-full max-w-md mt-10 mb-16">
          <Card className="rounded-2xl shadow-md bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4 text-center space-y-3">
              <p className="text-red-600 font-medium">{error}</p>
              <Button onClick={generateStory} className="bg-pink-500 text-white">
                Retry 🔁
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <footer className="w-full text-center text-gray-600 text-sm mb-4">
        Made with ❤️ in the Kimberley
      </footer>
    </main>
  );
}
