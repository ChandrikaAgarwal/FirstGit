import { useEffect, useState } from 'react';
// import axios from 'axios';
import API from '../api'

const ListPolls = () => {
    const [polls, setPolls] = useState([]);

    useEffect(() => {
        API.get('/all-polls')
            .then(res => { 
                setPolls(res.data.polls)
            })
            .catch(err => console.log(err));
    }, []);

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">All Polls</h1>
            {polls.map(poll => (
                <div key={poll._id} className="border p-4 mb-4 rounded shadow">
                    <h2 className="text-xl font-semibold">{poll.question}</h2>
                    <ul className="mt-2">
                        {poll.options.map((option, index) => (
                            <li key={index} className="flex justify-between mt-1">
                                <span>{option.text}</span>
                                <span>{option.votes} votes</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default ListPolls;
