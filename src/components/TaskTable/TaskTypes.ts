
export interface Assignee {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
}

export interface Task {
    _id: string
    name: string;
    priority: string;
    status: string;
    assignee: Assignee;
    assigner?: Assignee;
    dueDate: string;
    taskId: string;
}

export interface CreatedBy {
    _id: string;
    email: string;
}

export interface ProjectInfo {
    name: string;
    createdAt: string;
    updatedAt: string;
    createdBy: CreatedBy;
}

export interface Member {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
}

export interface ProjectTaskResponse {
    project: ProjectInfo;
    data: Task[];
    userRole: "member" | "manager" | "owner" | "admin";
    page: number;
    limit: number;
    totalTasks: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    members: Member[];
}

export interface DetailedTaskView {
    _id: string;
    name: string;
    priority: string;
    status: string;
    assigner?: Assignee;
    assignee?: Assignee;
    project: ProjectInfo;
    dueDate: string;
    taskId: string;
    documents: any[];
    comments: any[];
    createdAt: string;
    updatedAt: string;
    __v: number;
    taskDescription: string;
}