import { getStatCardClasses } from '../../styles/designSystem';

const StatCard = ({ 
  label, 
  value, 
  icon: Icon, 
  color = 'blue',
  change,
  changeType = 'neutral',
  className = '' 
}) => {
  const classes = getStatCardClasses(color);
  
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600',
  };
  
  return (
    <div className={`${classes.container} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`${classes.label} group-hover:text-gray-900 transition-colors`}>{label}</p>
          <p className={`${classes.value} group-hover:scale-105 transition-transform duration-200 inline-block`}>{value}</p>
          {change && (
            <p className={`text-sm mt-2 font-medium ${changeColors[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`${classes.icon} group-hover:scale-110 group-hover:shadow-lg transition-all duration-200`}>
            <Icon className={`h-6 w-6 ${classes.iconColor}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;