import React from 'react';
import { Button } from './Button';

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
    <div style={{
      padding: '20px',
      margin: '20px 0',
      border: '2px solid #61dafb',
      borderRadius: '8px',
      backgroundColor: '#f0f8ff',
      fontFamily: 'Montserrat, sans-serif'
    }}>
      <h3 style={{ color: '#282c34', marginTop: 0 }}>
        <i className="fa-brands fa-react" style={{ color: '#61dafb', marginRight: '10px' }}></i>
        {title}
      </h3>
      <p style={{ color: '#555', fontSize: '14px' }}>{message}</p>
      
      <Button 
        onClick={onAction}
        variant="info"
        style={{
          backgroundColor: '#61dafb',
          color: '#282c34',
          marginTop: '10px'
        }}
      >
        Trigger AngularJS Callback
      </Button>
    </div>
  );
};

