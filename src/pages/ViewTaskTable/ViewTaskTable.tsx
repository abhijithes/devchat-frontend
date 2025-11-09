// src/pages/ViewTicketsPage.tsx
import React from "react";
import { useParams } from "react-router-dom";
import TaskTable from "../../components/TaskTable/TaskTable";

const ViewTickets: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  if (!projectId)
    return (
      <div className="p-6 text-red-500 font-semibold">Invalid project ID</div>
    );

  return <TaskTable projectId={projectId} />;
};

export default ViewTickets;
