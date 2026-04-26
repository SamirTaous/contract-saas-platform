import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Mail, Shield } from 'lucide-react';
import api from '../api';
import { designSystem } from '../styles/designSystem';
import PageHeader from './ui/PageHeader';
import Card from './ui/Card';
import EmptyState from './ui/EmptyState';

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
        <div className="min-h-screen bg-gray-50">
            <div className={designSystem.layout.container}>
                <div className={designSystem.layout.section}>
                    <PageHeader
                        title="Membres de l'Équipe"
                        subtitle="Gérer les membres de votre organisation et leurs rôles."
                        icon={Users}
                    />

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <Card
                            title={`Tous les Membres (${users.length})`}
                            padding={false}
                        >
                            {users.length === 0 ? (
                                <EmptyState
                                    icon={Users}
                                    title="Aucun membre d'équipe trouvé"
                                    description="Commencez par inviter des membres d'équipe dans votre organisation."
                                />
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {users.map((member) => (
                                        <div key={member.uuid} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-lg font-semibold">
                                                            {member.username.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    
                                                    <div>
                                                        <h3 className={`${designSystem.typography.subtitle} flex items-center space-x-2`}>
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
                                                            : member.role === 'SUPER_ADMIN'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        <Shield className="w-3 h-3 mr-1" />
                                                        {member.role.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserList;