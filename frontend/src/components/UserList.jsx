import { useState, useEffect } from 'react';
import api from '../api'; // Your Axios instance

const UserList = () => {
    const [users, setUsers] = useState([]); // Our "Bucket" starts empty []
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []); // The empty array [] means "only run once"

    const fetchUsers = async () => {
        try {
            // This calls your @GetMapping("/api/users/all")
            const res = await api.get('/users/all'); 
            setUsers(res.data); // Put the Java JSON into the React Bucket
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch users", err);
            setLoading(false);
        }
    };

    if (loading) return <p>Loading team members...</p>;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Team Members</h2>
            <div className="grid gap-4">
                {users.map((user) => (
                    <div key={user.uuid} className="p-4 bg-white shadow rounded-lg border-l-4 border-blue-500">
                        <p className="font-bold">{user.username}</p>
                        <p className="text-gray-600 text-sm">{user.email}</p>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{user.role}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserList;