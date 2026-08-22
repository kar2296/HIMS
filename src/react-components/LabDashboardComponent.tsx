import React from 'react';
import { colors, spacing, typography } from '../components/ui/tokens';
import { StatCard, ActionCard, DashboardSection, DashboardPageWrapper } from '../components/ui/DashboardComponents';

interface LabDashboardProps {
  permissions?: any;
  onNavigate?: (stateName: string, params?: any) => void;
}

export const LabDashboardComponent: React.FC<LabDashboardProps> = ({ permissions = {}, onNavigate }) => {
  const handleCardClick = (state: string, params?: any) => {
    if (onNavigate) onNavigate(state, params);
  };

  const metricCards = [
    { title: 'Order Acceptances', icon: 'fa-file-medical', color: '#2563eb', show: permissions.CanOrderAcceptances !== false, action: () => handleCardClick('app.orderacknowledgements', { tp: 1, context: 'lab' }) },
    { title: 'Specimen Collection', icon: 'fa-vial', color: '#0ea5e9', show: permissions.CanSpecimenCollection !== false, action: () => handleCardClick('app.samplecollectionlist') },
    { title: 'Result Entries', icon: 'fa-flask', color: '#f59e0b', show: permissions.CanResultEntries !== false, action: () => handleCardClick('app.processallorders', { tp: 1, context: 'lab' }) },
    { title: 'Result Approvals', icon: 'fa-circle-check', color: '#10b981', show: permissions.CanResultApprovals !== false, action: () => handleCardClick('app.approvalallorders', { tp: 1 }) },
    { title: 'Result Releases', icon: 'fa-paper-plane', color: '#8b5cf6', show: permissions.CanResultReleases !== false, action: () => handleCardClick('app.resultdispatches', { tp: 1 }) },
    { title: 'Result Templates', icon: 'fa-file-pen', color: '#f43f5e', show: permissions.CanResultTemplates !== false, action: () => handleCardClick('app.notetemplates', { context: 'lab' }) },
  ].filter((c) => c.show !== false);

  const actionCards = [
    { title: 'Manage Tests', icon: 'fa-list-check', color: '#64748b', show: permissions.CanManageTests !== false, action: () => handleCardClick('app.testmasters', { context: 'lab' }) },
    { title: 'Manage Parameters', icon: 'fa-sliders', color: '#06b6d4', show: permissions.CanManageParameter !== false, action: () => handleCardClick('app.analytemasters', { context: 'lab' }) },
    { title: 'Reports', icon: 'fa-chart-bar', color: '#84cc16', show: permissions.CanReports !== false, action: () => handleCardClick('app.labreports', { context: 'lab' }) },
    { title: 'Antibiotic Master', icon: 'fa-shield-virus', color: '#f59e0b', show: true, action: () => handleCardClick('app.antibioticmasters', { context: 'lab' }) },
    { title: 'Organism Isolation', icon: 'fa-bacterium', color: '#2563eb', show: true, action: () => handleCardClick('app.organismsisolations', { context: 'lab' }) },
  ].filter((c) => c.show !== false);

  return (
    <DashboardPageWrapper title="Lab Dashboard" subtitle="Laboratory information and workflow management">
      <DashboardSection title="Workflow">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: spacing.lg }}>
          {metricCards.map((card, i) => (
            <StatCard key={i} title={card.title} icon={card.icon} color={card.color} onClick={card.action} />
          ))}
        </div>
      </DashboardSection>
      <DashboardSection title="Masters & Reports">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: spacing.md }}>
          {actionCards.map((card, i) => (
            <ActionCard key={i} title={card.title} icon={card.icon} color={card.color} onClick={card.action} />
          ))}
        </div>
      </DashboardSection>
    </DashboardPageWrapper>
  );
};
