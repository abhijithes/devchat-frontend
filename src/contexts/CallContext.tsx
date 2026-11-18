import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import api from "../utils/axios";
import { endpoints } from "../constant/constant";
import type { BaseUserInfo } from "../constant/types";
import { useSocket } from "./SocketBaseContext";
import { useUsersInChat, type ChatsListType } from "./chatListContext";
import { createCallLog } from "../services/chat-service";
import type { CallRecord as FrontendCallRecord } from "../constant/messages";


export type CallState =
  | "idle"
  | "calling"
  | "ringing"
  | "connecting"
  | "active"
  | "ended";

export type CallKind = "audio" | "video";

/**
 * Incoming invites only carry the caller's id, so names/pictures are optional
 * and filled in from the chat list when that user is already known locally.
 */
export interface CallPeer {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePicture?: string;
}

interface CallContextType {
  state: CallState;
  callId: string | null;
  peer: CallPeer | null;
  roomId: string | null;
  kind: CallKind;
  isMuted: boolean;
  isIncoming: boolean;
  error: string | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  startedAt: string | null;
  endedAt: string | null;
  activeDurationSec: number;
  startCall: (user: BaseUserInfo, roomId: string, kind?: CallKind) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  clearError: () => void;
  saveCallLog: (status: CallRecord["status"], endedBy: "self" | "peer" | "timeout" | "system") => Promise<void>;
  latestCallLog: CallRecord | null;
}

/** Call record surfaced after a call ends so the chat window can persist it. */
export interface CallRecord {
  _id?: string;
  roomId: string;
  callId: string;
  kind: CallKind;
  callerId: CallPeer;
  peerId: CallPeer;
  direction: "outgoing" | "incoming";
  status: CallRecordStatus;
  durationSec?: number;
  startedAt: string;
  endedAt: string;
  endedBy: "self" | "peer" | "timeout" | "system";
  createdAt?: string;
  updatedAt?: string;
}

export type CallRecordStatus =
  | "connected"
  | "missed"
  | "declined"
  | "cancelled"
  | "ended-while-connecting"
  | "error";

/** Payloads as emitted by the backend socket layer. */
interface CallInvitePayload {
  from?: string;
  toUserId?: string;
  roomId?: string;
  callId?: string;
  kind?: string;
}

interface CallIdPayload {
  callId?: string;
  from?: string;
  toUserId?: string;
}

interface SdpPayload {
  callId?: string;
  sdp?: RTCSessionDescriptionInit;
}

interface IcePayload {
  callId?: string;
  candidate?: RTCIceCandidateInit | null;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

// Matches the backend's STUN list, used when /api/call/ice-servers is unreachable.
const FALLBACK_ICE_SERVERS: RTCIceServer[] = [
  { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] },
];

