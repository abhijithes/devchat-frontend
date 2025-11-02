import axios from "axios";
import { endpoints } from "../../../constant/constant";
import { getToken } from "../../../utils/token";

export const generalHeader = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  },
};

export const postComment = async (postId, commentText, ) => {
  try {
    const response = await axios.post(
      endpoints.addComment(postId),
      {
        commentContent: commentText,
        
      },
      generalHeader
    );

    return response;
  } catch (error) {
    console.error(
      "Error posting comment:",
      error.response?.data || error.message
    );
  }
};

export const editComment = async (taskId, commentId, updatedComment) => {
  try {
    const response = await axios.patch(
      endpoints.editComment(taskId, commentId),
      {
        commentContent: updatedComment,
      },
      generalHeader
    );
    return response;
  } catch (error) {
    return error.response || { status: 500, data: { message: "Server error" } };
  }
};

export const deleteComment = async (taskId, commentId) => {
  try {
    const response = await axios.delete(
      endpoints.deleteComment(taskId, commentId),
      generalHeader
    );
    return response;
  } catch (error) {
    return error.response || { status: 500, data: { message: "Server error" } };
  }
};
