import React from 'react';

interface LabDashboardProps {
  permissions?: any;
  onNavigate?: (stateName: string, params?: any) => void;
}

export const LabDashboardComponent: React.FC<LabDashboardProps> = ({
  permissions = {},
  onNavigate
}) => {

  const handleCardClick = (stateName: string, params?: any) => {
    if (onNavigate) {
      onNavigate(stateName, params);
    }
  };

  const cards = [
    {
      id: 'OrderAcceptances',
      title: 'Order Acceptances',
      icon: 'fa-file-text-o',
      count: undefined,
      show: permissions.CanOrderAcceptances !== false,
      color: '#4a90e2', // blue
      action: () => handleCardClick('app.orderacknowledgements', { tp: 1, context: 'lab' })
    },
    {
      id: 'SpecimenCollection',
      title: 'Specimen Collection',
      icon: 'fa-user',
      count: undefined,
      show: permissions.CanSpecimenCollection !== false,
      color: '#50e3c2', // teal
      action: () => handleCardClick('app.samplecollectionlist')
    },
    {
      id: 'ResultEntries',
      title: 'Result Entries',
      icon: 'fa-file-text-o',
      count: undefined,
      show: permissions.CanResultEntries !== false,
      color: '#f5a623', // orange
      action: () => handleCardClick('app.processallorders', { tp: 1, context: 'lab' })
    },
    {
      id: 'ResultApprovals',
      title: 'Result Approvals',
      icon: 'fa-usd',
      count: undefined,
      show: permissions.CanResultApprovals !== false,
      color: '#7ed321', // green
      action: () => handleCardClick('app.approvalallorders', { tp: 1 })
    },
    {
      id: 'ResultReleases',
      title: 'Result Releases',
      icon: 'fa-list',
      count: undefined, // Legacy logic uses 0 here
      show: permissions.CanResultReleases !== false,
      color: '#bd10e0', // purple
      action: () => handleCardClick('app.resultdispatches', { tp: 1 })
    },
    {
      id: 'ResultTemplates',
      title: 'Result Templates',
      icon: 'fa-inr',
      count: undefined,
      show: permissions.CanResultTemplates !== false,
      color: '#ff5a5f', // coral
      action: () => handleCardClick('app.notetemplates', { context: 'lab' })
    },
    {
      id: 'ManageTests',
      title: 'Manage Tests',
      icon: 'fa-percent',
      count: undefined,
      show: permissions.CanManageTests !== false,
      color: '#8b572a', // brown
      action: () => handleCardClick('app.testmasters', { context: 'lab' })
    },
    {
      id: 'ManageParameter',
      title: 'Manage Parameter',
      icon: 'fa-briefcase',
      count: undefined,
      show: permissions.CanManageParameter !== false,
      color: '#e46a76', // pink
      action: () => handleCardClick('app.analytemasters', { context: 'lab' })
    },
    {
      id: 'Reports',
      title: 'Reports',
      icon: 'fa-chevron-circle-right',
      count: undefined,
      show: permissions.CanReports !== false,
      color: '#00c292', // mint
      action: () => handleCardClick('app.labreports', { context: 'lab' })
    },
    {
      id: 'AntibioticMaster',
      title: 'Antibiotic Master',
      icon: 'fa-shield-virus', // Use modern fas icon matching legacy
      count: undefined, // Legacy shows empty, we default to undefined
      show: true, // Legacy has no privilege check
      color: '#f5a623', // orange (matches box-bg-color3 in legacy)
      action: () => handleCardClick('app.antibioticmasters', { context: 'lab' })
    },
    {
      id: 'OrganismIsolation',
      title: 'Organism Isolation',
      icon: 'fa-bacterium', // Use modern fas icon matching legacy
      count: undefined, // Legacy shows empty, we default to undefined
      show: true, // Legacy has no privilege check
      color: '#4a90e2', // blue (matches box-bg-color1 in legacy)
      action: () => handleCardClick('app.organismsisolations', { context: 'lab' })
    }
  ];

  return (
    <div style={{ padding: '24px', fontFamily: 'var(--font-modern)', backgroundColor: 'var(--premium-bg-light)', minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ margin: 0, color: 'var(--premium-text-main)', fontSize: '24px', fontWeight: 600 }}>
            Lab Dashboard
          </h4>
        </div>
      </div>

      {/* Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '20px'
      }}>
        {cards.filter(c => c.show).map(card => (
          <div 
            key={card.id}
            onClick={card.action}
            className="premium-glass-panel"
            style={{
              padding: '20px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s',
              borderTop: `4px solid ${card.color}`,
              height: '140px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{
                width: '45px',
                height: '45px',
                borderRadius: '8px',
                backgroundColor: `${card.color}15`,
                color: card.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}>
                <i className={`fas ${card.icon}`}></i>
              </div>
              {card.count !== undefined && (
                <div style={{ color: 'var(--premium-text-main)', fontSize: '24px', fontWeight: 700 }}>
                  {card.count}
                </div>
              )}
            </div>
            
            <div style={{ color: 'var(--premium-text-muted)', fontSize: '14px', fontWeight: 600, marginTop: 'auto' }}>
              {card.title}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
