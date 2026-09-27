interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ size = 'md' }: SpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };
  return (
    <div className="flex items-center justify-center py-12">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-gray-200 border-t-indigo-600`}
      />
    </div>
  );
}
