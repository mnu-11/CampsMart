import { useState } from 'react';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import { CATEGORIES, CATEGORY_ICONS, CONDITIONS } from '../utils/helpers';
import { useDark } from '../hooks/useDark';

export default function FilterPanel({ filters, onChange, onReset }) {
  const [expanded, setExpanded] = useState({ category: true, price: true, condition: true });
  const toggle = (key) => setExpanded(p => ({ ...p, [key]: !p[key] }));
  const dark = useDark();
  const surface = dark ? '#0a0f1e' : '#fff';
  const border = dark ? '#141929' : '#e8edf5';
  const textMain = dark ? '#f0f4ff' : '#0a0f1e';
  const textMuted = dark ? '#64748b' : '#94a3b8';
  const soft = dark ? '#0f1628' : '#f0f4ff';
  const hasActiveFilters = filters.category !== 'All' || filters.minPrice || filters.maxPrice || filters.condition;

  const Section = ({ id, title, children }) => (
    <div style={{ borderBottom: `1px solid ${border}` }}>
      <button onClick={() => toggle(id)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 0', fontSize: 13, fontWeight: 600, color: textMain,
        background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
      }}>
        {title}
        {expanded[id] ? <ChevronUp size={13} color={textMuted} /> : <ChevronDown size={13} color={textMuted} />}
      </button>
      {expanded[id] && <div style={{ paddingBottom: 16 }}>{children}</div>}
    </div>
  );

  return (
    <div style={{ background: surface, borderRadius: 20, border: `1px solid ${border}`, padding: 16, position: 'sticky', top: 120 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SlidersHorizontal size={15} color="#2563eb" />
          <span style={{ fontWeight: 600, fontSize: 14, color: textMain }}>Filters</span>
        </div>
        {hasActiveFilters && (
          <button onClick={onReset} style={{
            display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#ef4444',
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
          }}><X size={12} /> Reset</button>
        )}
      </div>

      <Section id="category" title="Category">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {['All', ...CATEGORIES].map(cat => (
            <button key={cat} onClick={() => onChange('category', cat)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
              borderRadius: 10, fontSize: 13, fontFamily: 'inherit', border: 'none', cursor: 'pointer',
              background: filters.category === cat ? (dark ? 'rgba(37,99,235,0.15)' : '#eff6ff') : 'transparent',
              color: filters.category === cat ? '#2563eb' : textMain,
              fontWeight: filters.category === cat ? 600 : 400,
              textAlign: 'left', transition: 'all 0.1s',
            }}>
              <span>{cat === 'All' ? '🏪' : CATEGORY_ICONS[cat]}</span> {cat}
            </button>
          ))}
        </div>
      </Section>

      <Section id="price" title="Price Range">
        <div style={{ display: 'flex', gap: 8 }}>
          {['minPrice', 'maxPrice'].map((key, i) => (
            <input key={key} type="number" placeholder={i === 0 ? 'Min ₹' : 'Max ₹'}
              value={filters[key]} onChange={e => onChange(key, e.target.value)}
              style={{
                flex: 1, padding: '8px 10px', borderRadius: 10,
                background: soft, border: `1px solid ${border}`,
                color: textMain, fontSize: 13, fontFamily: 'inherit', outline: 'none',
              }} />
          ))}
        </div>
      </Section>

      <Section id="condition" title="Condition">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {['', ...CONDITIONS].map(c => (
            <button key={c} onClick={() => onChange('condition', c)} style={{
              display: 'flex', alignItems: 'center', padding: '7px 10px',
              borderRadius: 10, fontSize: 13, fontFamily: 'inherit', border: 'none', cursor: 'pointer',
              background: filters.condition === c ? (dark ? 'rgba(37,99,235,0.15)' : '#eff6ff') : 'transparent',
              color: filters.condition === c ? '#2563eb' : textMain,
              fontWeight: filters.condition === c ? 600 : 400,
              textAlign: 'left', transition: 'all 0.1s',
            }}>
              {c || 'Any condition'}
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}
