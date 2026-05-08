import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import type { Category } from '../types';
import { useStore } from '../hooks/useStore';
import { getArticlesByCategory } from '../services/storage';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const navigate = useNavigate();
  const { data } = useStore();
  const articles = getArticlesByCategory(data, category.id);

  return (
    <button
      onClick={() => navigate(`/category/${category.id}`)}
      className="group relative w-full text-left rounded-2xl border border-border bg-card-bg p-6 transition-all duration-300 hover:border-border-light hover:bg-card-hover hover:-translate-y-1 hover:shadow-2xl hover:shadow-accent/5 overflow-hidden"
    >
      {/* Accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(90deg, ${category.color}, transparent)` }} />

      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${category.color}15` }}>
          {category.icon}
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 text-xs font-semibold text-card-text-muted">
          <FileText size={12} />
          <span>{articles.length}</span>
        </div>
      </div>

      <h3 className="text-base font-bold text-card-text-primary mb-1 transition-colors">
        {category.name}
      </h3>
      <p className="text-xs text-card-text-muted line-clamp-2 leading-relaxed">
        {category.description || '아직 설명이 없습니다'}
      </p>
    </button>
  );
}
