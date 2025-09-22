import React from "react";

export const Button = ({ variant = 'primary', size = 'md', className = '', ...props }) => {
    const base = 'inline-flex items-center justify-center rounded-xl font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow hover:shadow-md transform hover:-translate-y-0.5';
    const variants = {
        primary: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus-visible:ring-red-600',
        secondary: 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-100 focus-visible:ring-gray-300',
        ghost: 'text-gray-700 hover:bg-gray-100',
    };
    const sizes = {
        sm: 'text-sm px-3 py-2',
        md: 'text-sm px-4 py-2.5',
        lg: 'text-base px-5 py-3',
    };
    return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />;
};

export const Input = ({ className = '', ...props }) => (
	<input className={`w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red-600 ${className}`} {...props} />
);

export const Select = ({ className = '', children, ...props }) => (
	<select className={`w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red-600 ${className}`} {...props}>
		{children}
	</select>
);

export const Card = ({ className = '', children }) => (
    <div className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow ${className}`}>{children}</div>
);

export const Badge = ({ className = '', children }) => (
	<span className={`inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 ${className}`}>{children}</span>
);


