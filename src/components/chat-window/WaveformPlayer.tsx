import { Play, Pause } from "lucide-react";
import { useRef, useState, useCallback, useEffect } from "react";

interface WaveformPlayerProps {
    src: string;
    waveform: number[];
    duration?: number;
}

const GAP_PX = 1.5;

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const WaveformPlayer: React.FC<WaveformPlayerProps> = ({ src, waveform, duration }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const barsContainerRef = useRef<HTMLDivElement>(null);
    const [playing, setPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [totalDuration, setTotalDuration] = useState(duration ?? 0);
    const [barWidth, setBarWidth] = useState(3);

    const progressRatio = totalDuration > 0 ? currentTime / totalDuration : 0;
    const playedBars = Math.round(progressRatio * waveform.length);

    // Measure container and compute bar width so all bars fit
    useEffect(() => {
        const el = barsContainerRef.current;
        if (!el) return;

        const compute = () => {
            const width = el.clientWidth;
            const n = waveform.length;
            // total gaps = (n - 1) * GAP_PX, remaining space divided by n
            const computed = (width - (n - 1) * GAP_PX) / n;
            setBarWidth(Math.max(Math.floor(computed), 1));
        };

        compute();

        const ro = new ResizeObserver(compute);
        ro.observe(el);
        return () => ro.disconnect();
    }, [waveform.length]);

    const togglePlay = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (playing) {
            audio.pause();
        } else {
            audio.play();
        }
    }, [playing]);

    const handleTimeUpdate = () => {
        const audio = audioRef.current;
        if (audio) setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
        const audio = audioRef.current;
        if (audio) setTotalDuration(audio.duration);
    };

    const handleEnded = () => {
        setPlaying(false);
        setCurrentTime(0);
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onPlay = () => setPlaying(true);
        const onPause = () => setPlaying(false);

        audio.addEventListener("play", onPlay);
        audio.addEventListener("pause", onPause);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("play", onPlay);
            audio.removeEventListener("pause", onPause);
            audio.removeEventListener("ended", handleEnded);
        };
    }, []);

    return (
        <div className="flex items-center gap-2 w-full">
            {/* Hidden audio element */}
            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                preload="metadata"
                className="hidden"
            />

            {/* Play / Pause button */}
            <button
                onClick={togglePlay}
                className="flex-shrink-0 w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-colors"
                title={playing ? "Pause" : "Play"}
            >
                {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </button>

            {/* Waveform bars — sized to always fit */}
            <div
                ref={barsContainerRef}
                className="flex-1 flex items-center h-8 min-w-0 cursor-pointer select-none"
                style={{ gap: `${GAP_PX}px` }}
                onClick={(e) => {
                    const audio = audioRef.current;
                    if (!audio || !totalDuration) return;
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const ratio = Math.max(0, Math.min(1, x / rect.width));
                    audio.currentTime = ratio * totalDuration;
                }}
            >
                {waveform.map((peak, i) => {
                    const isPlayed = i < playedBars;
                    const height = Math.max(peak * 100, 10);

                    return (
                        <div
                            key={i}
                            className=" flex-1 rounded-sm transition-colors duration-100"
                            style={{
                                width: `${barWidth}px`,
                                height: `${height}%`,
                                minHeight: "3px",
                                backgroundColor: isPlayed ? "rgb(147, 51, 234)" : "rgb(196, 181, 253)",
                            }}
                        />
                    );
                })}
            </div>

            {/* Duration / current time */}
            <span className="flex-shrink-0 flex items-center gap-1 text-xs text-purple-600 whitespace-nowrap tabular-nums">
                {playing ? formatTime(currentTime) : formatTime(totalDuration)}
            </span>
        </div>
    );
};

export default WaveformPlayer;
