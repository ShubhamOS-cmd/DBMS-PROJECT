// Fixed toast notification stack rendered in the bottom-right corner
export default function Toast({ toasts }) {
  if (!toasts.length) return null;

  // Maps toast type to icon and color classes
  const typeStyles = {
    success: { icon: '✓', bg: 'bg-emerald-600', border: 'border-emerald-500' },
    error:   { icon: '✕', bg: 'bg-rose-600',    border: 'border-rose-500'    },
    info:    { icon: 'ℹ', bg: 'bg-stone-700',   border: 'border-stone-600'   },
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => {
        const style = typeStyles[toast.type] || typeStyles.info;
        return (
          <div
            key={toast.id}
            className={`toast-enter flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg
                        bg-white border ${style.border} min-w-[260px] max-w-sm pointer-events-auto`}
          >
            <span className={`${style.bg} text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0`}>
              {style.icon}
            </span>
            <p className="text-stone-800 text-sm font-medium">{toast.message}</p>
          </div>
        );
      })}
    </div>
  );
}
