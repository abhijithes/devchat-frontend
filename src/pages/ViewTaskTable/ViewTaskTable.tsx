// src/pages/ViewTicketsPage.tsx
import React from "react";
import { useParams } from "react-router-dom";
import TaskTable from "../../components/TaskTable/TaskTable";

const ViewTickets: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();

    if (!projectId) return <div className="p-6 text-red-500 font-semibold">Invalid project ID</div>;

    return (
        <div className="md:p-6">
            <TaskTable projectId={projectId} />
        </div>
    );
};

export default ViewTickets;
