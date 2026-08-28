import { Mic, Send, X } from "lucide-react";
import { useRef, useState, useCallback, useEffect } from "react";
import { extractWaveform } from "../../utils/extractWaveform";

interface VoiceRecorderProps {
    onRecordingComplete: (blob: Blob, duration: number, waveform: number[]) => void;
    onRecordingStateChange?: (isRecording: boolean) => void;
    disabled?: boolean;
}

const WAVE_BARS = 30;

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
    onRecordingComplete,
    onRecordingStateChange,
    disabled = false,
}) => {
    const [isRecording, setIsRecording] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [liveWave, setLiveWave] = useState<number[]>(new Array(WAVE_BARS).fill(0));

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startTimeRef = useRef<number>(0);
    const streamRef = useRef<MediaStream | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const rafRef = useRef<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const updateRecordingState = useCallback(
        (recording: boolean) => {
            setIsRecording(recording);
            onRecordingStateChange?.(recording);
        },
        [onRecordingStateChange],
    );

    const updateLiveWave = useCallback(() => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        const step = Math.floor(dataArray.length / WAVE_BARS);
        const bars: number[] = [];
        for (let i = 0; i < WAVE_BARS; i++) {
            const slice = dataArray.slice(i * step, (i + 1) * step);
            const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
            bars.push(avg / 255);
        }
        setLiveWave(bars);
        rafRef.current = requestAnimationFrame(updateLiveWave);
    }, []);

    const cleanupRecording = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        analyserRef.current = null;
    }, []);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 128;
            source.connect(analyser);
            analyserRef.current = analyser;

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: "audio/webm;codecs=opus",
            });

            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });

                let waveform: number[] = [];
                try {
                    waveform = await extractWaveform(blob, 40);
                } catch (err) {
                    console.warn("Waveform extraction failed:", err);
                }

                onRecordingComplete(blob, Math.max(duration, 1), waveform);

                cleanupRecording();

                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            startTimeRef.current = Date.now();
            setElapsedTime(0);
            setPermissionDenied(false);
            updateRecordingState(true);

            timerRef.current = setInterval(() => {
                setElapsedTime(Math.round((Date.now() - startTimeRef.current) / 1000));
            }, 1000);

            rafRef.current = requestAnimationFrame(updateLiveWave);
        } catch (err) {
            console.error("Microphone access denied:", err);
            setPermissionDenied(true);
        }
    }, [onRecordingComplete, updateRecordingState, updateLiveWave, cleanupRecording]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
        setElapsedTime(0);
        setLiveWave(new Array(WAVE_BARS).fill(0));
        updateRecordingState(false);
    }, [updateRecordingState]);

    const cancelRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.onstop = () => {
                const stream = mediaRecorderRef.current?.stream;
                stream?.getTracks().forEach((track) => track.stop());
                cleanupRecording();
            };
            mediaRecorderRef.current.stop();
        }
        setElapsedTime(0);
        setLiveWave(new Array(WAVE_BARS).fill(0));
        updateRecordingState(false);
    }, [updateRecordingState, cleanupRecording]);

    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                mediaRecorderRef.current.stop();
            }
            cleanupRecording();
        };
    }, [cleanupRecording]);

    // ─── IDLE ────────────────────────────────────────────────
    if (!isRecording) {
        if (permissionDenied) {
            return <span className="text-xs text-red-500 select-none">Mic blocked</span>;
        }

        return (
            <button
                onClick={startRecording}
                disabled={disabled}
                className="!w-max input-grad-btn centered disabled:opacity-40"
                title="Record voice message"
            >
                <Mic size={24} />
            </button>
        );
    }

    // ─── RECORDING ───────────────────────────────────────────
    return (
        <div className="flex items-center gap-2 w-full select-none">
            {/* Cancel button (left) */}
            <button
                onClick={cancelRecording}
                className="!w-max input-grad-btn-invert centered !p-2 flex-shrink-0"
                title="Cancel recording"
            >
                <X size={16} className="text-red-500" />
            </button>

            {/* Timer + waveform (center) */}
            <div className="flex-1 flex items-center gap-3 min-w-0">
                <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span className="text-sm font-mono text-red-600 tabular-nums min-w-[2.5rem] flex-shrink-0">
                    {formatTime(elapsedTime)}
                </span>
                <div className="flex items-center gap-[2px] flex-1 h-8 min-w-0">
                    {liveWave.map((amp, i) => (
                        <div
                            key={i}
                            className="flex-1 rounded-full bg-purple-500 transition-[height] duration-75"
                            style={{
                                height: `${Math.max(amp * 100, 8)}%`,
                                opacity: 0.5 + amp * 0.5,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Send button (right) */}
            <button
                onClick={stopRecording}
                disabled={elapsedTime < 1}
                className="!w-max input-grad-btn centered !p-2 disabled:opacity-40 flex-shrink-0"
                title="Send voice message"
            >
                <Send size={16} />
            </button>
        </div>
    );
};

export default VoiceRecorder;
