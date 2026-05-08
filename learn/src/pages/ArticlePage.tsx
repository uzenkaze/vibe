import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Trash2, ExternalLink, Pin, Tag } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { getArticleById, getCategoryById } from '../services/storage';
import MarkdownRenderer from '../components/MarkdownRenderer';
import ArticleEditor from '../components/ArticleEditor';

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, removeArticle, editArticle } = useStore();
  const [showEditor, setShowEditor] = useState(false);

  const article = id ? getArticleById(data, id) : undefined;
  const category = article ? getCategoryById(data, article.categoryId) : undefined;

  if (!article) {
    return (
      <div className="text-center py-20">
        <p className="text-text-muted">아티클을 찾을 수 없습니다</p>
        <button onClick={() => navigate('/')} className="mt-4 text-accent hover:text-accent-hover text-sm font-semibold">
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm('이 아티클을 삭제하시겠습니까?')) {
      removeArticle(article.id);
      navigate(category ? `/category/${category.id}` : '/');
    }
  };

  const togglePin = () => {
    editArticle(article.id, { isPinned: !article.isPinned });
  };

  return (
    <div className="py-8 max-w-3xl mx-auto">
      {/* Back */}
      <div className="animate-fade-in mb-8">
        <button
          onClick={() => navigate(category ? `/category/${category.id}` : '/')}
          className="flex items-center gap-2 text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={14} />
          <span>{category ? category.name : '홈'}</span>
        </button>
      </div>

      {/* Article Header */}
      <div className="animate-fade-in mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            {category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3" style={{ backgroundColor: `${category.color}15`, color: category.color }}>
                {category.icon} {category.name}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-black text-text-primary leading-tight">
              {article.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span>작성: {new Date(article.createdAt).toLocaleDateString('ko-KR')}</span>
          <span>수정: {new Date(article.updatedAt).toLocaleDateString('ko-KR')}</span>
        </div>

      </div>

      {/* Sticky Action Bar */}
      <div className="sticky top-20 z-40 flex justify-end mb-4 pointer-events-none">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl backdrop-blur-md border border-border shadow-xl pointer-events-auto" style={{ background: 'var(--glass-bg)', borderColor: 'var(--glass-border)' }}>
          <button onClick={togglePin} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${article.isPinned ? 'bg-accent/20 text-accent' : 'text-text-muted hover:text-text-primary hover:bg-bg-hover'}`}>
            <Pin size={14} />
            {article.isPinned ? '고정됨' : '고정'}
          </button>
          <button onClick={() => setShowEditor(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-bg-hover transition-all">
            <Edit3 size={14} />
            수정
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          <button onClick={handleDelete} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-text-muted hover:text-accent-rose hover:bg-accent-rose/10 transition-all">
            <Trash2 size={14} />
            삭제
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="animate-slide-up rounded-2xl border border-border p-6 sm:p-10 mb-8" style={{ background: 'var(--color-bg-card)' }}>
        {article.content ? (
          <MarkdownRenderer content={article.content} />
        ) : (
          <p className="text-text-muted text-sm italic">내용이 없습니다. 수정 버튼을 눌러 작성해주세요.</p>
        )}
      </div>

      {/* Tags */}
      {article.tags.length > 0 && (
        <div className="animate-fade-in mb-8" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-2 mb-3">
            <Tag size={14} className="text-text-muted" />
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">태그</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {article.tags.map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full bg-bg-secondary border border-border text-xs font-semibold text-text-secondary">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* References */}
      {article.references.length > 0 && (
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 mb-3">
            <ExternalLink size={14} className="text-text-muted" />
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">참고 사이트</span>
          </div>
          <div className="space-y-2">
            {article.references.map((ref, idx) => (
              <a
                key={idx}
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-bg-card hover:bg-bg-hover hover:border-border-light transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <ExternalLink size={14} className="text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors truncate">
                    {ref.title || ref.url}
                  </div>
                  <div className="text-xs text-text-muted truncate">{ref.url}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Editor */}
      <ArticleEditor
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        categoryId={article.categoryId}
        initial={article}
      />
    </div>
  );
}
