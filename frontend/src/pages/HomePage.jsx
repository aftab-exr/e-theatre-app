import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// 1. Import our new components
import CreateRoomForm from '../components/CreateRoomForm';
import RoomList from '../components/RoomList';

const HomePage = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <div style={{ maxWidth: '800px', margin: '50px auto' }}>
            <h1>Welcome to the E-Theatre!</h1>

            {user ? (
                // --- LOGGED-IN VIEW ---
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>Hello, {user.username}!</h3>
                        <button onClick={logout}>Logout</button>
                    </div>

                    <hr style={{ margin: '20px 0' }} />

                    {/* 2. Add our new components */}
                    <CreateRoomForm />
                    <RoomList />
                </div>
            ) : (
                // --- LOGGED-OUT VIEW ---
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