import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateRoomForm = () => {
    const [roomName, setRoomName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Our AuthContext already set the auth header on axios
            const response = await axios.post('http://localhost:8000/api/rooms/', {
                name: roomName
            });

            // On success, the backend sends us the new room's data
            const newRoomId = response.data.id;
            setLoading(false);

            // Redirect the user to the new room page
            navigate(`/rooms/${newRoomId}`);

        } catch (err) {
            setLoading(false);
            setError("Could not create room. Please try again.");
            console.error("Room creation failed:", err);
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h3>Create a New Theatre</h3>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="Enter room name"
                    required
                    style={{ width: '80%', padding: '8px' }}
                />
                <button
                    type="submit"
                    disabled={loading}
                    style={{ padding: '8px', marginLeft: '10px' }}
                >
                    {loading ? 'Creating...' : 'Create Room'}
                </button>
                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            </form>
        </div>
    );
};

export default CreateRoomForm;