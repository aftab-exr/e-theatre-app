import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const RoomList = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch the list of rooms when the component loads
        const fetchRooms = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/rooms/');

                // --- NEW, SAFER CODE ---
                // Check if the data is paginated (has .results)
                // or if it's just a plain list.
                const roomList = response.data.results || response.data;

                // Ensure we are always setting an array to prevent crashes
                if (Array.isArray(roomList)) {
                    setRooms(roomList);
                } else {
                    console.error("API did not return a list of rooms:", response.data);
                    setRooms([]); // Set to empty array to prevent crash
                }
                // --- END NEW CODE ---

                setLoading(false);
            } catch (err) {
                setLoading(false);
                setError("Could not fetch rooms.");
                console.error("Fetch rooms failed:", err);
            }
        };

        fetchRooms();
    }, []); // The empty array [] means this runs once on mount.

    if (loading) return <div>Loading rooms...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div style={{ marginTop: '30px' }}>
            <h3>Join an Active Theatre</h3>
            {rooms.length === 0 ? (
                <p>No active rooms. Why not create one?</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {rooms.map(room => (
                        <li key={room.id} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '5px' }}>
                            <Link to={`/rooms/${room.id}`}>
                                {room.name} (Host: {room.host.username})
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default RoomList;