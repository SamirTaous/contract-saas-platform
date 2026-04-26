import { getButtonClasses } from '../../styles/designSystem';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  const buttonClasses = getButtonClasses(variant, size);
  const isDisabled = disabled || loading;
  
  return (
    <button
      className={`${buttonClasses} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon className="h-4 w-4 mr-2" />
          )}
          {children}
          {Icon && iconPosition === 'right' && (
            <Icon className="h-4 w-4 ml-2" />
          )}
        </>
      )}
    </button>
  );
};

export default Button;