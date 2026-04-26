import { getPageHeaderClasses } from '../../styles/designSystem';

const PageHeader = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  action, 
  className = '' 
}) => {
  const classes = getPageHeaderClasses();
  
  return (
    <div className={`${classes.container} ${className}`}>
      <div className={classes.wrapper}>
        <div>
          <div className={classes.titleSection}>
            {Icon && <Icon className={classes.icon} />}
            <h1 className={classes.title}>{title}</h1>
          </div>
          {subtitle && (
            <p className={classes.subtitle}>{subtitle}</p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;