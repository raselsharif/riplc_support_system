import { forwardRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';

const variants = {
  primary: "text-[var(--primary)] hover:text-[var(--primary-active)]",
  secondary: "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
  danger: "text-red-500 hover:text-red-600",
  muted: "text-[var(--text-muted)] hover:text-[var(--text-secondary)]",
};

const Link = forwardRef(({
  children,
  to,
  href,
  variant = 'primary',
  className = '',
  underline = false,
  icon: Icon,
  iconPosition = 'left',
  ...props
}, ref) => {
  const variantStyles = variants[variant] || variants.primary;
  
  const linkContent = (
    <>
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 inline-flex-shrink-0" />}
      <span className={underline ? 'underline underline-offset-2' : ''}>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 inline-flex-shrink-0" />}
    </>
  );

  const baseClassName = `inline-flex items-center gap-1.5 transition-colors duration-200 font-medium ${variantStyles} ${className}`;

  if (href) {
    return (
      <motion.a
        ref={ref}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={baseClassName}
        {...props}
      >
        {linkContent}
      </motion.a>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="inline-block"
    >
      <RouterLink
        ref={ref}
        to={to}
        className={baseClassName}
        {...props}
      >
        {linkContent}
      </RouterLink>
    </motion.div>
  );
});

Link.displayName = 'Link';

export const ActionLink = forwardRef(({
  children,
  onClick,
  variant = 'primary',
  size = 'sm',
  className = '',
  icon: Icon,
  ...props
}, ref) => {
  const sizeStyles = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-sm px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        inline-flex items-center gap-1.5 rounded-lg font-medium transition-all duration-200
        ${variants[variant] || variants.primary}
        ${sizeStyles[size] || sizeStyles.sm}
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </motion.button>
  );
});

ActionLink.displayName = 'ActionLink';

export default Link;
