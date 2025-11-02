import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Import our context

const LoginPage = () => {
    // Form state
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Error and loading state
    const [error, setError] = useState(null);

    // Get the 'login' function and 'loading' state from our context
    const { login, loading } = useContext(AuthContext);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault(); // Stop the form from refreshing the page
        setError(null);     // Clear any previous errors

        // Call the login function from our AuthContext
        // This function handles the API call and token storage
        const success = await login(username, password);

        if (success) {
            // If login was successful, redirect to the home page
            navigate('/');
        } else {
            // If login failed, show an error
            setError("Login failed. Please check your username and password.");
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto' }}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Username</label>
                    <input
                        type="text"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={{ width: '100%' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%' }}
                    />
                </div>

                {/* Display any errors here */}
                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    style={{ width: '100%', padding: '10px' }}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <p style={{ marginTop: '10px' }}>
                Don't have an account? <Link to="/register">Register here</Link>
            </p>
        </div>
    );
};

export default LoginPage;