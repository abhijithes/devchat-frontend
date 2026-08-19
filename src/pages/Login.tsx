import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { endpoints } from "../constant/constant";
import { sendOtp, signInWithGoogle, verifyOtp } from "../services/auth-service";
import Spinner from "../components/loaders/Spinner";
import { useSnackBar } from "../components/snack-bar/snack-bar-context";

type AuthResponse = {
    token?: string;
    jwt?: string;
    accessToken?: string;
    session?: string;
    publicData?: unknown;
    user?: unknown;
    message?: string;
};

const AuthForm: React.FC = () => {
    const navigate = useNavigate();
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
    const googleButtonWrapperRef = useRef<HTMLDivElement>(null);
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
    const [googleLoading, setGoogleLoading] = useState(false);
    const [googleButtonWidth, setGoogleButtonWidth] = useState(336);
    const [verificationLoading, setVerificationLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [otpVisible, setOtpVisible] = useState(false);
    const [verified, setVerified] = useState(false);

    const { showSnackBar } = useSnackBar();

    useEffect(() => {
        const wrapper = googleButtonWrapperRef.current;
        if (!wrapper) return;

        const syncWidth = () => {
            setGoogleButtonWidth(Math.max(200, Math.floor(wrapper.clientWidth)));
        };

        syncWidth();
        const resizeObserver = new ResizeObserver(syncWidth);
        resizeObserver.observe(wrapper);

        return () => resizeObserver.disconnect();
    }, []);

    const getErrorMessage = (err: unknown, fallback: string) => {
        return err instanceof Error ? err.message : fallback;
    };

    const completeLogin = (data: AuthResponse) => {
        const token = data.token || data.jwt || data.accessToken || data.session;
        const publicData = data.publicData || data.user;

        if (!token) {
            throw new Error("Login succeeded, but no session token was returned");
        }

        localStorage.setItem("token", token);

        if (publicData) {
            localStorage.setItem("DEV_CHATX_USER_URD", JSON.stringify(publicData));
        }

        navigate("/");
    };

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
            const payload = isLogin ? { email, password } : { firstName, lastName, email, password };

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${localStorage.getItem("token") || ""}`,
                },
                body: JSON.stringify(payload),
            });

            const data = (await response.json()) as AuthResponse;

            if (!response.ok) throw new Error(data.message || "Something went wrong");

            if (isLogin && response.ok) {
                setSuccess("Login successful!");
                completeLogin(data);
            } else {
                setSuccess("Account created successfully!");
                setIsLogin(true);
            }
        } catch (err: unknown) {
            setError(getErrorMessage(err, "Failed to connect to the server"));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credential?: string) => {
        if (!credential) {
            setError("Google did not return a sign-in credential");
            return;
        }

        setGoogleLoading(true);
        setError("");
        setSuccess("");

        try {
            const data = await signInWithGoogle(credential);
            setSuccess("Login successful!");
            completeLogin(data);
        } catch (err: unknown) {
            setError(getErrorMessage(err, "Google sign-in failed. Try again later."));
        } finally {
            setGoogleLoading(false);
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
                showSnackBar("Currently in Beta — please check your spam folder.", "info", 4000);
            } else {
                setError("Failed to send OTP. Try again later.");
            }
        } catch (err: unknown) {
            setError(getErrorMessage(err, "Having issues with email verification. Try later."));
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
        } catch (err: unknown) {
            console.log(err);
            setError(getErrorMessage(err, "Having trouble verifying your OTP. Try later."));
        } finally {
            setVerificationLoading(false);
        }
    };

    const { firstName, lastName, email, otp, password, confirmPassword } = formData;

    return (
        <div className="bg-gradient-to-tr from-violet-100 via-white to-violet-100 flex justify-center items-center min-h-screen">
            <div className="md:border border-zinc-200 px-8 py-10 max-w-md w-full">
                <h2 className="text-center text-3xl bg-violet-500 text-transparent bg-clip-text mb-7 p-2 font-bold">
                    {isLogin ? "Sign in" : "Sign Up"}
                </h2>

                {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center">{error}</div>}
                {success && <div className="bg-green-100 text-green-700 p-2 rounded mb-4 text-center">{success}</div>}

                <form
                    onSubmit={handleSubmit}
                    className={`text-black grid ${!isLogin ? "grid-cols-2" : "grid-cols-1"} gap-2`}
                >
                    {!isLogin && (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
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

                    {isLogin && (
                        <div className="col-span-2">
                            <div className="flex items-center gap-3 my-5">
                                <div className="h-px flex-1 bg-zinc-200" />
                                <span className="text-xs font-medium text-gray-500">or</span>
                                <div className="h-px flex-1 bg-zinc-200" />
                            </div>

                            <div ref={googleButtonWrapperRef} className="google-signin-button w-full min-h-11">
                                {!googleClientId ? (
                                    <div className="w-full bg-red-100 text-red-700 p-2 rounded text-center text-sm">
                                        Google Sign-In is missing VITE_GOOGLE_CLIENT_ID
                                    </div>
                                ) : googleLoading ? (
                                    <div className="flex items-center justify-center h-11">
                                        <Spinner />
                                    </div>
                                ) : (
                                    <GoogleLogin
                                        onSuccess={(credentialResponse) =>
                                            handleGoogleSuccess(credentialResponse.credential)
                                        }
                                        onError={() => setError("Google sign-in failed. Try again later.")}
                                        theme="outline"
                                        size="medium"
                                        text="signin_with"
                                        shape="rectangular"
                                        logo_alignment="left"
                                        width={String(googleButtonWidth)}
                                    />
                                )}
                            </div>
                        </div>
                    )}

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
