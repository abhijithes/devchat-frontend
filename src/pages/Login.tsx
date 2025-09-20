import React, { useState } from "react";

const AuthForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const API_BASE_URL = "http://localhost:5001/api/users";

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
      const endpoint = isLogin ? "/login" : "/register";
      const payload = isLogin
        ? { email, password }
        : { firstName, lastName, email, password };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      if (isLogin) {
        setSuccess("Login successful!");
        localStorage.setItem("token", data.token); // 🔹 Save JWT token
      } else {
        setSuccess("Account created successfully!");
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#eff1f3] to-[#d0d1d8] flex justify-center items-center min-h-screen">
      <div className="bg-zinc-50 rounded-xl px-8 py-10 shadow-2xl max-w-md w-full">
        <h2 className="text-center text-3xl bg-violet-500 text-transparent bg-clip-text mb-7 font-bold">
          {isLogin ? "Login" : "Sign Up"}
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

        <form onSubmit={handleSubmit}>
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
                  className="w-full bg-gray-300 px-3 py-3 rounded-md border border-gray-300 text-black font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
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
                  className="w-full bg-gray-300 px-3 py-3 rounded-md border border-gray-300 text-black font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="Email"
            >
              Email
            </label>
            <input
              id="Email"
              className="w-full bg-gray-300 px-3 py-3 rounded-md border border-gray-300 text-black font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-sm font-medium text-gray-700 mb-2"
              htmlFor="Password"
            >
              Password
            </label>
            <input
              id="Password"
              className="w-full bg-gray-300 px-3 py-3 rounded-md border border-gray-300 text-black font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
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
                className="w-full bg-gray-300 px-3 py-3 rounded-md border border-gray-300 text-black font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button
            className="w-full bg-violet-500 text-white font-bold py-3 rounded-md hover:bg-violet-700 shadow-lg transition-all duration-300 ease-in-out"
            type="submit"
            disabled={loading}
          >
            {loading ? "Processing..." : isLogin ? "Login" : "Create Account"}
          </button>

          <p className="text-center text-sm text-gray-600 mt-5">
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
