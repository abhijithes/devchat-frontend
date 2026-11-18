import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Mic, MicOff, Phone, PhoneOff, User } from "lucide-react";
import { useCall } from "../../contexts/CallContext";
import UserIcon from "../userIcon/usericon";
import { CallRingtone } from "../../constant/audio-files";

const formatDuration = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const CallOverlay = () => {
    const {
        state,
        peer,
        isMuted,
        isIncoming,
        error,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
    } = useCall();

    const [elapsed, setElapsed] = useState(0);

    // Call duration timer
    useEffect(() => {
        if (state !== "active") {
            setElapsed(0);
            return;
        }

        const startedAt = Date.now();
        const interval = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startedAt) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [state]);

    // Incoming ringtone. Browsers may block autoplay; the visual UI stands alone.
    useEffect(() => {
        if (!isIncoming || state !== "ringing") return;

        const ringtone = new Audio(CallRingtone);
        ringtone.loop = true;
        ringtone.play().catch(() => {
            // Autoplay blocked — ringing UI still shows.
        });

        return () => {
            ringtone.pause();
            ringtone.currentTime = 0;
        };
    }, [isIncoming, state]);

    if (state === "idle") return null;

    const displayName =
        [peer?.firstName, peer?.lastName].filter(Boolean).join(" ") || "Unknown caller";

    const statusText = (() => {
        switch (state) {
            case "calling":
                return "Calling...";
            case "ringing":
                return isIncoming ? "Incoming call" : "Ringing...";
            case "connecting":
                return "Connecting...";
            case "active":
                return `Connected ${formatDuration(elapsed)}`;
            case "ended":
                return error ?? "Call ended";
            default:
                return "";
        }
    })();

    const showIncomingActions = state === "ringing" && isIncoming;
    const showCallActions = state !== "ended" && !showIncomingActions;

    const overlay = (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-zinc-200 px-8 py-9 flex flex-col items-center gap-6">
                {peer?.firstName ? (
                    <div className="pointer-events-none">
                        <UserIcon
                            user={{
                                ...peer,
                                firstName: peer.firstName,
                                email: peer.email ?? "",
                            }}
                            style="w-24 h-24 text-3xl"
                        />
                    </div>
                ) : (
                    <div className="w-24 h-24 rounded-full bg-zinc-200 text-zinc-500 centered">
                        <User size={40} />
                    </div>
                )}

                <div className="text-center w-full">
                    <h2 className="text-xl font-semibold text-zinc-900 truncate">{displayName}</h2>
                    <p
                        className={`text-sm mt-1 ${
                            state === "active" ? "text-green-600" : "text-zinc-500"
                        }`}
                    >
                        {statusText}
                    </p>
                </div>

                {showIncomingActions && (
                    <div className="flex items-center gap-10 mt-1">
                        <button
                            onClick={rejectCall}
                            aria-label="Decline call"
                            title="Decline"
                            className="flex flex-col items-center gap-2 group"
                        >
                            <span className="w-14 h-14 rounded-full bg-red-500 text-white centered shadow-lg transition-colors group-hover:bg-red-600">
                                <PhoneOff size={24} />
                            </span>
                            <span className="text-xs text-zinc-500">Decline</span>
                        </button>

                        <button
                            onClick={acceptCall}
                            aria-label="Accept call"
                            title="Accept"
                            className="flex flex-col items-center gap-2 group"
                        >
                            <span className="w-14 h-14 rounded-full bg-green-500 text-white centered shadow-lg transition-colors group-hover:bg-green-600">
                                <Phone size={24} />
                            </span>
                            <span className="text-xs text-zinc-500">Accept</span>
                        </button>
                    </div>
                )}

                {showCallActions && (
                    <div className="flex items-center gap-10 mt-1">
                        <button
                            onClick={toggleMute}
                            aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
                            title={isMuted ? "Unmute" : "Mute"}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <span
                                className={`w-14 h-14 rounded-full centered shadow-lg transition-colors ${
                                    isMuted
                                        ? "bg-zinc-800 text-white group-hover:bg-zinc-700"
                                        : "bg-zinc-100 text-zinc-700 group-hover:bg-zinc-200"
                                }`}
                            >
                                {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                            </span>
                            <span className="text-xs text-zinc-500">
                                {isMuted ? "Unmute" : "Mute"}
                            </span>
                        </button>

                        <button
                            onClick={endCall}
                            aria-label="End call"
                            title="End call"
                            className="flex flex-col items-center gap-2 group"
                        >
                            <span className="w-14 h-14 rounded-full bg-red-500 text-white centered shadow-lg transition-colors group-hover:bg-red-600">
                                <PhoneOff size={24} />
                            </span>
                            <span className="text-xs text-zinc-500">End</span>
                        </button>
                    </div>
                )}

                {state === "ended" && (
                    <button
                        onClick={endCall}
                        className="mt-1 px-7 py-2 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-colors"
                    >
                        Close
                    </button>
                )}
            </div>
        </div>
    );

    return createPortal(overlay, document.body);
};

export default CallOverlay;
