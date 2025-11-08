import { useQuery, useQueryClient } from "@tanstack/react-query";
import { endpoints } from "../../constant/constant";
import api from "../../utils/axios";
import UserIcon from "../userIcon/usericon";
import type { DetailedTaskViewType } from "./TaskTypes";
import { getPriorityColor } from "./TaskTable";
import { X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  deleteComment,
  editComment,
  postComment,
} from "./services/task-detail-service";
import { useSnackBar } from "../snack-bar/snack-bar-context";
import { Delete, EditDocument } from "@mui/icons-material";
import Spinner from "../loaders/Spinner";
import { datePipe } from "../../utils/date";
import { getUserPublicInfo } from "../../utils/token";
import TicketDetailsSkeleton from "./TicketSkeleton";
interface DetailedTaskViewProps {
  id: string;
}

const gettaskDetails = async (id) => {
  const res = await api.get<DetailedTaskViewType>(endpoints.getTaskData(id));
  return res.data;
};

export const DetailedTaskView: React.FC<DetailedTaskViewProps> = ({ id }) => {
  const [isCommentShow, setIsCommentShown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedComment, setSelectedComment] = useState<any>();
  const sectionRef = useRef<HTMLDivElement>(null);

  const { showSnackBar } = useSnackBar();
  const queryClient = useQueryClient();
  const user = getUserPublicInfo();

  const { data, isLoading } = useQuery<DetailedTaskViewType, Error>({
    queryKey: ["taskDetails", id],
    queryFn: () => gettaskDetails(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (isCommentShow && sectionRef.current) {
      sectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [isCommentShow]);

  const handleAddComment = async (comment: string) => {
    setLoading(true);
    const res = await postComment(id, comment);
    if (res.status == 201) {
      showSnackBar("New comment added successfully", "success", 2000);
      queryClient.invalidateQueries({ queryKey: ["taskDetails", id] });
      setLoading(false);
      setIsCommentShown(false);
    } else {
      showSnackBar(
        res.data?.message || "Failed to update comment",
        "error",
        2000
      );
    }
  };

  const handleEdit = async (commentId, updatedComment) => {
    setLoading(true);
    const res = await editComment(id, commentId, updatedComment);
    setLoading(false);

    if (res.status === 200) {
      queryClient.invalidateQueries({ queryKey: ["taskDetails", id] });
      setSelectedComment(null);
      setIsCommentShown(false);
      showSnackBar("Comment updated successfully", "success", 2000);
    } else {
      showSnackBar(
        res.data?.message || "Failed to update comment",
        "error",
        2000
      );
    }
  };

  const handleDelete = async (commentId) => {
    setLoading(true);
    const res = await deleteComment(id, commentId);
    setLoading(false);

    if (res.status === 200) {
      queryClient.invalidateQueries({ queryKey: ["taskDetails", id] });
      showSnackBar("Comment deleted successfully", "success", 2000);
    } else {
      showSnackBar(
        res.data?.message || "Failed to delete comment",
        "error",
        2000
      );
    }
  };

  if (isLoading) {
    return <TicketDetailsSkeleton />;
  }

  return (
    <div className="pb-8 ">
      <p className="font-semibold">{data?.ticket.taskId}</p>
      <h1 className="text-xl">{data?.ticket.name}</h1>
      <p className="mt-2 text-zinc-500">No detailed description mentioned</p>
      <br />
      <div className="flex-left gap-3">
        <div className={`bg-amber-400 w-3 h-3 rounded-sm`}></div>
        <p>{data?.ticket.status}</p>
      </div>
      <div className="flex-left gap-3">
        <div
          className={`${getPriorityColor(
            data?.ticket.priority
          )} w-3 h-3 rounded-sm`}
        ></div>
        <p>{data?.ticket.priority}</p>
      </div>
      <br />
      <p>
        {data?.ticket.dueDate &&
          new Date(data.ticket.dueDate).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
      </p>
      <br />
      {data?.ticket.assignee && (
        <div className="mt-5">
          <h1 className="sub-heading">Assignee</h1>
          <div className="flex-left gap-2 mt-3">
            {data.ticket.assignee && <UserIcon user={data?.ticket.assignee} />}
            <h3 className="flex flex-col ">
              {data?.ticket.assignee?.firstName}{" "}
              {data?.ticket.assignee?.lastName}
              <p className="text-sm">{data?.ticket.assignee?.email}</p>
            </h3>
          </div>
        </div>
      )}

      {data?.ticket.assigner && (
        <div className="mt-5">
          <h1 className="sub-heading">Assigner</h1>
          <div className="flex-left gap-2 mt-3">
            {data.ticket.assigner && <UserIcon user={data?.ticket.assigner} />}
            <h3 className="flex flex-col ">
              {data?.ticket.assigner?.firstName}{" "}
              {data?.ticket.assigner?.lastName}
              <p className="text-sm">{data?.ticket.assigner?.email}</p>
            </h3>
          </div>
        </div>
      )}
      <br />
      <h1 className="sub-heading ">Documents and files attached</h1>
      <div className="w-full min-h-40 bg-zinc-50 mt-5 rounded-2xl grid place-items-center">
        <span className="null-value-text">No docs found!</span>
      </div>
      <br />
      <div>
        {loading && (
          <div className="w-full h-16 grid place-items-center">
            <Spinner />
          </div>
        )}
        <div ref={sectionRef} id="scroll_in"></div>
        <CommentForm
          onSubmit={
            selectedComment
              ? (comment) => handleEdit(selectedComment._id, comment)
              : (comment) => handleAddComment(comment)
          }
          onClose={() => {
            setSelectedComment(null);
            setIsCommentShown(false);
          }}
          isVisible={isCommentShow}
          pre_comment={selectedComment?.comment ?? null}
          isUpdate={!!selectedComment}
        />
        <div className="w-full flex items-center justify-between">
          <h1 className="sub-heading">Comments</h1>
          <button
            onClick={() => setIsCommentShown(!isCommentShow)}
            className={`${
              isCommentShow ? "input-grad-btn-cancel" : " input-grad-btn"
            }`}
          >
            {isCommentShow ? (
              <X onClick={() => setSelectedComment(null)} />
            ) : (
              "New"
            )}
          </button>
        </div>
        <div className="mt-8">
          {data?.ticket.comments.length === 0 && (
            <span className="null-value-text">No comments found!</span>
          )}
          {data?.ticket.comments.map((data, _index) => (
            <div
              className="border-b border-zinc-200 pb-4 mb-4 last:border-0"
              key={_index}
            >
              <div className="w-full  h-full p-3 flex gap-3 hover:bg-zinc-100">
                {data?.creator && <UserIcon user={data?.creator} />}
                <div className="w-full">
                  <div className="flex gap-2 items-center justify-between">
                    <p className="text-zinc-700">{data?.creator?.firstName}</p>
                    <div className="flex items-center">
                      <p className="text-xs mr-3">
                        {datePipe(
                          data.createdAt,
                          data.creator?._id === user.id
                        )}
                      </p>
                      {data.creator?._id === user.id && (
                        <div className="flex">
                          <div
                            onClick={() => {
                              setSelectedComment(data);
                              setIsCommentShown(true);
                            }}
                          >
                            <EditDocument
                              fontSize="small"
                              className="text-zinc-400 hover:text-black"
                            />
                          </div>
                          <div onClick={() => handleDelete(data._id)}>
                            <Delete
                              fontSize="small"
                              className="text-zinc-400 hover:text-black"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap">{data.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetailedTaskView;

// comment input section
export const CommentForm: React.FC<{
  onSubmit: (comment: string) => void;
  onClose?: () => void;
  pre_comment?: string;
  isUpdate?: boolean;
  isVisible?: boolean;
}> = ({ onSubmit, pre_comment, isUpdate, onClose, isVisible }) => {
  const [comment, setComment] = useState(pre_comment || "");

  return (
    <div
      className={`w-full min-h-80 bg-white  p-3 flex flex-col gap-3 items-start rounded-t-3xl shadow-top shadow-black  border border-zinc-200 absolute ${
        isVisible ? "bottom-0" : "-bottom-full"
      }   left-0 z-999  overflow-auto transition-all duration-400`}
    >
      <h1 className="font-medium text-lg mx-3 ">
        {pre_comment ? "Update" : "Add"} comment
      </h1>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Type a comment..."
        className="w-full min-h-56 p-4 border-none outline-none bg-zinc-50 rounded-3xl"
      />

      <div className="w-full flex gap-5 items-center justify-end  ">
        <button onClick={() => onClose?.()} className="input-grad-btn-invert">
          Cancel
        </button>
        <button
          onClick={() => {
            onSubmit(comment);
          }}
          className="input-grad-btn"
        >
          {isUpdate ? "Update" : "Post"}
        </button>
      </div>
    </div>
  );
};
