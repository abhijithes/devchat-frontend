import { useEffect, useRef, useState } from "react";
import { AlertCircle, Check, Copy, LoaderCircle, RefreshCcw, Sparkles } from "lucide-react";
import { runAiTask, type RunAiTaskResponse } from "../../services/ai";
import CodeMessage from "./CodeMessage";
import { useSnackBar } from "../snack-bar/snack-bar-context";

interface AiMessageDialogProps {
    opened: boolean;
    messageContent: string;
    messageId?: string;
    roomId?: string;
}

const AiMessageDialog: React.FC<AiMessageDialogProps> = ({ opened, messageContent, messageId, roomId }) => {
    const { showSnackBar } = useSnackBar();
    const [result, setResult] = useState<RunAiTaskResponse | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const requestIdRef = useRef(0);
    const cacheRef = useRef(new Map<string, RunAiTaskResponse>());

    const trimmedMessage = messageContent.trim();
    const reviewKey = `${messageId ?? "no-message-id"}:${roomId ?? "no-room-id"}:${trimmedMessage}`;

    const fetchReview = async (forceRefresh = false) => {
        if (!trimmedMessage) {
            setResult(null);
            setError("");
            return;
        }

        if (!forceRefresh) {
            const cachedResult = cacheRef.current.get(reviewKey);

            if (cachedResult) {
                setResult(cachedResult);
                setError("");
                setLoading(false);
                return;
            }
        }

        const currentRequestId = requestIdRef.current + 1;
        requestIdRef.current = currentRequestId;

        try {
            setLoading(true);
            setError("");

            const response = await runAiTask({
                action: "review",
                content: trimmedMessage,
                context: {
                    source: "chat_message",
                    messageId,
                    roomId,
                },
            });

            if (requestIdRef.current !== currentRequestId) {
                return;
            }

            cacheRef.current.set(reviewKey, response);
            setResult(response);
        } catch (requestError: any) {
            if (requestIdRef.current !== currentRequestId) {
                return;
            }

            setResult(null);
            setError(requestError?.response?.data?.message || "Unable to generate an AI review right now.");
        } finally {
            if (requestIdRef.current === currentRequestId) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (!opened) return;
        void fetchReview();
    }, [opened, reviewKey]);

    const handleCopyRewrittenCode = async () => {
        if (!result?.result.rewrittenCode) return;

        try {
            await navigator.clipboard.writeText(result.result.rewrittenCode);
            setCopied(true);
            showSnackBar("Rewritten code copied!", "info", 2000);
            window.setTimeout(() => setCopied(false), 1800);
        } catch {
            showSnackBar("Failed to copy rewritten code.", "error", 2000);
        }
    };

    return (
        <div className="flex h-full max-h-[88vh] min-h-0 flex-col overflow-hidden rounded-[26px] bg-[linear-gradient(180deg,#fffef8_0%,#ffffff_18%,#f8fafc_100%)]">
            <div className="border-b border-zinc-200/80 bg-white/85 px-4 py-4 backdrop-blur sm:px-6 sm:py-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-3">
                        <div>
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-600">
                                AI Workspace
                            </p>
                            <h2 className="flex items-center gap-2 text-xl font-semibold text-zinc-900">
                                <Sparkles className="h-5 w-5 text-amber-500" />
                                Code Review
                            </h2>
                            <p className="mt-1 text-sm leading-6 text-zinc-500">
                                A focused review of the selected code message with issues, suggestions, and next steps.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-zinc-200/80 bg-white/70 p-4 shadow-sm">
                            <div className="mb-2 flex items-center justify-between gap-3">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                                    Source snippet
                                </p>
                                {messageId && <span className="text-[11px] text-zinc-500">Message {messageId.slice(-6)}</span>}
                            </div>
                            <div className="max-h-48 overflow-auto rounded-xl">
                                <CodeMessage content={trimmedMessage || "No message content available for review."} />
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => void fetchReview(true)}
                        disabled={loading || !trimmedMessage}
                        className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        Refresh review
                    </button>
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
                {!trimmedMessage && (
                    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/80 p-5 text-sm text-zinc-600 shadow-sm">
                        No message content available for review.
                    </div>
                )}

                {trimmedMessage && loading && (
                    <div className="flex min-h-60 items-center justify-center rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm">
                        <div className="flex items-center gap-3 text-sm text-zinc-600">
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            Reviewing code...
                        </div>
                    </div>
                )}

                {trimmedMessage && !loading && error && (
                    <div className="rounded-3xl border border-red-200 bg-red-50/90 p-5 text-sm text-red-700 shadow-sm">
                        <div className="flex items-center gap-2 font-medium">
                            <AlertCircle className="h-4 w-4" />
                            Review failed
                        </div>
                        <p className="mt-2 leading-6">{error}</p>
                    </div>
                )}

                {trimmedMessage && !loading && !error && result && (
                    <div className="space-y-4">
                        <div className="rounded-3xl border border-zinc-200 bg-white/90 p-5 shadow-sm">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Summary</h3>
                                {result.usage?.provider && result.usage?.model && (
                                    <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-700">
                                        {result.usage.provider} · {result.usage.model}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm leading-7 text-zinc-800">{result.result.summary}</p>
                        </div>

                        {!!result.result.issues?.length && (
                            <div className="rounded-3xl border border-zinc-200 bg-white/90 p-5 shadow-sm">
                                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Issues</h3>
                                <div className="space-y-3">
                                    {result.result.issues.map((issue, index) => (
                                        <div
                                            key={`${issue.title}-${index}`}
                                            className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4"
                                        >
                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                                                        issue.severity === "high"
                                                            ? "bg-red-100 text-red-700"
                                                            : issue.severity === "medium"
                                                              ? "bg-amber-100 text-amber-700"
                                                              : "bg-sky-100 text-sky-700"
                                                    }`}
                                                >
                                                    {issue.severity}
                                                </span>
                                                <p className="text-sm font-semibold text-zinc-900">{issue.title}</p>
                                            </div>
                                            <p className="text-sm leading-6 text-zinc-700">{issue.explanation}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!!result.result.suggestions?.length && (
                            <div className="rounded-3xl border border-zinc-200 bg-white/90 p-5 shadow-sm">
                                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
                                    Suggestions
                                </h3>
                                <ul className="space-y-2 text-sm leading-6 text-zinc-700">
                                    {result.result.suggestions.map((suggestion, index) => (
                                        <li
                                            key={`${suggestion}-${index}`}
                                            className="rounded-2xl border border-zinc-200 bg-zinc-50/80 px-4 py-3"
                                        >
                                            {suggestion}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {!!result.result.rewrittenCode && (
                            <div className="rounded-3xl border border-zinc-200 bg-white/90 p-5 shadow-sm">
                                <div className="mb-3 flex items-center justify-between gap-3">
                                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
                                        Rewritten Code
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => void handleCopyRewrittenCode()}
                                        className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
                                    >
                                        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                        {copied ? "Copied" : "Copy code"}
                                    </button>
                                </div>
                                <div className="max-h-[42vh] overflow-auto rounded-2xl">
                                    <CodeMessage content={result.result.rewrittenCode} />
                                </div>
                            </div>
                        )}

                        {!!result.result.notes?.length && (
                            <div className="rounded-3xl border border-zinc-200 bg-white/90 p-5 shadow-sm">
                                <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">Notes</h3>
                                <ul className="space-y-2 text-sm leading-6 text-zinc-700">
                                    {result.result.notes.map((note, index) => (
                                        <li key={`${note}-${index}`} className="rounded-2xl bg-zinc-50/80 px-4 py-3">
                                            {note}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AiMessageDialog;
