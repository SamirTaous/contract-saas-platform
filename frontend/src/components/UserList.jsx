import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Mail, Shield } from 'lucide-react';
import api from '../api';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (!token || !userData) {
            navigate('/auth');
            return;
        }
        
        setUser(JSON.parse(userData));
        fetchUsers();
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/users/all'); 
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch users", err);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth');
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <div className="flex items-center space-x-3 mb-4">
                    <Users className="h-8 w-8 text-blue-600" />
                    <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
                </div>
                <p className="text-gray-600">
                    Manage your organization's team members and their roles.
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h2 className="text-lg font-semibold text-gray-900">
                            All Members ({users.length})
                        </h2>
                    </div>
                    
                    {users.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
                            <p className="text-gray-600">Start by inviting team members to your organization.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {users.map((member) => (
                                <div key={member.uuid} className="px-6 py-4 hover:bg-gray-50 transition-all duration-200 hover:shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center hover:from-blue-600 hover:to-blue-700 transition-all duration-200 cursor-pointer">
                                                <span className="text-white text-lg font-semibold">
                                                    {member.username.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                                    <span>{member.username}</span>
                                                </h3>
                                                <div className="flex items-center space-x-4 mt-1">
                                                    <div className="flex items-center space-x-1 text-gray-600">
                                                        <Mail className="h-4 w-4" />
                                                        <span className="text-sm">{member.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center space-x-3">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                member.role === 'ADMIN' 
                                                    ? 'bg-purple-100 text-purple-800' 
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                <Shield className="h-3 w-3 mr-1" />
                                                {member.role}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserList;