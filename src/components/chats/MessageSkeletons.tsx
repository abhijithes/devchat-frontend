// Left aligned skeleton
export const LeftMessageSkeleton = () => (
    <div className="w-full mb-4 flex gap-2">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse"></div>

        {/* Message & Actions */}
        <div className="flex flex-col items-start">
            {/* Message bubble */}
            <div className="bg-white p-4 flex gap-3 flex-col rounded w-60 md:w-100 lg:w-150">
                <div className="w-full h-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="w-24 h-3 bg-gray-300 rounded animate-pulse self-start"></div>
            </div>

            {/* Action bar */}
            <div className="w-max mt-2 px-5 py-2 bg-white rounded flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-300 rounded animate-pulse"></div>
                <div className="w-7 h-7 bg-gray-300 rounded animate-pulse"></div>
            </div>
        </div>
    </div>
);

// Right aligned skeleton
export const RightMessageSkeleton = () => (
    <div className="w-full mb-4 flex gap-2 flex-row-reverse">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse"></div>

        {/* Message & Actions */}
        <div className="flex flex-col items-start">
            {/* Message bubble */}
            <div className="bg-white p-4 flex gap-3 flex-col rounded w-60 md:w-100 lg:w-150">
                <div className="w-full h-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="w-24 h-3 bg-gray-300 rounded animate-pulse self-end"></div>
            </div>

            {/* Action bar */}
            <div className="w-max mt-2 px-5 py-2 bg-white rounded flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-300 rounded animate-pulse"></div>
                <div className="w-7 h-7 bg-gray-300 rounded animate-pulse"></div>
            </div>
        </div>
    </div>
);
