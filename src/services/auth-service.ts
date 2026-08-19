// src/services/otpService.ts
import axios from "axios";
import { endpoints } from "../constant/constant";

type GoogleAuthResponse = {
  token?: string;
  jwt?: string;
  accessToken?: string;
  session?: string;
  publicData?: unknown;
  user?: unknown;
  message?: string;
};

export const sendOtp = async (email: string) => {
  try {
    const res = await axios.post(endpoints.optSend, { email });
    return res;
  } catch (error) {
    throw new Error(error.response.data.message);
  }
};

export const verifyOtp = async (email: string, otp: string) => {
  try {
    const res = await axios.post(endpoints.otpVerify, {
      email,
      otp,
    });
    return res;
  } catch (error) {
    throw new Error(error.response.data.message);
  }
};

export const signInWithGoogle = async (credential: string) => {
  const response = await fetch(endpoints.googleLogin, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ credential }),
  });

  const data = (await response.json()) as GoogleAuthResponse;

  if (!response.ok) {
    throw new Error(data.message || "Google sign-in failed");
  }

  return data;
};
