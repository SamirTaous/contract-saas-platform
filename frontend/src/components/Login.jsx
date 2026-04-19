import {useState} from 'react';
import api from '../api';

const Login = () => {
    const [formData, setFormData] = useState({username : '', password: ''});

    const handleSubmit = async (e) => {
        e.preventDefault(); 
        try {
            const res = await api.post('/auth/login', formData);
            
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            alert("Login Successful! Welcome " + res.data.user.username);
        } catch (err) {
            alert("Error: " + err.response?.data || "Login failed");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Login to SmartSaaS</h2>
                <input 
                    type="text" placeholder="Username" 
                    className="w-full p-2 mb-4 border rounded"
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
                <input 
                    type="password" placeholder="Password" 
                    className="w-full p-2 mb-6 border rounded"
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                    Sign In
                </button>
            </form>
        </div>
    )
};

export default Login;
