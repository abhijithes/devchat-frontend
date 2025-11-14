import { useEffect, useState } from "react";
import { SearchProjects } from "../SearchProjects/SearchProjects";
import { ProjectBox } from "./projectBox";
import { arrayMove, rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import {
    closestCorners,
    DndContext,
    type DragEndEvent,
    useSensor,
    useSensors,
    TouchSensor,
    MouseSensor,
} from "@dnd-kit/core";
import { endpoints } from "../../constant/constant";
import axios from "axios";
import { ArrowUpDown } from "lucide-react";

interface UserProjectsType {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    about?: string;
    createdAt: string;
    updatedAt: string;
    pinnedProjects: [
        {
            project: {
                _id: string;
                updatedAt: string;
                name: string;
                description: string;
            };
            role: string;
            _id: string;
        }
    ];
    createdProjects: [
        {
            _id: String;
            updatedAt: String;
            name: String;
            description: String;
        }
    ];
    assignedProjects: [
        {
            _id: String;
            updatedAt: String;
            name: String;
            description: String;
        }
    ];
}

export const Pinnedprojects = ({ user, handleChange }: { user: UserProjectsType; handleChange: () => void }) => {
    const [showPinProjects, setShowPinProjects] = useState(false);
    console.log("pin", user.pinnedProjects);
    const [pins, setPins] = useState<
        {
            project: {
                _id: string;
                updatedAt: string;
                name: string;
                description: string;
            };
            role: string;
            _id: string;
        }[]
    >([]);
    useEffect(() => {
        setPins(user.pinnedProjects);
    }, [user.pinnedProjects]);

    const getPos = (id: string) => pins.findIndex((p) => p.project._id === id);

    const handleDrahend = async (e: DragEndEvent) => {
        const { active, over } = e;
        if (active.id === over.id) return;

        const newPins = arrayMove(pins, getPos(active.id.toString()), getPos(over.id.toString()));
        setPins(newPins);
        const body = newPins.map((p) => {
            return { project: p.project._id, role: p.role };
        });
        const res = await axios.put(
            endpoints.updatePinnedProj(user._id),
            {
                projects: body,
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                },
            }
        );
        // await handleChange();
        return res.data;
    };

    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 100,
                tolerance: 5,
            },
        })
    );

    const refetch = () => {
        handleChange();
    };

    return (
        <div className="pinned-projects w-full p-3 mx-auto  border border-zinc-100 mt-3 rounded ">
            <div className="flex justify-between items-end px-2 ">
                <h4 className="text-lg md:text-2xl">Projects</h4>
                <button
                    title="customize pinned projects"
                    className="font-semibold cursor-pointer flex items-center justify-center gap-1 text-sm text-zinc-600 hover:text-zinc-900"
                    onClick={() => setShowPinProjects(true)}
                >
                    <ArrowUpDown size={15} />
                    customize <span className="hidden md:block">pinned</span> projects
                </button>
            </div>
            <div className="projects w-full min-h-60 centered mt-5 ">
                {(pins.length ?? 0) === 0 ? (
                    <p>No Pinned Projects</p>
                ) : (
                    <DndContext sensors={sensors} onDragEnd={handleDrahend} collisionDetection={closestCorners}>
                        <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-2">
                            <SortableContext
                                items={pins.map((p) => String(p.project._id))}
                                strategy={rectSortingStrategy}
                            >
                                {pins.map((project, index) => (
                                    <ProjectBox
                                        id={project.project._id}
                                        name={project.project.name}
                                        description={project.project.description}
                                        role={project.role}
                                        key={index}
                                    />
                                ))}
                            </SortableContext>
                        </div>
                    </DndContext>
                )}
            </div>
            {showPinProjects && (
                <SearchProjects setShowPinProjects={setShowPinProjects} user={user} refetch={refetch} />
            )}
        </div>
    );
};
