import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EMR_MASTERS_CATALOG, getMasterData, type EmrMasterDefinition } from './emrMastersData';

export const EmrMastersHubScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const set = new Set(EMR_MASTERS_CATALOG.map((m) => m.category));
    return ['All', ...Array.from(set)];
  }, []);

  const filteredMasters = useMemo(() => {
    return EMR_MASTERS_CATALOG.filter((m) => {
      if (activeCategory !== 'All' && m.category !== activeCategory) return false;
      if (searchTerm.trim()) {
        const t = searchTerm.toLowerCase();
        return (
          m.title.toLowerCase().includes(t) ||
          m.description.toLowerCase().includes(t) ||
          m.category.toLowerCase().includes(t) ||
          m.legacyUrl.toLowerCase().includes(t)
        );
      }
      return true;
    });
  }, [searchTerm, activeCategory]);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '20px 28px', fontFamily: 'inherit' }}>
      {/* Top Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%)',
          borderRadius: 10,
          padding: '24px 28px',
          color: '#fff',
          boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ margin: '0 0 6px 0', fontSize: 24, fontWeight: 800 }}>EMR Masters Directory</h1>
            <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>
              Centralized repository for Review of Systems, Physical Exams, Anesthesia, Scoring Scales, Nursing, and Specialty Clinical Masters.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={() => navigate('/emr/form-assembly')}
              style={{
                background: '#fff',
                color: '#2b6cb0',
                border: 'none',
                borderRadius: 6,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <i className="fa-solid fa-layer-group" /> EMR Form Assembly
            </button>
            <button
              type="button"
              onClick={() => navigate('/emr/print-config')}
              style={{
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <i className="fa-solid fa-print" /> Print Config Master
            </button>
            <button
              type="button"
              onClick={() => navigate('/emr/edit-vital/panel_1_1_0/1')}
              style={{
                background: '#ed8936',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <i className="fa-solid fa-heart-pulse" /> Vitals Master (46)
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: '#fff',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          padding: '14px 20px',
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          flexWrap: 'wrap',
          gap: 14,
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', width: 360 }}>
          <i
            className="fa-solid fa-magnifying-glass"
            style={{ position: 'absolute', left: 12, top: 11, color: '#a0aec0', fontSize: 13 }}
          />
          <input
            type="text"
            placeholder="Search EMR Masters by name, description, or URL…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              borderRadius: 6,
              border: '1px solid #cbd5e0',
              fontSize: 13,
              outline: 'none',
            }}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {categories.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                style={{
                  border: 'none',
                  borderRadius: 16,
                  padding: '5px 12px',
                  fontSize: 12,
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  background: isSelected ? '#2b6cb0' : '#edf2f7',
                  color: isSelected ? '#fff' : '#4a5568',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Masters Directory Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16,
        }}
      >
        {filteredMasters.map((def: EmrMasterDefinition) => {
          const count = getMasterData(def.key).length;
          return (
            <div
              key={def.key}
              onClick={() => navigate(`/emr/masters/${def.key}`)}
              style={{
                background: '#fff',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                padding: '16px 20px',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = '#90cdf4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#2b6cb0',
                      background: '#ebf8ff',
                      padding: '2px 8px',
                      borderRadius: 10,
                    }}
                  >
                    {def.category}
                  </span>
                  <span style={{ fontSize: 11, color: '#718096', fontWeight: 600 }}>
                    {count} records
                  </span>
                </div>

                <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#2d3748' }}>
                  {def.title}
                </h3>
                <p style={{ margin: '0 0 12px', fontSize: 12, color: '#718096', lineHeight: 1.4 }}>
                  {def.description}
                </p>
              </div>

              <div
                style={{
                  borderTop: '1px solid #edf2f7',
                  paddingTop: 10,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 12,
                  color: '#4a5568',
                }}
              >
                <code style={{ fontSize: 11, color: '#718096', background: '#f7fafc', padding: '2px 6px', borderRadius: 4 }}>
                  /{def.legacyUrl}
                </code>
                <span style={{ color: '#3182ce', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                  Manage <i className="fa-solid fa-arrow-right" style={{ fontSize: 11 }} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
