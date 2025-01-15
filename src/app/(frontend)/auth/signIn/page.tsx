'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const router = useRouter();

  const validateEmail = (email) => email.includes('@');
  const validatePassword = (password) => password.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEmailError('');
    setPasswordError('');

    let hasError = false;
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address.');
      hasError = true;
    }
    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 8 characters long.');
      hasError = true;
    }

    if (hasError) {
      setLoading(false);
      return;
    }

    try {
      const req = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });
      const data = await req.json();
      console.log('data: ' + data);
      if (req.ok) {
        toast.success('Signed in Successfully');
        setTimeout(() => {
          window.location.replace('/dashboard');
        }, 1500);
      } else {
        toast.error('Invalid email or password');
      }
    } catch (err) {
      toast.error(err.response?.data?.message);
      console.error('Login error:', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-800 to-indigo-700">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-indigo-900">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="inline text-sm font-medium text-gray-700">Email</label>
            <span className="text-red-500 inline">*</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full px-4 py-2 border text-black rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition duration-200 ${
                emailError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
          </div>
          <div className="relative">
            <label className="inline text-sm font-medium text-gray-700">Password</label>
            <span className="text-red-500 inline">*</span>
            <input
              type={passwordVisible ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full px-4 py-2 border text-black rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition duration-200 ${
                passwordError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <div
              onClick={() => setPasswordVisible(!passwordVisible)}
              className="absolute inset-y-0 right-3 top-6 flex items-center cursor-pointer"
            >
              {passwordVisible ? (
                <AiFillEyeInvisible size={24} className="text-gray-500" />
              ) : (
                <AiFillEye size={24} className="text-gray-500" />
              )}
            </div>
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 text-white rounded-lg bg-indigo-600 hover:bg-indigo-700 transition duration-200 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600">
          Don&apos;t have an account? <a href="/auth/signup" className="text-indigo-500 hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  );
}

export default SignIn;
