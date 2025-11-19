export const Badge = ({ children, className }) => {
  return (
    <span className={`px-2 py-1 rounded-full text-sm bg-gray-200 ${className}`}>
      {children}
    </span>
  );
};
