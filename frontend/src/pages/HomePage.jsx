import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const HomePage = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <div style={{ padding: '50px' }}>
            <h1>Welcome to the E-Theatre!</h1>

            {user ? (
                // If user is logged in
                <div>
                    <p>Hello, {user.username}!</p>
                    {/* We'll add a "Create Room" button here later */}
                    <button onClick={logout}>Logout</button>
                </div>
            ) : (
                // If user is logged out
                <div>
                    <p>Please log in or register to join a theatre.</p>
                    <Link to="/login" style={{ marginRight: '10px' }}>
                        <button>Login</button>
                    </Link>
                    <Link to="/register">
                        <button>Register</button>
                    </Link>
                </div>
            )}
        </div>
    );
};

export default HomePage;