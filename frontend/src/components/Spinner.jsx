// Animated loading spinner — fullPage prop centers it in the viewport
export default function Spinner({ fullPage = false }) {
  const wrapper = fullPage
    ? 'flex items-center justify-center h-screen w-full'
    : 'flex items-center justify-center py-12';

  return (
    <div className={wrapper}>
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-amber-100 border-t-stone-700 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg">📚</span>
        </div>
      </div>
    </div>
  );
}
