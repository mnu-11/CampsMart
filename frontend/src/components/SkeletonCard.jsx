import { useDark } from '../hooks/useDark';

export default function SkeletonCard() {
  const dark = useDark();
  const surface = dark ? '#0a0f1e' : '#fff';
  const border = dark ? '#141929' : '#e8edf5';

  return (
    <div style={{ background: surface, borderRadius: 20, border: `1px solid ${border}`, overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
      <div className="skeleton" style={{ aspectRatio: '4/3', width: '100%', borderRadius: 0 }} />
      <div style={{ padding: 16 }}>
        <div className="skeleton" style={{ height: 14, width: '75%', marginBottom: 10, borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 12, width: '100%', marginBottom: 6, borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 14, borderRadius: 8 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div className="skeleton" style={{ height: 18, width: 64, borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 20, width: 52, borderRadius: 99 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${border}` }}>
          <div className="skeleton" style={{ height: 12, width: 64, borderRadius: 8 }} />
          <div className="skeleton" style={{ height: 12, width: 52, borderRadius: 8 }} />
        </div>
      </div>
    </div>
  );
}
