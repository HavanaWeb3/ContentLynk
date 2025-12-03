'use client'

import { useState, useRef, useEffect } from 'react'
import ReactPlayer from 'react-player'
import { Play, Pause, Volume2, VolumeX, Maximize, Settings } from 'lucide-react'

interface VideoPlayerProps {
  url: string
  thumbnail?: string
  title?: string
  autoPlay?: boolean
  onProgress?: (progress: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void
  onEnded?: () => void
  className?: string
}

/**
 * Advanced Video Player Component
 *
 * Features:
 * - Play/pause control
 * - Volume control with mute toggle
 * - Seek bar with preview
 * - Fullscreen support
 * - Playback speed control
 * - Keyboard shortcuts
 * - Mobile responsive
 * - Watch time tracking
 */
export function VideoPlayer({
  url,
  thumbnail,
  title,
  autoPlay = false,
  onProgress,
  onEnded,
  className = '',
}: VideoPlayerProps) {
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [playing, setPlaying] = useState(autoPlay)
  const [volume, setVolume] = useState(0.8)
  const [muted, setMuted] = useState(false)
  const [played, setPlayed] = useState(0)
  const [loaded, setLoaded] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    if (!playing) return

    const timer = setTimeout(() => {
      setShowControls(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [showControls, playing])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault()
          setPlaying(p => !p)
          break
        case 'ArrowLeft':
          e.preventDefault()
          playerRef.current?.seekTo(Math.max(0, played - 0.05))
          break
        case 'ArrowRight':
          e.preventDefault()
          playerRef.current?.seekTo(Math.min(1, played + 0.05))
          break
        case 'm':
          e.preventDefault()
          setMuted(m => !m)
          break
        case 'f':
          e.preventDefault()
          toggleFullscreen()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [played])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleProgress = (state: any) => {
    setPlayed(state.played)
    setLoaded(state.loaded)
    onProgress?.(state)
  }

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayed(parseFloat(e.target.value))
  }

  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    const value = parseFloat((e.target as HTMLInputElement).value)
    playerRef.current?.seekTo(value)
  }

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000)
    const hh = date.getUTCHours()
    const mm = date.getUTCMinutes()
    const ss = date.getUTCSeconds().toString().padStart(2, '0')
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`
    }
    return `${mm}:${ss}`
  }

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden group ${className}`}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      {/* Video Player */}
      {/* @ts-ignore - ReactPlayer types are complex */}
      <ReactPlayer
        ref={playerRef}
        url={url}
        playing={playing}
        volume={volume}
        muted={muted}
        playbackRate={playbackRate}
        width="100%"
        height="100%"
        onProgress={handleProgress}
        onDuration={setDuration}
        onEnded={() => {
          setPlaying(false)
          onEnded?.()
        }}
        style={{ position: 'absolute', top: 0, left: 0 }}
      />

      {/* Thumbnail overlay (shown before play) */}
      {!playing && thumbnail && (
        <div className="absolute inset-0 flex items-center justify-center">
          <img src={thumbnail} alt={title} className="absolute inset-0 w-full h-full object-cover" />
          <button
            onClick={() => setPlaying(true)}
            className="relative z-10 w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Play className="w-8 h-8 text-white ml-1" fill="white" />
          </button>
        </div>
      )}

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress bar */}
        <div className="mb-4">
          <input
            type="range"
            min={0}
            max={0.999999}
            step="any"
            value={played}
            onChange={handleSeekChange}
            onMouseUp={handleSeekMouseUp}
            className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
          />
          <div className="flex justify-between text-xs text-white/80 mt-1">
            <span>{formatTime(duration * played)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Play/Pause */}
            <button
              onClick={() => setPlaying(!playing)}
              className="text-white hover:text-gray-300 transition-colors"
            >
              {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>

            {/* Volume */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setMuted(!muted)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {muted || volume === 0 ? (
                  <VolumeX className="w-6 h-6" />
                ) : (
                  <Volume2 className="w-6 h-6" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value))
                  setMuted(false)
                }}
                className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
              />
            </div>

            {/* Title */}
            {title && <span className="text-white text-sm font-medium hidden md:block">{title}</span>}
          </div>

          <div className="flex items-center space-x-4">
            {/* Playback speed */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              {showSettings && (
                <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2 min-w-[120px]">
                  <div className="text-white text-xs mb-2">Speed</div>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        setPlaybackRate(rate)
                        setShowSettings(false)
                      }}
                      className={`block w-full text-left px-2 py-1 text-sm rounded ${
                        playbackRate === rate
                          ? 'bg-indigo-600 text-white'
                          : 'text-white/80 hover:bg-white/10'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-gray-300 transition-colors"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading indicator */}
      {loaded < 1 && (
        <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Buffering... {Math.round(loaded * 100)}%
        </div>
      )}
    </div>
  )
}
