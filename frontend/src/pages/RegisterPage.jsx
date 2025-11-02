import React, { useState, useContext } from 'react'; // 1. Import useContext
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // 2. Import AuthContext

const RegisterPage = () => {
    // State for form data
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: ''
    });

    // State for loading and any error messages
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // 3. Get the 'login' function from our context
    const { login } = useContext(AuthContext);

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
            // 2. Send the data to the backend to register
            await axios.post('http://localhost:8000/auth/register/', {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                password2: formData.password2
            });

            // 4. --- NEW: Auto-login ---
            // Registration was successful, so now log the user in
            const loginSuccess = await login(formData.username, formData.password);

            setLoading(false);

            if (loginSuccess) {
                // 5. On success, send them to the HOME page (not login)
                navigate('/');
            } else {
                // This should rarely happen, but just in case
                setError("Registration successful, but login failed. Please go to login page.");
            }

        } catch (err) {
            // 4. Handle Errors
            setLoading(false);
            if (err.response && err.response.data) {
                // This catches backend validation errors (e.g., "email already exists")
                const errorData = err.response.data;
                const errorMsg = Object.values(errorData).join(' ');
                setError(errorMsg);
            } else {
                // Generic error (like the CORS one we fixed)
                setError("Registration failed. Please try again.");
            }
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto' }}>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                {/* ... all your form inputs (username, email, etc.) ... */}
                {/* NO CHANGES are needed in the JSX <form> part */}
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