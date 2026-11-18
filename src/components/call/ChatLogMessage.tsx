import UserIcon from "../userIcon/usericon";
import type { CallRecord } from "../../constant/messages";

interface ChatLogMessageProps {
  call: CallRecord;
  onRedial?: (call: CallRecord) => void;
  align?: "left" | "right";
}

const formatDuration = (startedAt: string | Date, endedAt: string | Date, durationSec?: number) => {
  const secFromDuration = typeof durationSec === "number" ? Math.max(0, Math.floor(durationSec)) : null;
  const sec =
    secFromDuration ??
    Math.max(0, Math.floor((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000));
  const mins = Math.floor(sec / 60);
  const secs = sec % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const statusLabel = (status: CallRecord["status"]) => {
  switch (status) {
    case "connected":
      return "Call ended";
    case "missed":
      return "Missed call";
    case "declined":
      return "Declined";
    case "cancelled":
      return "Cancelled";
    case "ended-while-connecting":
      return "No answer";
    case "error":
      return "Call failed";
    default:
      return "Call";
  }
};

export const ChatLogMessage = ({ call, onRedial, align = "left" }: ChatLogMessageProps) => {
  const caller = typeof call.callerId === "string" ? null : call.callerId;
  const peer = typeof call.peerId === "string" ? null : call.peerId;

  // Show the other participant when possible
  const displayUser = call.direction === "outgoing" ? peer ?? caller : caller ?? peer;
  const name = displayUser?.firstName
    ? `${displayUser.firstName}${displayUser.lastName ? ` ${displayUser.lastName}` : ""}`
    : call.direction === "outgoing"
      ? "Outgoing call"
      : "Incoming call";

  const directionText = call.direction === "outgoing" ? "Outgoing" : "Incoming";
  const kindText = call.kind === "video" ? "Video call" : "Voice call";
  const duration = formatDuration(call.startedAt, call.endedAt, call.durationSec);
  const isMissedLike =
    call.status === "missed" ||
    call.status === "declined" ||
    call.status === "cancelled" ||
    call.status === "ended-while-connecting" ||
    call.status === "error";

  const justifyClass = align === "right" ? "justify-end" : "justify-start";

  return (
    <div className={`w-full flex ${justifyClass} my-2`}>
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 max-w-sm w-full">
        <div className="flex-shrink-0">
          {displayUser?.firstName ? (
            <UserIcon
              user={{
                _id: displayUser._id,
                firstName: displayUser.firstName,
                lastName: displayUser.lastName,
                email: displayUser.email || "",
                profilePicture: displayUser.profilePicture,
              }}
              style="w-10 h-10"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-zinc-300 flex items-center justify-center text-zinc-600 text-sm font-semibold">
              {call.kind === "video" ? "V" : "A"}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-zinc-900 truncate">{name}</p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                isMissedLike ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
              }`}
            >
              {statusLabel(call.status)}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            {directionText} · {kindText}
            {call.status === "connected" ? ` · ${duration}` : ""}
          </p>
        </div>

        {onRedial && (
          <button
            type="button"
            onClick={() => onRedial(call)}
            className="flex-shrink-0 text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
          >
            Call
          </button>
        )}
      </div>
    </div>
  );
};
