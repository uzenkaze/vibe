import { useStore } from '../hooks/useStore';

export default function Toast() {
  const { toast } = useStore();
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-scale-in">
      <div className="glass rounded-2xl px-5 py-3 text-sm font-semibold text-text-primary shadow-2xl flex items-center gap-2">
        <span className="text-accent">✦</span>
        <span>{toast}</span>
      </div>
    </div>
  );
}
