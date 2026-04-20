import { useState } from 'react';
import { Eye, EyeOff, Building2, Users, Shield, Zap } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        </div>
        
        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-white">ContractSaaS</span>
          </div>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Streamline Your Contract Management
            </h2>
            <p className="text-blue-100 text-lg leading-relaxed">
              Join thousands of businesses who trust our platform to manage their contracts efficiently and securely.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Enterprise Security</h3>
                <p className="text-blue-100 text-sm">Bank-level encryption and compliance standards</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Team Collaboration</h3>
                <p className="text-blue-100 text-sm">Real-time collaboration with your team members</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Lightning Fast</h3>
                <p className="text-blue-100 text-sm">Optimized performance for large-scale operations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Quote */}
        <div className="relative z-10">
          <blockquote className="text-blue-100 italic">
            "ContractSaaS has transformed how we handle our legal documents. The efficiency gains are remarkable."
          </blockquote>
          <cite className="text-blue-200 text-sm mt-2 block">— Sarah Chen, Legal Director</cite>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
              <p className="text-gray-600">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;