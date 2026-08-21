import React from 'react';
import { Button } from './Button';
import { Card } from '../components/ui/Card';
import { colors, spacing, typography } from '../components/ui/tokens';

interface PilotComponentProps {
  title?: string;
  message?: string;
  onAction?: () => void;
}

export const PilotComponent: React.FC<PilotComponentProps> = ({
  title = "React Integration Pilot",
  message = "This component is running in React 19!",
  onAction
}) => {
  return (
    <Card style={{ margin: `${spacing.lg} 0` }}>
      <h3 style={{ ...typography.sectionHeading, color: colors.textMain, marginTop: 0 }}>
        <i className="fa-brands fa-react" style={{ color: colors.primary, marginRight: spacing.sm }}></i>
        {title}
      </h3>
      <p style={{ ...typography.body, color: colors.textMuted }}>{message}</p>

      <Button
        onClick={onAction}
        variant="info"
        style={{ marginTop: spacing.sm }}
      >
        Trigger AngularJS Callback
      </Button>
    </Card>
  );
};
