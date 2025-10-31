import axios from "axios";
import { endpoints } from "../../../constant/constant";
import { getToken } from "../../../utils/token";

export const postComment = async (postId, commentText) => {
  try {
    const response = await axios.post(
      endpoints.addComment(postId),
      {
        commentContent: commentText,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    return response;
  } catch (error) {
    console.error(
      "Error posting comment:",
      error.response?.data || error.message
    );
  }
};
