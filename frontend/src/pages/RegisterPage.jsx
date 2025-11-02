import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link

const RegisterPage = () => {
    // We use a single state object to hold all form data
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: ''
    });

    // State for loading and any error messages
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // This hook allows us to redirect the user
    const navigate = useNavigate();

    // A single handler to update our state object
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Stop the form from refreshing the page
        setError(null);     // Clear any previous errors
        setLoading(true);

        // 1. Client-side check for password match
        if (formData.password !== formData.password2) {
            setError("Passwords do not match.");
            setLoading(false);
            return; // Stop the function
        }

        try {
            // 2. Send the data to the backend
            // We only send the fields the API expects
            await axios.post('http://localhost:8000/auth/register/', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                password2: formData.password2
            });

            // 3. Handle Success
            setLoading(false);
            // Redirect to the login page
            navigate('/login');

        } catch (err) {
            // 4. Handle Errors
            setLoading(false);
            if (err.response && err.response.data) {
                // If the backend sends validation errors
                // (e.g., "email already exists")
                // We'll format and display them.
                const errorData = err.response.data;
                const errorMsg = Object.values(errorData).join(' ');
                setError(errorMsg);
            } else {
                // Generic error
                setError("Registration failed. Please try again.");
            }
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto' }}>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Username</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        style={{ width: '100%' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={{ width: '100%' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        style={{ width: '100%' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Confirm Password</label>
                    <input
                        type="password"
                        name="password2"
                        value={formData.password2}
                        onChange={handleChange}
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
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>
            <p style={{ marginTop: '10px' }}>
                Already have an account? <Link to="/login">Login here</Link>
            </p>
        </div>
    );
};

export default RegisterPage;