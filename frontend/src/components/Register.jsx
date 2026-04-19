import { useState } from 'react';
import api from '../api';

const Register = () => {
    const [isNewOrg, setIsNewOrg] = useState(true);
    const [formData, setFormData] = useState({
        username: '', email: '', password: '', orgName: '', inviteCode: ''
    });

    const handleRegister = async (e) => {
        e.preventDefault();

        // 1. Logic: Start with the common fields
        const payload = {
            username: formData.username,
            email: formData.email,
            password: formData.password
        };

        // 2. Logic: Add ONLY the field needed based on the toggle
        if (isNewOrg) {
            payload.orgName = formData.orgName;
            // We do NOT add inviteCode here
        } else {
            payload.inviteCode = formData.inviteCode;
            // We do NOT add organizationName here
        }

        console.log(payload);

        try {
            // 3. Send the clean payload, not the messy formData
            const res = await api.post('/auth/register', payload);
            alert("Registration Success: " + res.data);
        } catch (err) {
            alert("Error: " + err.response?.data);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <form onSubmit={handleRegister} className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-green-600">Join the Platform</h2>
                
                {/* Toggle between Create and Join */}
                <div className="flex mb-6 bg-gray-200 rounded p-1">
                    <button type="button" onClick={() => setIsNewOrg(true)} className={`flex-1 p-1 rounded ${isNewOrg ? 'bg-white shadow' : ''}`}>New Company</button>
                    <button type="button" onClick={() => setIsNewOrg(false)} className={`flex-1 p-1 rounded ${!isNewOrg ? 'bg-white shadow' : ''}`}>Join Team</button>
                </div>

                <input type="text" placeholder="Full Name" className="w-full p-2 mb-4 border rounded" onChange={(e) => setFormData({...formData, username: e.target.value})}/>
                <input type="email" placeholder="Email" className="w-full p-2 mb-4 border rounded" onChange={(e) => setFormData({...formData, email: e.target.value})}/>
                <input type="password" placeholder="Password" className="w-full p-2 mb-4 border rounded" onChange={(e) => setFormData({...formData, password: e.target.value})}/>

                {isNewOrg ? (
                    <input type="text" placeholder="Organization Name" className="w-full p-2 mb-4 border border-blue-300 rounded bg-blue-50" 
                           onChange={(e) => setFormData({...formData, orgName: e.target.value})}/>
                ) : (
                    <input type="text" placeholder="Invite Code (Ex: SAM-1234)" className="w-full p-2 mb-4 border border-green-300 rounded bg-green-50" 
                           onChange={(e) => setFormData({...formData, inviteCode: e.target.value})}/>
                )}

                <button type="submit" className="w-full bg-black text-white p-2 rounded mt-4">Create Account</button>
            </form>
        </div>
    );
};

export default Register;