import React, { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';
const Login = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('/auth/login', form);
            localStorage.setItem('token', res.data.token);
            navigate('/polls');
        } catch (err) {
            alert(err.response?.data?.message || 'Login failed');
        }
    };
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>

                <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        autoComplete="off"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-600 mb-1">Password</label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    Login
                </button>
            </form>
        </div>
    );
};

export default Login;
