import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import API from '../api'



const VotePolls = () => {
    const token = localStorage.getItem('token');
    const [polls, setPolls] = useState([]);

    useEffect(() => {
        API.get('/all-polls',
            { headers: { Authorization: `Bearer ${token}` } }
        )
            .then(res => setPolls(res.data.polls));
        const socket = io('http://localhost:5000');
        
        socket.on('pollUpdated', updatedPoll => {
            setPolls(prev =>
                prev.map(p => (p._id === updatedPoll._id ? updatedPoll : p))
            );
        });

        return () => socket.disconnect();
    }, []);

    const handleVote = async (pollId, index) => {
        try {
            const response = await API.post('/vote', {
                pollId,
                optionIndex: index,
            },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) {
            alert(err.response?.data?.message || 'You have already voted');
            console.error(err);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Vote in Polls</h1>
            {polls.map(poll => (
                <div key={poll._id} className="border p-4 mb-4 rounded shadow">
                    <h2 className="text-xl font-semibold">{poll.question}</h2>
                    <ul className="mt-2">
                        {poll.options.map((option, index) => (
                            <li
                                key={index}
                                className="flex justify-between items-center mt-2"
                            >
                                <span>{option.text}</span>
                                <button
                                    className="ml-4 px-3 py-1 bg-blue-500 text-white rounded"
                                    onClick={() => handleVote(poll._id, index)}
                                >
                                    Vote ({option.votes})
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default VotePolls;
