import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  DollarSign,
  Users,
  FileText,
  Settings
} from 'lucide-react';
import { designSystem } from '../styles/designSystem';
import PageHeader from './ui/PageHeader';
import StatCard from './ui/StatCard';
import Button from './ui/Button';
import Card from './ui/Card';

const Dashboard = () => {
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
  }, [navigate]);

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

  const stats = [
    { name: 'Contrats Actifs', value: '24', change: '+12%', icon: FileText, color: 'blue' },
    { name: 'Membres de l\'Équipe', value: '8', change: '+2', icon: Users, color: 'green' },
    { name: 'En Attente de Révision', value: '3', change: '-1', icon: Clock, color: 'yellow' },
    { name: 'Terminés', value: '156', change: '+8%', icon: CheckCircle, color: 'purple' },
  ];

  const recentActivity = [
    { action: 'Contrat signé', contract: 'Accord de Service #2024-001', time: 'il y a 2 heures' },
    { action: 'Révision demandée', contract: 'Mise à jour du Modèle NDA', time: 'il y a 4 heures' },
    { action: 'Nouveau membre d\'équipe', contract: 'Sarah Johnson a rejoint', time: 'il y a 1 jour' },
    { action: 'Contrat expiré', contract: 'Accord Fournisseur #2023-045', time: 'il y a 2 jours' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={designSystem.layout.container}>
        <div className={designSystem.layout.section}>
          {/* Welcome Section */}
          <PageHeader
            title={`Bienvenue, ${user.username}!`}
            subtitle="Voici ce qui se passe avec vos contrats aujourd'hui."
          />

          {/* Stats Grid */}
          <div className={`${designSystem.layout.grid.cols4} ${designSystem.layout.grid.gap} mb-8`}>
            {stats.map((stat) => (
              <StatCard
                key={stat.name}
                label={stat.name}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
                change={stat.change}
                changeType="positive"
              />
            ))}
          </div>

          {/* Content Grid */}
          <div className={`${designSystem.layout.grid.cols3} ${designSystem.layout.grid.gap}`}>
            {/* Quick Actions */}
            <Card
              title="Actions Rapides"
              className="lg:col-span-1"
            >
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  icon={Plus}
                  className="w-full justify-start"
                >
                  Créer un Nouveau Contrat
                </Button>
                
                <Button
                  variant="secondary"
                  icon={Users}
                  className="w-full justify-start"
                  onClick={() => navigate('/users')}
                >
                  Voir les Membres de l'Équipe
                </Button>
                
                <Button
                  variant="secondary"
                  icon={DollarSign}
                  className="w-full justify-start"
                  onClick={() => navigate('/budget')}
                >
                  Gestion Budgétaire
                </Button>
                
                <Button
                  variant="secondary"
                  icon={TrendingUp}
                  className="w-full justify-start"
                >
                  Voir les Analyses
                </Button>
                
                <Button
                  variant="secondary"
                  icon={Settings}
                  className="w-full justify-start"
                >
                  Paramètres
                </Button>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card
              title="Activité Récente"
              className="lg:col-span-2"
            >
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.action}</span> - {activity.contract}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Button
                  variant="secondary"
                  className="w-full"
                >
                  Voir Toute l'Activité
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;