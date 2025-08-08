import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import API from '../api';

const socket = io('http://localhost:5000');

const VotePolls = () => {
    const token = localStorage.getItem('token');
    let username=""
    const [polls, setPolls] = useState([]);
    const [comments, setComments] = useState({});
    const [newComment, setNewComment] = useState({});

    useEffect(() => {
        // Fetch all polls and comments
        API.get('/all-polls', {
            headers: { Authorization: `Bearer ${token}` },
        }).then(res => {
            setPolls(res.data.polls);

            // Initialize comments map
            const initialComments = {};
            res.data.polls.forEach(p => {
                initialComments[p._id] = p.comments || [];
            });
            setComments(initialComments);
        });

        // Poll updates (votes)
        socket.on('pollUpdated', updatedPoll => {
            setPolls(prev =>
                prev.map(p => (p._id === updatedPoll._id ? updatedPoll : p))
            );
        });

        // New comment received in real time
        socket.on('new-comment', ({ pollId, comment }) => {
            setComments(prev => ({
                ...prev,
                [pollId]: [...(prev[pollId] || []), comment],
            }));
        });
         console.log("comments: ",comments);
         
        return () => {
            socket.disconnect();
        };
    }, [token]);

    const handleVote = async (pollId, index) => {
        try {
            await API.post(
                '/vote',
                { pollId, optionIndex: index },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) {
            alert(err.response?.data?.message || 'You have already voted');
            console.error(err);
        }
    };

    const handleCommentSubmit = async (pollId) => {
        if (!newComment[pollId]) return;

        try {
            const res = await API.post(
                '/comment',
                { pollId, text: newComment[pollId] },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("result: ",res);
            username=res.data.user.username

            // Emit to others
            socket.emit('comment', {
                pollId,
                comment: res.data.text,
            });

            // Update local comment list
            setComments(prev => ({
                ...prev,
                [pollId]: [...(prev[pollId] || []), res.data.text],
            }));
            console.log("comments: ", comments);
            // Clear comment input
            setNewComment(prev => ({ ...prev, [pollId]: '' }));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Vote in Polls</h1>
            {polls.map(poll => (
                <div key={poll._id} className="border p-4 mb-6 rounded shadow">
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

                    {/* Comment Section */}
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2">Comments</h3>

                        <ul className="mb-4 max-h-40 overflow-y-auto">
                            {/* {console.log("comments: ", comments)} */}
                            
                            {(comments[poll._id] || []).map((c, idx) => (
                                <li key={idx} className="text-sm border-b py-1">
                                    {console.log("comment: ",c)}
                                    <strong>{username}:</strong> {c}
                                </li>
                            ))}
                        </ul>

                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                value={newComment[poll._id] || ''}
                                onChange={(e) =>
                                    setNewComment(prev => ({
                                        ...prev,
                                        [poll._id]: e.target.value,
                                    }))
                                }
                                className="border p-2 rounded w-full"
                            />
                            <button
                                className="bg-green-500 text-white px-3 py-1 rounded"
                                onClick={() => handleCommentSubmit(poll._id)}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default VotePolls;