const createCallId = (): string =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `call-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const requestMicrophone = async (kind: CallKind): Promise<MediaStream> => {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new DOMException("getUserMedia is not available", "NotSupportedError");
  }

  // Video is just extra tracks on the same connection.
  return navigator.mediaDevices.getUserMedia({
    audio: true,
    video: kind === "video",
  });
};

const describeMediaError = (err: unknown): string => {
  const name = (err as { name?: string } | null)?.name ?? "";

  switch (name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return "Microphone access was blocked. Allow microphone permission in your browser and try again.";
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "No microphone was found. Connect a microphone and try again.";
    case "NotReadableError":
    case "TrackStartError":
      return "Your microphone is already in use by another app. Close it and try again.";
    case "NotSupportedError":
      return "Calls are not supported in this browser or on an insecure connection.";
    default:
      return "Could not access your microphone. Please try again.";
  }
};

const stopStream = (stream: MediaStream | null) => {
  stream?.getTracks().forEach((track) => track.stop());
};

const CallProvider = ({ children }: { children: ReactNode }) => {
  const { socket } = useSocket();
  const { usersInChat } = useUsersInChat();

  const [state, setState] = useState<CallState>("idle");
  const [callId, setCallId] = useState<string | null>(null);
  const [peer, setPeer] = useState<CallPeer | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [kind, setKind] = useState<CallKind>("audio");
  const [isMuted, setIsMuted] = useState(false);
  const [isIncoming, setIsIncoming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const hasRemoteDescriptionRef = useRef(false);

  // Mirror of the call state, readable from socket handlers without stale closures.
  const callIdRef = useRef<string | null>(null);
  const peerIdRef = useRef<string | null>(null);
  const roomIdRef = useRef<string | null>(null);
  const stateRef = useRef<CallState>("idle");
  const kindRef = useRef<CallKind>("audio");

  const chatsRef = useRef<ChatsListType[]>(usersInChat);
  useEffect(() => {
    chatsRef.current = usersInChat;
  }, [usersInChat]);

  const [latestCallLog, setLatestCallLog] = useState<FrontendCallRecord | null>(null);
  const [endedAt, setEndedAt] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [activeDurationSec, setActiveDurationSec] = useState(0);

  const localUserId = typeof window !== "undefined" ? (window as any).__DEVCHAT_USER_ID__ : undefined;

  const isLocalUserId = useCallback(
    (id: string) => typeof localUserId === "string" && localUserId === id,
    [localUserId],
  );

  const setPhase = useCallback((next: CallState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const resolvePeer = useCallback((userId: string, chatRoomId: string): CallPeer => {
    const chat = chatsRef.current.find((item) => item.roomId === chatRoomId);
    const match =
      chat?.allMembers?.find((member) => member._id === userId) ??
      (chat?.user?._id === userId ? chat.user : undefined);

    return match ? { ...match } : { _id: userId };
  }, []);

  /** Releases every local resource. Safe to call when no call is running. */
  const teardown = useCallback(() => {
    const pc = pcRef.current;
    if (pc) {
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onconnectionstatechange = null;
      try {
        pc.close();
      } catch {
        // already closed
      }
      pcRef.current = null;
    }

    stopStream(localStreamRef.current);
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    pendingCandidatesRef.current = [];
    hasRemoteDescriptionRef.current = false;

    if (audioRef.current) audioRef.current.srcObject = null;

    callIdRef.current = null;
    peerIdRef.current = null;
    roomIdRef.current = null;

    setLocalStream(null);
    setRemoteStream(null);
    setCallId(null);
    setIsMuted(false);
    // `peer`, `roomId`, `kind` and `isIncoming` survive so the ended screen
    // can still say who called; they are cleared when the call is dismissed.
  }, []);

  /** Tears the call down locally and optionally tells the peer why. */
  const finish = useCallback(
    (
      message: string | null,
      notify: "none" | "call:end" | "call:cancel" | "call:reject" = "none",
    ) => {
      const activeCallId = callIdRef.current;
      const activePeerId = peerIdRef.current;
      const wasIdle = stateRef.current === "idle";

      teardown();

      if (notify !== "none" && activeCallId && activePeerId) {
        socket.emit(notify, { toUserId: activePeerId, callId: activeCallId });
      }

      if (wasIdle) return;

      setEndedAt(new Date().toISOString());
      setPhase("ended");
      setError(message);
    },
    [socket, teardown, setPhase],
  );

  const fetchIceServers = useCallback(async (): Promise<RTCIceServer[]> => {
    try {
      const res = await api.get(endpoints.getIceServers);
      const servers = res.data?.iceServers;
      if (Array.isArray(servers) && servers.length > 0) {
        return servers as RTCIceServer[];
      }
    } catch (err) {
      console.warn("Could not load ICE servers, falling back to STUN", err);
    }

    return FALLBACK_ICE_SERVERS;
  }, []);

  const attachLocalTracks = useCallback((pc: RTCPeerConnection, stream: MediaStream) => {
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
  }, []);

  const playRemoteAudio = useCallback((stream: MediaStream) => {
    const element = audioRef.current;
    if (!element) return;

    element.srcObject = stream;
    element.play().catch(() => {
      // Autoplay can be blocked until the user interacts with the page.
    });
  }, []);

  const wirePeerConnection = useCallback(
    (pc: RTCPeerConnection, activeCallId: string) => {
      pc.onicecandidate = (event) => {
        const activePeerId = peerIdRef.current;
        if (!activePeerId) return;

        // A null candidate marks the end of candidates; forward it so the
        // peer can finish gathering too.
        socket.emit("webrtc:ice", {
          toUserId: activePeerId,
          callId: activeCallId,
          candidate: event.candidate ? event.candidate.toJSON() : null,
        });
      };

      pc.ontrack = (event) => {
        const inbound = event.streams[0];

        if (inbound) {
          remoteStreamRef.current = inbound;
          setRemoteStream(inbound);
          playRemoteAudio(inbound);
          return;
        }

        const stream = remoteStreamRef.current ?? new MediaStream();
        stream.addTrack(event.track);
        remoteStreamRef.current = stream;
        setRemoteStream(stream);
        playRemoteAudio(stream);
      };

      pc.onconnectionstatechange = () => {
        // Ignore events from a connection that has already been replaced.
        if (pcRef.current !== pc) return;

        if (pc.connectionState === "connected") {
          setPhase("active");
          recordConnected();
          return;
        }

        if (pc.connectionState === "failed") {
          finish("Connection failed. Please try again.", "call:end");
          return;
        }

        if (pc.connectionState === "disconnected") {
          finish("Connection lost. The call has ended.", "call:end");
        }
      };
    },
    [socket, playRemoteAudio, finish, setPhase],
  );

  const recordConnected = useCallback(() => {
    if (stateRef.current !== "active") return;
    setActiveDurationSec(0);
  }, [setActiveDurationSec]);

  const addRemoteCandidate = useCallback(
    async (candidate: RTCIceCandidateInit) => {
      const pc = pcRef.current;
      if (!pc) return;

      // Candidates that race ahead of the remote description are queued.
      if (!hasRemoteDescriptionRef.current) {
        pendingCandidatesRef.current.push(candidate);
        return;
      }

      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn("Failed to add remote ICE candidate", err);
      }
    },
    [],
  );

  const flushPendingCandidates = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;

    const queued = pendingCandidatesRef.current;
    pendingCandidatesRef.current = [];

    for (const candidate of queued) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn("Failed to flush queued ICE candidate", err);
      }
    }
  }, []);

  const applyRemoteDescription = useCallback(
    async (description: RTCSessionDescriptionInit): Promise<boolean> => {
      const pc = pcRef.current;
      if (!pc) return false;

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(description));
        hasRemoteDescriptionRef.current = true;
        await flushPendingCandidates();
        return true;
      } catch (err) {
        console.error("Failed to apply remote description", err);
        return false;
      }
    },
    [flushPendingCandidates],
  );

  const startCall = useCallback(
    async (user: BaseUserInfo, targetRoomId: string, callKind: CallKind = "audio") => {
      // Ignore if a call is already in flight; "ended" can start a new one.
      if (stateRef.current !== "idle" && stateRef.current !== "ended") return;

      const nextCallId = createCallId();

      callIdRef.current = nextCallId;
      peerIdRef.current = user._id;
      roomIdRef.current = targetRoomId;
      kindRef.current = callKind;

      setCallId(nextCallId);
      setPeer({ ...user });
      setRoomId(targetRoomId);
      setKind(callKind);
      setIsIncoming(false);
      setIsMuted(false);
      setError(null);
      setPhase("calling");

      const t0 = new Date().toISOString();
      setStartedAt(t0);
      setEndedAt(null);
      setActiveDurationSec(0);
      setLatestCallLog(null);

      // Fetch ICE servers while the permission prompt is up.
      const iceServersPromise = fetchIceServers();

      let stream: MediaStream;
      try {
        stream = await requestMicrophone(callKind);
      } catch (err) {
        finish(describeMediaError(err));
        return;
      }

      // Hung up while the permission prompt was open.
      if (callIdRef.current !== nextCallId) {
        stopStream(stream);
        return;
      }

      const iceServers = await iceServersPromise;
      if (callIdRef.current !== nextCallId) {
        stopStream(stream);
        return;
      }

      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = new RTCPeerConnection({ iceServers });
      pcRef.current = pc;
      attachLocalTracks(pc, stream);
      wirePeerConnection(pc, nextCallId);

      socket.emit("call:invite", {
        toUserId: user._id,
        roomId: targetRoomId,
        callId: nextCallId,
        kind: callKind,
      });
    },
    [
      fetchIceServers,
      finish,
      setPhase,
      setStartedAt,
      setEndedAt,
      setActiveDurationSec,
      setLatestCallLog,
      socket,
      attachLocalTracks,
      wirePeerConnection,
    ],
  );

  const acceptCall = useCallback(async () => {
    if (stateRef.current !== "ringing") return;

    const activeCallId = callIdRef.current;
    const activePeerId = peerIdRef.current;
    const callKind = kindRef.current;
    if (!activeCallId || !activePeerId) return;

    setError(null);

    const iceServersPromise = fetchIceServers();

    let stream: MediaStream;
    try {
      stream = await requestMicrophone(callKind);
    } catch (err) {
      // Tell the caller we cannot pick up instead of leaving it ringing.
      socket.emit("call:reject", { toUserId: activePeerId, callId: activeCallId });
      finish(describeMediaError(err));
      return;
    }

    if (callIdRef.current !== activeCallId) {
      stopStream(stream);
      return;
    }

    const iceServers = await iceServersPromise;
    if (callIdRef.current !== activeCallId) {
      stopStream(stream);
      return;
    }

    localStreamRef.current = stream;
    setLocalStream(stream);

    const pc = new RTCPeerConnection({ iceServers });
    pcRef.current = pc;
    attachLocalTracks(pc, stream);
    wirePeerConnection(pc, activeCallId);

    // The caller creates and sends the offer once it sees this accept.
    setPhase("connecting");
    socket.emit("call:accept", { toUserId: activePeerId, callId: activeCallId });
  }, [attachLocalTracks, fetchIceServers, finish, setPhase, socket, wirePeerConnection]);

  const saveCallLog = useCallback(async (
    status: CallRecord["status"],
    endedBy: "self" | "peer" | "timeout" | "system",
  ) => {
    const roomId = roomIdRef.current;
    const callId = callIdRef.current;
    const kind = kindRef.current;
    const peerId = peerIdRef.current;

    if (!roomId || !callId || !kind || !peerId) {
      console.warn(
        "CallContext: cannot save a call log without roomId/callId/kind/peerId",
      );
      return;
    }

    const peerInfo = resolvePeer(peerId, roomId);

    const callerIdResolved = localUserId
      ? isLocalUserId(localUserId)
        ? {
              _id: localUserId,
              firstName: peerInfo.firstName,
              lastName: peerInfo.lastName,
              email: peerInfo.email,
              profilePicture: peerInfo.profilePicture,
            }
        : { _id: peerId, firstName: peerInfo.firstName, lastName: peerInfo.lastName, email: peerInfo.email, profilePicture: peerInfo.profilePicture }
      : { _id: peerId, firstName: peerInfo.firstName, lastName: peerInfo.lastName, email: peerInfo.email, profilePicture: peerInfo.profilePicture };

    const peerIdResolved = { _id: peerId, firstName: peerInfo.firstName, lastName: peerInfo.lastName, email: peerInfo.email, profilePicture: peerInfo.profilePicture };

    // Determine direction based on isIncoming state (set when call is initiated)
    // Get local user ID from localStorage
    const localUserData = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("DEV_CHATX_USER_URD") || "null") : null;
    const currentLocalUserId = localUserData?.id;

    // Determine direction: if the peer is the local user, it's incoming; otherwise outgoing
    const direction: "outgoing" | "incoming" =
      peerId === currentLocalUserId ? "incoming" : "outgoing";

    // Prefer an explicit endedAt; if not emitted yet fall back to now.
    const endedAtLocal = endedAt ?? new Date().toISOString();

    // callerId is the user who initiated the call
    // For outgoing: local user
    // For incoming: the peer (who called us)
    const callerId =
      direction === "outgoing"
        ? currentLocalUserId || peerId
        : peerId;

    // peerId in the payload should be the OTHER participant (not the caller)
    const peerIdInPayload =
      direction === "outgoing"
        ? peerId  // remote user
        : currentLocalUserId || peerId;  // local user (since caller is remote)

    const payload = {
      roomId,
      callId,
      kind,
      callerId,
      peerId: peerIdInPayload,
      direction,
      status: status,
      durationSec: activeDurationSec > 0 ? activeDurationSec : undefined,
      startedAt: startedAt ?? new Date().toISOString(),
      endedAt: endedAtLocal,
      endedBy,
    };

    try {
      const saved = await createCallLog(payload);
      const callLog = (saved.data as any)?.callLog ?? saved.data;
      setLatestCallLog(callLog as FrontendCallRecord);
    } catch (err) {
      console.error("[CallLog] Failed to persist call log:", err);
    }
  }, [
    activeDurationSec,
    endedAt,
    startedAt,
    localUserId,
    isLocalUserId,
  ]);

  const rejectCall = useCallback(() => {
    if (stateRef.current !== "ringing") return;
    // Capture values before teardown clears them
    const callId = callIdRef.current;
    const peerId = peerIdRef.current;
    const roomId = roomIdRef.current;
    const kind = kindRef.current;
    finish(null, "call:reject");
    // Restore refs so saveCallLog can use them
    callIdRef.current = callId;
    peerIdRef.current = peerId;
    roomIdRef.current = roomId;
    kindRef.current = kind;
    void saveCallLog("cancelled", "self");
  }, [finish, saveCallLog]);

  const endCall = useCallback(() => {
    const phase = stateRef.current;
    if (phase === "idle") return;

    // "ended" acts as a dismiss for the finished-call state.
    if (phase === "ended") {
      teardown();
      setPeer(null);
      setRoomId(null);
      setIsIncoming(false);
      setPhase("idle");
      setError(null);
      setLatestCallLog(null);
      return;
    }

    const status: CallRecord["status"] =
      phase === "active" ? "connected" : "ended-while-connecting";
    const endedBy: "self" | "peer" | "timeout" | "system" = "self";

    const notify =
      phase === "calling" ? "call:cancel" : phase === "ringing" ? "call:reject" : "call:end";

    // Capture values before teardown clears them
    const callId = callIdRef.current;
    const peerId = peerIdRef.current;
    const roomId = roomIdRef.current;
    const kind = kindRef.current;
    finish(null, notify);
    // Restore refs so saveCallLog can use them
    callIdRef.current = callId;
    peerIdRef.current = peerId;
    roomIdRef.current = roomId;
    kindRef.current = kind;
    void saveCallLog(status, endedBy);
  }, [finish, setPhase, teardown, saveCallLog]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    const audioTrack = stream?.getAudioTracks()[0];
    if (!audioTrack) return;

    audioTrack.enabled = !audioTrack.enabled;
    setIsMuted(!audioTrack.enabled);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // Socket listeners are registered once and always read the refs above.
  useEffect(() => {
    const isCurrentCall = (payload: { callId?: string }) =>
      !!payload?.callId && payload.callId === callIdRef.current;

    const onInvite = (payload: CallInvitePayload) => {
      const from = payload?.from;
      const incomingRoomId = payload?.roomId;
      const incomingCallId = payload?.callId;
      if (!from || !incomingRoomId || !incomingCallId) return;

      const busy =
        stateRef.current === "calling" ||
        stateRef.current === "ringing" ||
        stateRef.current === "connecting" ||
        stateRef.current === "active";

      if (busy) {
        // Already on a call: decline instead of dropping the invite silently.
        socket.emit("call:reject", { toUserId: from, callId: incomingCallId });
        return;
      }

      callIdRef.current = incomingCallId;
      peerIdRef.current = from;
      roomIdRef.current = incomingRoomId;
      kindRef.current = payload.kind === "video" ? "video" : "audio";

      setCallId(incomingCallId);
      setPeer(resolvePeer(from, incomingRoomId));
      setRoomId(incomingRoomId);
      setKind(kindRef.current);
      setIsIncoming(true);
      setIsMuted(false);
      setError(null);
      setPhase("ringing");
    };

    const onAccept = async (payload: CallIdPayload) => {
      if (!isCurrentCall(payload)) return;
      if (stateRef.current !== "calling") return;

      const pc = pcRef.current;
      const activePeerId = peerIdRef.current;
      if (!pc || !activePeerId) return;

      setPhase("connecting");

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Hung up while negotiating.
        if (!isCurrentCall(payload)) return;

        socket.emit("webrtc:offer", {
          toUserId: activePeerId,
          callId: payload.callId,
          sdp: pc.localDescription,
        });
      } catch (err) {
        console.error("Failed to create the call offer", err);
        finish("Could not start the call.", "call:end");
      }
    };

    const onOffer = async (payload: SdpPayload) => {
      if (!isCurrentCall(payload) || !payload.sdp) return;

      const pc = pcRef.current;
      if (!pc) return;

      if (stateRef.current !== "connecting" && stateRef.current !== "active") return;

      const applied = await applyRemoteDescription(payload.sdp);
      if (!applied) {
        finish("Could not establish the call.", "call:end");
        return;
      }

      const activePeerId = peerIdRef.current;
      if (!activePeerId) return;

      try {
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        if (!isCurrentCall(payload)) return;

        socket.emit("webrtc:answer", {
          toUserId: activePeerId,
          callId: payload.callId,
          sdp: pc.localDescription,
        });
      } catch (err) {
        console.error("Failed to answer the call", err);
        finish("Could not establish the call.", "call:end");
      }
    };

    const onAnswer = async (payload: SdpPayload) => {
      if (!isCurrentCall(payload) || !payload.sdp) return;

      const applied = await applyRemoteDescription(payload.sdp);
      if (!applied) finish("Could not establish the call.", "call:end");
    };

    const onIce = (payload: IcePayload) => {
      if (!isCurrentCall(payload)) return;
      if (!payload.candidate) return; // end-of-candidates marker
      void addRemoteCandidate(payload.candidate);
    };

    const onRemoteReject = (payload: CallIdPayload) => {
      if (!isCurrentCall(payload)) return;
      // Capture values before teardown clears them
      const callId = callIdRef.current;
      const peerId = peerIdRef.current;
      const roomId = roomIdRef.current;
      const kind = kindRef.current;
      finish("Call declined.", "none");
      callIdRef.current = callId;
      peerIdRef.current = peerId;
      roomIdRef.current = roomId;
      kindRef.current = kind;
      void saveCallLog("declined", "peer");
    };

    const onRemoteCancel = (payload: CallIdPayload) => {
      if (!isCurrentCall(payload)) return;
      // Capture values before teardown clears them
      const callId = callIdRef.current;
      const peerId = peerIdRef.current;
      const roomId = roomIdRef.current;
      const kind = kindRef.current;
      finish("Call cancelled.", "none");
      callIdRef.current = callId;
      peerIdRef.current = peerId;
      roomIdRef.current = roomId;
      kindRef.current = kind;
      void saveCallLog("cancelled", "peer");
    };

    const onRemoteEnd = (payload: CallIdPayload) => {
      if (!isCurrentCall(payload)) return;
      // Capture values before teardown clears them
      const callId = callIdRef.current;
      const peerId = peerIdRef.current;
      const roomId = roomIdRef.current;
      const kind = kindRef.current;
      finish("Call ended.", "none");
      callIdRef.current = callId;
      peerIdRef.current = peerId;
      roomIdRef.current = roomId;
      kindRef.current = kind;
      void saveCallLog("connected", "peer");
    };

    const onBusy = (payload: CallIdPayload) => {
      if (!isCurrentCall(payload)) return;
      // Capture values before teardown clears them
      const callId = callIdRef.current;
      const peerId = peerIdRef.current;
      const roomId = roomIdRef.current;
      const kind = kindRef.current;
      finish("They are already on another call.", "none");
      callIdRef.current = callId;
      peerIdRef.current = peerId;
      roomIdRef.current = roomId;
      kindRef.current = kind;
      void saveCallLog("declined", "peer");
    };

    const onUnavailable = (payload: CallIdPayload) => {
      if (!isCurrentCall(payload)) return;
      // Capture values before teardown clears them
      const callId = callIdRef.current;
      const peerId = peerIdRef.current;
      const roomId = roomIdRef.current;
      const kind = kindRef.current;
      finish("They are offline right now.", "none");
      callIdRef.current = callId;
      peerIdRef.current = peerId;
      roomIdRef.current = roomId;
      kindRef.current = kind;
      void saveCallLog("missed", "timeout");
    };

    const onMissed = (payload: CallIdPayload) => {
      if (!isCurrentCall(payload)) return;
      // Capture values before teardown clears them
      const callId = callIdRef.current;
      const peerId = peerIdRef.current;
      const roomId = roomIdRef.current;
      const kind = kindRef.current;
      finish("No answer — the call was missed.", "none");
      callIdRef.current = callId;
      peerIdRef.current = peerId;
      roomIdRef.current = roomId;
      kindRef.current = kind;
      void saveCallLog("missed", "timeout");
    };

    socket.on("call:invite", onInvite);
    socket.on("call:accept", onAccept);
    socket.on("call:reject", onRemoteReject);
    socket.on("call:cancel", onRemoteCancel);
    socket.on("call:end", onRemoteEnd);
    socket.on("call:busy", onBusy);
    socket.on("call:unavailable", onUnavailable);
    socket.on("call:missed", onMissed);
    socket.on("webrtc:offer", onOffer);
    socket.on("webrtc:answer", onAnswer);
    socket.on("webrtc:ice", onIce);

    return () => {
      socket.off("call:invite", onInvite);
      socket.off("call:accept", onAccept);
      socket.off("call:reject", onRemoteReject);
      socket.off("call:cancel", onRemoteCancel);
      socket.off("call:end", onRemoteEnd);
      socket.off("call:busy", onBusy);
      socket.off("call:unavailable", onUnavailable);
      socket.off("call:missed", onMissed);
      socket.off("webrtc:offer", onOffer);
      socket.off("webrtc:answer", onAnswer);
      socket.off("webrtc:ice", onIce);
    };
  }, [socket, setPhase, finish, resolvePeer, applyRemoteDescription, addRemoteCandidate]);

  // Release the microphone, peer connection and audio element on unmount.
  useEffect(() => () => teardown(), [teardown]);

  const value = useMemo<CallContextType>(
    () => ({
      state,
      callId,
      peer,
      roomId,
      kind,
      isMuted,
      isIncoming,
      error,
      localStream,
      remoteStream,
      startedAt,
      endedAt,
      activeDurationSec,
      startCall,
      acceptCall,
      rejectCall,
      endCall,
      toggleMute,
      clearError,
      saveCallLog,
      latestCallLog: latestCallLog as FrontendCallRecord | null,
    }),
    [
      state,
      callId,
      peer,
      roomId,
      kind,
      isMuted,
      isIncoming,
      error,
      localStream,
      remoteStream,
      startedAt,
      endedAt,
      activeDurationSec,
      latestCallLog,
      isLocalUserId,
      saveCallLog,
      setLatestCallLog,
      setStartedAt,
      setEndedAt,
      setActiveDurationSec,
      setPhase,
      finish,
      teardown,
      socket,
      resolvePeer,
      fetchIceServers,
      attachLocalTracks,
      wirePeerConnection,
      playRemoteAudio,
      addRemoteCandidate,
      applyRemoteDescription,
      flushPendingCandidates,
    ],
  );

  return (
    <CallContext.Provider value={value}>
      {children}
      <audio ref={audioRef} autoPlay className="hidden" />
    </CallContext.Provider>
  );
};

const useCall = () => {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCall must be used within CallProvider");
  return ctx;
};

export { CallContext, CallProvider, useCall };
