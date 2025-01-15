'use client'
import React, { useState } from "react";
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { toast } from "sonner";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "",
    domain: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "email") {
      setErrors((prev) => ({
        ...prev,
        email: value.includes("@") ? "" : "Email must include '@'.",
      }));
    } else if (name === "password") {
      setErrors((prev) => ({
        ...prev,
        password: value.length >= 8 ? "" : "Password must be at least 8 characters.",
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation before submission
    if (!formData.email.includes("@")) {
      setErrors((prev) => ({
        ...prev,
        email: "Email must include '@'.",
      }));
      return;
    }

    if (formData.password.length < 8) {
      setErrors((prev) => ({
        ...prev,
        password: "Password must be at least 8 characters.",
      }));
      return;
    }

    setLoading(true);
    const nameFromEmail = formData.email.split('@')[0];

    try {
      const req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
          balance: 0,
          domain: formData.role === "enterprise" ? formData.domain : '',
          name: nameFromEmail,
        }),
      });

      const data = await req.json();
      if (req.ok) {
        toast.success("Signup Successfully");
        setFormData({ email: "", password: "", role: "", domain: "" });
        setTimeout(() => {
          window.location.replace("/auth/signIn");
        }, 1500);
      } else {
        toast.error(data.errors[0]?.data.errors[0]?.message || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-800 to-indigo-700 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-4">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="inline text-gray-700">Email</label><span className="text-red-500 inline">*</span>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full px-2 py-2 text-black border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div className="relative">
            <label htmlFor="password" className="inline text-gray-700">Password</label><span className="text-red-500 inline">*</span>
            <input
              type={passwordVisible ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`w-full px-2 py-2 text-black border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 ${errors.password ? 'border-red-500' : ''}`}
            />
            <span
              className="absolute inset-y-0 right-3 top-6  flex items-center cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {passwordVisible ? (
                <AiFillEyeInvisible size={24} className="text-gray-500" />
              ) : (
                <AiFillEye size={24} className="text-gray-500" />
              )}
            </span>
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
          </div>
          <div>
            <label htmlFor="role" className="inline text-gray-700">Role</label><span className="text-red-500 inline">*</span>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-2 py-2 border text-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="" disabled>
                Select a role
              </option>
              <option value="enterprise">Enterprise</option>
              <option value="professional">Professional</option>
              <option value="user">User</option>
            </select>
          </div>
          {formData.role === "enterprise" && (
            <div>
              <label htmlFor="domain" className="inline text-gray-700">Domain</label><span className="text-red-500 inline">*</span>
              <input
                type="text"
                id="domain"
                name="domain"
                value={formData.domain}
                onChange={handleChange}
                required
                className="w-full px-2 py-2 text-black border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          Already have an account? <a href="/auth/signIn" className="text-indigo-500 hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
