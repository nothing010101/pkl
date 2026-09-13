import { SECTIONS } from '../lib/sections';

export default function SectionNav({ activeKey, onSelect, doneKeys }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
      {SECTIONS.map((s) => {
        const isActive = s.key === activeKey;
        const isDone = doneKeys.has(s.key);
        return (
          <button
            key={s.key}
            onClick={() => onSelect(s.key)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium border transition
              ${isActive
                ? 'bg-neutral-100 text-neutral-900 border-neutral-100'
                : isDone
                ? 'bg-neutral-800 text-neutral-200 border-neutral-700'
                : 'bg-transparent text-neutral-500 border-neutral-800'}`}
          >
            {s.heading.split('—')[0].trim()}
            {isDone && !isActive ? ' ✓' : ''}
          </button>
        );
      })}
    </div>
  );
}
