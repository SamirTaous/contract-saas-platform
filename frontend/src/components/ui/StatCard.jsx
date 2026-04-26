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
    <div className={`${classes.container} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={classes.label}>{label}</p>
          <p className={classes.value}>{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${changeColors[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className={classes.icon}>
            <Icon className={`h-6 w-6 ${classes.iconColor}`} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;