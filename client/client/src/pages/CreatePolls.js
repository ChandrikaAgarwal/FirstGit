import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // Adjust if needed

const CreatePoll = () => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [expiresAt, setExpiresAt] = useState('');
    const navigate = useNavigate();

    const handleOptionChange = (value, index) => {
        const updated = [...options];
        updated[index] = value;
        setOptions(updated);
    };

    const addOption = () => setOptions([...options, '']);
    const removeOption = (index) => {
        if (options.length <= 2) return;
        setOptions(options.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                'http://localhost:5000/api/polls/create',
                { question, options, expiresAt },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            socket.emit('newPoll', res.data); // Notify others
            navigate('/polls');
        } catch (err) {
            console.error(err);
            alert('Failed to create poll');
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-center">Create a New Poll</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Question</label>
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Options</label>
                    {options.map((opt, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                            <input
                                type="text"
                                value={opt}
                                onChange={(e) => handleOptionChange(e.target.value, index)}
                                required
                                className="flex-1 p-2 border border-gray-300 rounded-xl focus:outline-none"
                            />
                            {options.length > 2 && (
                                <button type="button" onClick={() => removeOption(index)} className="text-red-500 font-bold">
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addOption} className="text-blue-600 mt-1">+ Add Option</button>
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Expiry (optional)</label>
                    <input
                        type="datetime-local"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-xl"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
                >
                    Create Poll
                </button>
            </form>
        </div>
    );
};

export default CreatePoll;
