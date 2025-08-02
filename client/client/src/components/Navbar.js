import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('token');
    const logout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <nav>
            {isLoggedIn ? (
                <>
                    <Link to="/polls">Create Poll</Link> |{' '}
                    <Link to="/list-polls">See All Polls</Link> |{' '}
                    <button onClick={logout}>Logout</button>
            
                </>
            ) : (
                    <>
                        <Link to="/">Home</Link> |{' '}
                        <Link to="/login">Login</Link> |{' '}
                        <Link to="/register">Register</Link> |{' '}
                        <button onClick={logout}>Logout</button>
                    </>
            )}
        </nav>
    );
};

export default Navbar;
