// src/services/otpService.ts
import axios from "axios";
import { endpoints } from "../constant/constant";

export const sendOtp = async (email: string) => {
  try {
    const res = await axios.post(endpoints.optSend, { email });
    return res;
  } catch (error: any) {
    console.error("Send OTP Error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Failed to send OTP" };
  }
};

export const verifyOtp = async (email: string, otp: string) => {
  try {
    const res = await axios.post(endpoints.otpVerify, {
      email,
      otp,
    });
    return res.data;
  } catch (error: any) {
    console.error("Verify OTP Error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Failed to verify OTP" };
  }
};
