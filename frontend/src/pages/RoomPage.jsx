import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import useWebSocket from 'react-use-websocket';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// --- API and WebSocket Base URLs ---
const API_BASE_URL = 'http://localhost:8000';
const WS_BASE_URL = 'ws://localhost:8000';

const RoomPage = () => {
    const { roomId } = useParams(); // Get room ID from URL (e.g., /rooms/abc-123)
    const { user } = useContext(AuthContext); // Get our logged-in user
    const navigate = useNavigate();

    // --- State ---
    const [room, setRoom] = useState(null);
    const [mediaToken, setMediaToken] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");

    // --- WebSocket Connection ---
    // This hook manages the entire WebSocket lifecycle for us.
    // It's authenticated automatically by the http-only
    // session cookie our backend set on login.
    const { sendJsonMessage, lastJsonMessage } = useWebSocket(
        `${WS_BASE_URL}/ws/rooms/${roomId}/`,
        {
            onOpen: () => console.log('WebSocket connected'),
            onClose: () => console.log('WebSocket disconnected'),
            // We'll handle errors in the message handler
        }
    );

    // --- Data Fetching Effect (Get Room Details) ---
    useEffect(() => {
        // Fetch the room details when the component mounts
        const fetchRoomDetails = async () => {
            try {
                // Auth token is already in axios defaults from AuthContext
                const response = await axios.get(`${API_BASE_URL}/api/rooms/${roomId}/`);
                setRoom(response.data);

                // Now get the media token to join the stream
                const tokenResponse = await axios.get(`${API_BASE_URL}/api/rooms/${roomId}/join-stream/`);
                setMediaToken(tokenResponse.data.media_token);

                // TODO: Use this 'media_token' to connect to
                // your LiveKit/Agora/Mediasoup media server.
                console.log("Media Server Token:", tokenResponse.data.media_token);

            } catch (error) {
                // This could be a 404 (room not found) or
                // 403 (not a member, though our API doesn't check this yet)
                console.error("Error fetching room details:", error);
                alert("Could not load room. You may not be a member.");
                navigate('/'); // Go back home
            }
        };

        fetchRoomDetails();
    }, [roomId, navigate]); // Re-run if room ID changes

    // --- WebSocket Message Handling Effect (The "Sync") ---
    // This effect runs every time a new message comes from the server

    useEffect(() => {
        if (lastJsonMessage) {
            // This is our 'switch' statement from the design
            const data = lastJsonMessage;

            switch (data.type) {
                case 'play':
                    console.log("Received 'play' command");
                    // TODO: Find your video player element and call videoPlayer.play();
                    alert("COMMAND: PLAY"); // Placeholder for now
                    break;
                case 'pause':
                    console.log("Received 'pause' command");
                    // TODO: videoPlayer.pause();
                    alert("COMMAND: PAUSE"); // Placeholder for now
                    break;
                case 'seek':
                    console.log(`Received 'seek' command to ${data.time}`);
                    // TODO: videoPlayer.currentTime = data.time;
                    alert(`COMMAND: SEEK TO ${data.time}`); // Placeholder
                    break;
                case 'chat':
                    console.log(`Received chat: ${data.message}`);
                    // Add the new message to our chat history
                    setChatMessages((prev) => [...prev, data.message]);
                    break;
                case 'error':
                    // This is for errors sent *by our Consumer*
                    console.error("Server-side WebSocket error:", data.message);
                    alert(data.message); // Show error to user
                    break;
                default:
                    console.warn("Received unknown message type:", data.type);
            }
        }
    }, [lastJsonMessage]); // Re-run whenever a new message arrives

    // --- Host Control Handlers ---
    // These functions are only used by the host
    const handlePlay = () => {
        console.log("Sending 'play' command");
        sendJsonMessage({ type: 'play' });
    };

    const handlePause = () => {
        console.log("Sending 'pause' command");
        sendJsonMessage({ type: 'pause' });
    };

    const handleSeek = () => {
        // Example: Seek to 30 seconds
        const time = 30.0;
        console.log(`Sending 'seek' command to ${time}`);
        sendJsonMessage({ type: 'seek', time: time });
    };

    // --- Chat Handler (Anyone) ---
    const handleSendChat = (e) => {
        e.preventDefault();
        if (chatInput.trim() === "") return;

        console.log(`Sending chat: ${chatInput}`);
        sendJsonMessage({
            type: 'chat',
            message: chatInput
        });
        setChatInput(""); // Clear input box
    };

    // --- Render Logic ---
    if (!room || !user) {
        return <div>Loading room...</div>;
    }

    // Check if the currently logged-in user is the host
    const isHost = room.host.username === user.username;

    return (
        <div style={{ display: 'flex', height: '100vh' }}>
            {/* Main Content: Video and Controls */}
            <div style={{ flex: 3, padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <h2>{room.name}</h2>
                <p>Host: {room.host.username} {isHost ? "(You)" : ""}</p>
                <p>Room ID: {room.id}</p>

                {/* This is a placeholder for your Media Server's video player */}
                <div style={{ backgroundColor: '#000', color: '#fff', flexGrow: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <p>Video Player (Stream Token: {mediaToken ? "Loaded" : "..."})</p>
                </div>

                {/* Host-only controls */}
                {isHost && (
                    <div style={{ padding: '10px', border: '1px solid blue', marginTop: '10px' }}>
                        <h3>Host Controls</h3>
                        <button onClick={handlePlay}>Play</button>
                        <button onClick={handlePause}>Pause</button>
                        <button onClick={handleSeek}>Seek to 30s</button>
                    </div>
                )}
            </div>

            {/* Side Content: Chat */}
            <div style={{ flex: 1, borderLeft: '1px solid #ccc', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <h3>Live Chat</h3>
                <div style={{ flexGrow: 1, height: '70vh', overflowY: 'scroll', border: '1px solid #eee', marginBottom: '10px', padding: '5px' }}>
                    {chatMessages.map((msg, index) => (
                        <div key={index}>
                            {/* In a real app, the server would send who said it */}
                            <strong>User: </strong>{msg}
                        </div>
                    ))}
                </div>
                <form onSubmit={handleSendChat}>
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type a message..."
                        style={{ width: '80%' }}
                    />
                    <button type="submit" style={{ width: '20%' }}>Send</button>
                </form>
            </div>
        </div>
    );
};

export default RoomPage;