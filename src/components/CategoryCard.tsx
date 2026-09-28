import { Link } from 'react-router-dom';
import type { Category } from '@/types';
import { categoryIcons } from '@/data/categories';

interface CategoryCardProps {
  category: Category;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = categoryIcons[category.slug] || categoryIcons['goc-hoc-tap'];
  return (
    <Link
      to={`/danh-muc/${category.slug}`}
      className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 transition-all duration-300 hover:border-indigo-200 hover:shadow-lg"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 transition-all duration-300 group-hover:from-indigo-600 group-hover:to-indigo-700 group-hover:text-white">
        <Icon className="h-7 w-7" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600">{category.name}</p>
        <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">{category.description}</p>
      </div>
    </Link>
  );
}
