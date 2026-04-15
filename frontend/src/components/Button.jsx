import { forwardRef } from 'react';
import { motion } from 'framer-motion';

const variants = {
  primary: {
    base: "bg-gradient-to-r from-[var(--primary)] to-[var(--primary-active)] text-white shadow-lg shadow-[var(--primary)]/20",
    hover: "hover:shadow-xl hover:shadow-[var(--primary)]/30 hover:-translate-y-0.5",
    active: "active:translate-y-0 active:shadow-md"
  },
  secondary: {
    base: "bg-[var(--bg-muted)] text-[var(--text-primary)]",
    hover: "hover:bg-[var(--bg-hover)] hover:-translate-y-0.5",
    active: "active:translate-y-0"
  },
  outline: {
    base: "border-2 border-[var(--primary)] text-[var(--primary)] bg-transparent",
    hover: "hover:bg-[var(--primary)] hover:text-white hover:-translate-y-0.5",
    active: "active:translate-y-0"
  },
  ghost: {
    base: "text-[var(--text-secondary)] bg-transparent",
    hover: "hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
    active: "active:bg-[var(--bg-muted)]"
  },
  danger: {
    base: "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/20",
    hover: "hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5",
    active: "active:translate-y-0 active:shadow-md"
  },
  success: {
    base: "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/20",
    hover: "hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5",
    active: "active:translate-y-0 active:shadow-md"
  },
  warning: {
    base: "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20",
    hover: "hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5",
    active: "active:translate-y-0 active:shadow-md"
  },
};

const sizes = {
  xs: "px-2.5 py-1 text-xs rounded-lg gap-1.5",
  sm: "px-3 py-1.5 text-sm rounded-lg gap-2",
  md: "px-4 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-6 py-3 text-base rounded-xl gap-2.5",
};

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  iconOnly = false,
  fullWidth = false,
  gradient = null,
  onClick,
  type = 'button',
  ...props
}, ref) => {
  const variantStyles = variants[variant] || variants.primary;
  const sizeStyles = sizes[size] || sizes.md;

  const buttonContent = (
    <>
      {loading ? (
        <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : Icon && iconPosition === 'left' ? (
        <Icon className={`${iconOnly ? 'w-5 h-5' : 'w-4 h-4'}`} />
      ) : null}
      
      {!iconOnly && <span className="font-medium">{children}</span>}
      
      {!loading && Icon && iconPosition === 'right' && !iconOnly && (
        <Icon className="w-4 h-4" />
      )}
      
      {!loading && Icon && iconOnly && (
        <Icon className="w-5 h-5" />
      )}
    </>
  );

  if (gradient) {
    variantStyles.base = `bg-gradient-to-r ${gradient} text-white shadow-lg`;
  }

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      className={`
        inline-flex items-center justify-center
        transition-all duration-200 ease-out
        ${variantStyles.base}
        ${!disabled && !loading ? variantStyles.hover : ''}
        ${!disabled && !loading ? variantStyles.active : ''}
        ${sizeStyles}
        ${disabled || loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        ${fullWidth ? 'w-full' : ''}
        ${iconOnly ? 'p-2' : ''}
        ${className}
      `}
      {...props}
    >
      {buttonContent}
    </motion.button>
  );
});

Button.displayName = 'Button';

export const IconButton = forwardRef(({
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const sizeMap = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  return (
    <Button
      ref={ref}
      icon={Icon}
      iconOnly
      variant={variant}
      size={size}
      className={`rounded-full ${sizeMap[size]} ${className}`}
      {...props}
    />
  );
});

IconButton.displayName = 'IconButton';

export default Button;
