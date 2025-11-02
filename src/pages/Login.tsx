import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { endpoints } from "../constant/constant";
import { sendOtp, verifyOtp } from "../services/auth-service";
import Spinner from "../components/loaders/Spinner";

const AuthForm: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState<boolean>(true);

  // data
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  // operational states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const [otpVisible, setOtpVisible] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verificationLoading, setVerificationLoading] =
    useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

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

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      if (isLogin) {
        setSuccess("Login successful!");
        console.log("JWT token from res:", response);
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

  const hanldeSendOptp = async () => {
    setVerificationLoading(true);
    if (!email) {
      setError("Please provide an valid email");
      setSuccess("");
      return;
    } else {
      setError("");
    }

    const response = await sendOtp(email);

    if (response.status == 200) {
      setSuccess("An opt sent to your email");
      setOtpVisible(true);
      setVerificationLoading(false);
      return;
    }

    setError(
      response.response.data.message ?? "Having issue with email verification"
    );
    setEmail("");
    setVerificationLoading(false);
  };

  const handleVerifyOtp = async () => {
    setVerificationLoading(true);

    if (!otp) {
      setError("Please provide an valid email");
      setSuccess("");
      return;
    }
    setError("");
    setSuccess("");
    const response = await verifyOtp(email, otp);
    if (response.status == 200) {
      setSuccess("Your otp verified successfully");
      setError("");
      setOtpVisible(false);
      setVerified(true);
      setVerificationLoading(false);
    } else {
      setOtp("");
      setError("Having some trouble with your email check later");
      setVerificationLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-tr from-violet-100  via-white  to-violet-100 flex justify-center items-center min-h-screen">
      <div className=" md:border border-zinc-200  px-8 py-10  max-w-md w-full">
        <h2 className="text-center text-3xl bg-violet-500 text-transparent bg-clip-text mb-7 p-2 font-bold">
          {isLogin ? "Sign in" : "Sign Up"}
        </h2>

        {/* Display error message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        {/* Display success message */}
        {success && (
          <div className="bg-green-100 text-green-700 p-2 rounded mb-4 text-center">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={`text-black grid ${
            !isLogin ? "grid-cols-2" : "grid-cols-1"
          }  gap-2`}
        >
          {!isLogin && (
            <>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="FirstName"
                >
                  First Name
                </label>
                <input
                  id="FirstName"
                  className="w-full bg-transparent px-3 py-3 rounded-md border border-zinc-300  font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-2"
                  htmlFor="LastName"
                >
                  Last Name
                </label>
                <input
                  id="LastName"
                  className="w-full bg-transparent px-3 py-3 rounded-md border border-zinc-300  font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="mb-4 col-span-2">
            <label
              className="block text-sm font-medium text-gray-700 mb-2 "
              htmlFor="Email"
            >
              Email
            </label>
            <div className="flex gap-3">
              <input
                id="Email"
                className="w-full bg-transparent px-3 py-3 rounded-md border border-zinc-300  font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {!isLogin && email && !verified && !otpVisible && (
                <button
                  onClick={hanldeSendOptp}
                  className="px-5 text-xs   text-white bg-gradient-to-tr from-violet-500 to-violet-300 hover:to-violet-700 rounded cursor-pointer"
                >
                  {!verificationLoading ? "Send Otp" : <Spinner />}
                </button>
              )}
            </div>
          </div>
          {!isLogin && otpVisible && (
            <div className="col-span-2 mb-3 flex gap-3">
              <input
                id="Otp"
                className="w-full bg-transparent px-3 py-3 rounded-md border border-zinc-300  font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                type="text"
                placeholder="please enter your otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              {!isLogin && (
                <button
                  onClick={handleVerifyOtp}
                  className="px-5 text-xs text-white bg-gradient-to-tr from-violet-500 to-violet-300 hover:to-violet-700 rounded cursor-pointer"
                >
                  {!verificationLoading ? "Verify otp" : <Spinner />}
                </button>
              )}
            </div>
          )}

          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="Password"
            >
              Password
            </label>
            <input
              id="Password"
              className="w-full bg-transparent px-3 py-3 rounded-md border border-zinc-300  font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div className="mb-6">
              <label
                className="block text-sm font-medium text-gray-700 mb-2"
                htmlFor="ConfirmPassword"
              >
                Confirm Password
              </label>
              <input
                id="ConfirmPassword"
                className="w-full bg-transparent px-3 py-3 rounded-md border border-zinc-300  font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button
            className="w-full bg-violet-500 text-white font-bold py-3 rounded-md  shadow-lg transition-all duration-300 ease-in-out col-span-2 disabled:bg-violet-300 disabled:cursor-not-allowed"
            type="submit"
            disabled={!verified}
          >
            {loading ? "Processing..." : isLogin ? "Login" : "Create Account"}
          </button>

          <p className="text-center text-sm text-gray-600 mt-5 col-span-2">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
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
