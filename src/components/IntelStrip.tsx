import { intelItems } from '@/data';

export default function IntelStrip() {
  const doubled = [...intelItems, ...intelItems];
  return (
    <div className="intel-strip">
      <div className="intel-scroll">
        {doubled.map((item, i) => (
          <span key={i} className={`intel-item${item.highlight ? ' g' : ''}`}>
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}
