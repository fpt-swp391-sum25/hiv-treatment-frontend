import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch (e) {
            console.error("Error parsing user from localStorage:", e);
        }
    });

    const [protectedData, setProtectedData] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        } else {
            fetchProtectedData();
        }
    }, [currentUser, navigate]);

    const fetchProtectedData = async () => {
        try {
            const token = currentUser?.token;

            if (!token) {
                throw new Error('User token is missing. Please log in again.');
            }

            const response = await axios.get('/api/protected/data', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setProtectedData(response.data);
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred.';
            setMessage('Could not fetch protected data: ' + errorMessage);

            if (error.response && error.response.status === 403) {
                setMessage('Access Denied: You do not have permission to view this data. Please check your role.');
            } else if (error.response && error.response.status === 401) {
                setMessage('Authentication Required: Your session may have expired. Please log in again.');
                localStorage.removeItem('user');
                navigate('/login');
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
        window.location.reload();
    };

    if (!currentUser) {
        return null;
    }

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>Welcome, {currentUser.name}!</h2> { }
                <p>You are logged in.</p>
                <button onClick={handleLogout} className="auth-button logout-button">Logout</button>

                <h3>Protected Data:</h3>
                {message && <div className="error-message">{message}</div>}
                {protectedData ? (
                    <pre>{JSON.stringify(protectedData, null, 2)}</pre>
                ) : (
                    <p>{message ? '' : 'Loading protected data...'}</p>
                )}
            </div>
        </div>
    );
}

export default Dashboard;