// src/services/otpService.ts
import axios from "axios";
import { endpoints } from "../constant/constant";

export const sendOtp = async (email: string) => {
  try {
    const res = await axios.post(endpoints.optSend, { email });
    return res;
  } catch (error) {
    return error.response.data.message;
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
    return error.response.data.message;
  }
};
