import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Building, Key, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api';

// Move components outside to prevent re-creation on every render
const InputField = ({ icon: Icon, type, placeholder, value, onChange, required = true }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Icon className="h-5 w-5 text-gray-400" />
    </div>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400 focus:bg-white outline-none"
    />
  </div>
);

const PasswordField = ({ placeholder, value, onChange, showPassword, onTogglePassword }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Lock className="h-5 w-5 text-gray-400" />
    </div>
    <input
      type={showPassword ? "text" : "password"}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400 focus:bg-white outline-none"
    />
    <button
      type="button"
      onClick={onTogglePassword}
      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 rounded-r-lg transition-colors"
    >
      {showPassword ? (
        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
      ) : (
        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
      )}
    </button>
  </div>
);

const AuthForm = () => {
  const { login, isAuthenticated } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isNewOrg, setIsNewOrg] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    orgName: '',
    inviteCode: ''
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      const from = location.state?.from || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const togglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        username: formData.username,
        password: formData.password
      });
      
      // Use auth context login method
      login(res.data.token, res.data.user);
      
      // Redirect to the page they were trying to access or dashboard
      const from = location.state?.from || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      alert("Erreur: " + (err.response?.data || "Échec de la connexion"));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      username: formData.username,
      email: formData.email,
      password: formData.password
    };

    if (isNewOrg) {
      payload.orgName = formData.orgName;
    } else {
      payload.inviteCode = formData.inviteCode;
    }

    try {
      const res = await api.post('/auth/register', payload);
      alert("Inscription réussie ! Veuillez vous connecter avec vos identifiants.");
      setIsLogin(true);
      // Clear form
      setFormData({
        username: '',
        email: '',
        password: '',
        orgName: '',
        inviteCode: ''
      });
    } catch (err) {
      alert("Erreur: " + (err.response?.data || "Échec de l'inscription"));
    } finally {
      setLoading(false);
    }
  };

  if (isLogin) {
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

          {/* Content */}
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-4">
              Bon Retour
            </h2>
            <p className="text-blue-100 text-lg leading-relaxed">
              Connectez-vous pour continuer à gérer vos contrats et collaborer avec votre équipe.
            </p>
          </div>

          {/* Bottom Quote */}
          <div className="relative z-10">
            <blockquote className="text-blue-100 italic">
              "La plateforme de gestion de contrats la plus efficace que nous ayons jamais utilisée."
            </blockquote>
            <cite className="text-blue-200 text-sm mt-2 block">— Michael Rodriguez, PDG</cite>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-6 lg:hidden">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">ContractSaaS</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h1>
              <p className="text-gray-600">Bon retour ! Veuillez vous connecter à votre compte</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <InputField
                icon={User}
                type="text"
                placeholder="Nom d'utilisateur"
                value={formData.username}
                onChange={(value) => handleInputChange('username', value)}
              />

              <PasswordField
                placeholder="Mot de passe"
                value={formData.password}
                onChange={(value) => handleInputChange('password', value)}
                showPassword={showPassword}
                onTogglePassword={togglePassword}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Connexion en cours...
                  </div>
                ) : (
                  'Se connecter'
                )}
              </button>

              <div className="text-center">
                <p className="text-gray-600">
                  Vous n'avez pas de compte ?{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors hover:underline"
                  >
                    Créer un compte
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 p-12 flex-col justify-between relative overflow-hidden">
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
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-white">ContractSaaS</span>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-4">
            Rejoignez Notre Plateforme
          </h2>
          <p className="text-green-100 text-lg leading-relaxed">
            Créez votre compte et commencez à gérer les contrats avec votre équipe dès aujourd'hui.
          </p>
        </div>

        {/* Bottom Quote */}
        <div className="relative z-10">
          <blockquote className="text-green-100 italic">
            "La configuration de notre organisation a été incroyablement simple et intuitive."
          </blockquote>
          <cite className="text-green-200 text-sm mt-2 block">— Lisa Park, Responsable des Opérations</cite>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-6 lg:hidden">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">ContractSaaS</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer un Compte</h1>
            <p className="text-gray-600">Rejoignez des milliers d'entreprises utilisant ContractSaaS</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            {/* Organization Type Toggle */}
            <div className="bg-gray-100 p-1 rounded-lg flex">
              <button
                type="button"
                onClick={() => setIsNewOrg(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 hover:bg-gray-200 ${
                  isNewOrg 
                    ? 'bg-white text-green-600 shadow-sm hover:bg-white' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Nouvelle Organisation
              </button>
              <button
                type="button"
                onClick={() => setIsNewOrg(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 hover:bg-gray-200 ${
                  !isNewOrg 
                    ? 'bg-white text-green-600 shadow-sm hover:bg-white' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Rejoindre une Équipe
              </button>
            </div>

            <InputField
              icon={User}
              type="text"
              placeholder="Nom Complet"
              value={formData.username}
              onChange={(value) => handleInputChange('username', value)}
            />

            <InputField
              icon={Mail}
              type="email"
              placeholder="Adresse Email"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
            />

            <PasswordField
              placeholder="Mot de passe"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              showPassword={showPassword}
              onTogglePassword={togglePassword}
            />

            {isNewOrg ? (
              <InputField
                icon={Building}
                type="text"
                placeholder="Nom de l'Organisation"
                value={formData.orgName}
                onChange={(value) => handleInputChange('orgName', value)}
              />
            ) : (
              <InputField
                icon={Key}
                type="text"
                placeholder="Code d'Invitation (ex: SAM-1234)"
                value={formData.inviteCode}
                onChange={(value) => handleInputChange('inviteCode', value)}
              />
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Création du compte...
                </div>
              ) : (
                'Créer un Compte'
              )}
            </button>

            <div className="text-center">
              <p className="text-gray-600">
                Vous avez déjà un compte ?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-green-600 hover:text-green-700 font-semibold transition-colors hover:underline"
                >
                  Se connecter
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;