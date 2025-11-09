const TicketDetailsSkeleton = () => {
    return (
        <div className="pb-8 animate-pulse">
            {/* Ticket ID and Name */}
            <div className="space-y-3">
                <div className="h-4 bg-zinc-200 rounded w-1/4" />
                <div className="h-6 bg-zinc-200 rounded w-2/3" />
                <div className="h-3 bg-zinc-200 rounded w-1/2 mt-2" />
            </div>

            <br />

            {/* Status and Priority */}
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-zinc-300 rounded-sm" />
                    <div className="h-3 bg-zinc-200 rounded w-1/5" />
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-zinc-300 rounded-sm" />
                    <div className="h-3 bg-zinc-200 rounded w-1/5" />
                </div>
            </div>

            <br />

            {/* Due Date */}
            <div className="h-3 bg-zinc-200 rounded w-1/3" />

            <br />

            {/* Assignee Section */}
            <div className="mt-5 space-y-3">
                <div className="h-4 bg-zinc-200 rounded w-1/5" />
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-300" />
                    <div className="space-y-2">
                        <div className="h-3 bg-zinc-200 rounded w-32" />
                        <div className="h-3 bg-zinc-200 rounded w-40" />
                    </div>
                </div>
            </div>

            {/* Assigner Section */}
            <div className="mt-5 space-y-3">
                <div className="h-4 bg-zinc-200 rounded w-1/5" />
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-300" />
                    <div className="space-y-2">
                        <div className="h-3 bg-zinc-200 rounded w-32" />
                        <div className="h-3 bg-zinc-200 rounded w-40" />
                    </div>
                </div>
            </div>

            <br />

            {/* Documents Section */}
            <div className="space-y-3">
                <div className="h-4 bg-zinc-200 rounded w-1/4" />
                <div className="w-full h-40 bg-zinc-100 rounded-2xl" />
            </div>

            <br />

            {/* Comments Section */}
            <div>
                <div className="flex justify-between items-center mb-4 ">
                    <div className="h-4 bg-zinc-200 rounded w-1/4" />
                    <div className="h-8 w-20 rounded-lg bg-zinc-200" />
                </div>

                {/* Comment Skeletons */}
                {[1, 2, 3].map((_, i) => (
                    <div key={i} className="border-b border-zinc-100 pb-4 mb-4 last:border-0">
                        <div className="flex gap-3 p-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-300" />
                            <div className="w-full space-y-2">
                                <div className="flex justify-between items-center">
                                    <div className="h-3 bg-zinc-200 rounded w-1/5" />
                                    <div className="h-3 bg-zinc-200 rounded w-16" />
                                </div>
                                <div className="h-3 bg-zinc-200 rounded w-full" />
                                <div className="h-3 bg-zinc-200 rounded w-2/3" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TicketDetailsSkeleton;
