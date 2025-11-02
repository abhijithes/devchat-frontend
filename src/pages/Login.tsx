import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { endpoints } from "../constant/constant";
import { sendOtp, verifyOtp } from "../services/auth-service";
import Spinner from "../components/loaders/Spinner";
import { useSnackBar } from "../components/snack-bar/snack-bar-context";

const AuthForm: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpVisible, setOtpVisible] = useState(false);
  const [verified, setVerified] = useState(false);

  const { showSnackBar } = useSnackBar();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { firstName, lastName, email, password, confirmPassword } = formData;

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? endpoints.login : endpoints.register;
      const payload = isLogin
        ? { email, password }
        : { firstName, lastName, email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Something went wrong");

      if (isLogin) {
        setSuccess("Login successful!");
        localStorage.setItem("token", data.token);
        localStorage.setItem(
          "DEV_CHATX_USER_URD",
          JSON.stringify(data.publicData)
        );
        navigate("/");
      } else {
        setSuccess("Account created successfully!");
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    const { email } = formData;
    if (!email) {
      setError("Please provide a valid email");
      return;
    }

    setVerificationLoading(true);
    setError("");
    try {
      const response = await sendOtp(email);
      if (response.status === 200) {
        setSuccess("An OTP has been sent to your email");
        setOtpVisible(true);
        showSnackBar(
          "Currently in Beta — please check your spam folder.",
          "info",
          4000
        );
      } else {
        setError("Failed to send OTP. Try again later.");
      }
    } catch (err: any) {
      setError(
        err.message || "Having issues with email verification. Try later."
      );
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const { email, otp } = formData;

    if (!otp) {
      setError("Please enter the OTP sent to your email");
      return;
    }

    setVerificationLoading(true);
    setError("");
    try {
      const response = await verifyOtp(email, otp);
      if (response.status === 200) {
        setSuccess("Your OTP was verified successfully!");
        setOtpVisible(false);
        setVerified(true);
      } else {
        setError("Invalid or expired OTP. Please try again.");
      }
    } catch (err: any) {
      console.log(err);
      setError(err.message || "Having trouble verifying your OTP. Try later.");
    } finally {
      setVerificationLoading(false);
    }
  };

  const { firstName, lastName, email, otp, password, confirmPassword } =
    formData;

  return (
    <div className="bg-gradient-to-tr from-violet-100 via-white to-violet-100 flex justify-center items-center min-h-screen">
      <div className="md:border border-zinc-200 px-8 py-10 max-w-md w-full">
        <h2 className="text-center text-3xl bg-violet-500 text-transparent bg-clip-text mb-7 p-2 font-bold">
          {isLogin ? "Sign in" : "Sign Up"}
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 p-2 rounded mb-4 text-center">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={`text-black grid ${
            !isLogin ? "grid-cols-2" : "grid-cols-1"
          } gap-2`}
        >
          {!isLogin && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  name="firstName"
                  value={firstName}
                  onChange={handleChange}
                  type="text"
                  placeholder="First name"
                  className="w-full bg-transparent px-3 py-3 rounded-md border border-zinc-300 font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  name="lastName"
                  value={lastName}
                  onChange={handleChange}
                  type="text"
                  placeholder="Last name"
                  className="w-full bg-transparent px-3 py-3 rounded-md border border-zinc-300 font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
              </div>
            </>
          )}

          {/* Email + OTP */}
          <div className="mb-4 col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="flex gap-3">
              <input
                name="email"
                value={email}
                onChange={handleChange}
                type="email"
                placeholder="Email"
                className="w-full bg-transparent px-3 py-3 rounded-md border border-zinc-300 font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              />
              {!isLogin && email && !verified && !otpVisible && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="px-5 text-xs text-white bg-gradient-to-tr from-violet-500 to-violet-300 hover:to-violet-700 rounded cursor-pointer"
                >
                  {!verificationLoading ? "Send OTP" : <Spinner />}
                </button>
              )}
            </div>
          </div>

          {!isLogin && otpVisible && (
            <div className="col-span-2 mb-3 flex gap-3">
              <input
                name="otp"
                value={otp}
                onChange={handleChange}
                type="text"
                placeholder="Enter OTP"
                className="w-full bg-transparent px-3 py-3 rounded-md border border-zinc-300 font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              />
              <button
                type="button"
                onClick={handleVerifyOtp}
                className="px-5 text-xs text-white bg-gradient-to-tr from-violet-500 to-violet-300 hover:to-violet-700 rounded cursor-pointer"
              >
                {!verificationLoading ? "Verify OTP" : <Spinner />}
              </button>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              name="password"
              value={password}
              onChange={handleChange}
              type="password"
              placeholder="Password"
              className="w-full bg-transparent px-3 py-3 rounded-md border border-zinc-300 font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
            />
          </div>

          {!isLogin && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                type="password"
                placeholder="Confirm password"
                className="w-full bg-transparent px-3 py-3 rounded-md border border-zinc-300 font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={!isLogin && !verified}
            className="w-full bg-violet-500 text-white font-bold py-3 rounded-md shadow-lg transition-all duration-300 ease-in-out col-span-2 disabled:bg-violet-300 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : isLogin ? "Login" : "Create Account"}
          </button>

          <p className="text-center text-sm text-gray-600 mt-5 col-span-2">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setOtpVisible(false);
                setVerified(false);
                setSuccess("");
                setError("");
              }}
              className="text-violet-600 font-semibold hover:underline hover:text-violet-800 transition-colors duration-200"
            >
              {isLogin ? "Sign up" : "Login"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
