import { useEffect, useState } from "react";
import { SearchProjects } from "../SearchProjects/SearchProjects";
import { ProjectBox } from "./projectBox";
import { arrayMove, rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { closestCorners, DndContext, type DragEndEvent } from "@dnd-kit/core";
import { endpoints } from "../../constant/constant";
import axios from "axios";

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
    const refetch = () => {
        handleChange();
    };

    return (
        <div className="pinned-projects w-full max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-end p-8">
                <h4 className="text-2xl">Projects</h4>
                <button className="text-blue-500 cursor-pointer" onClick={() => setShowPinProjects(true)}>
                    costumize pinned projects
                </button>
            </div>
            <div className="projects w-full min-h-60 centered">
                {(pins.length ?? 0) === 0 ? (
                    <p>No Pinned Projects</p>
                ) : (
                    <DndContext onDragEnd={handleDrahend} collisionDetection={closestCorners}>
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
