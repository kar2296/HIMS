import React from 'react';
import { spacing, typography } from '../components/ui/tokens';

// Shared React view for AngularJS "dashboard of tiles" pages (a heading and a set of tiles that
// each open another screen). The controller decides which tiles the user may see (privileges)
// and handles navigation; this component renders the view model and reports
// onAction('open', { key }) when a tile is clicked or activated from the keyboard.
// Tiles keep the app's existing card classes (card-box-item / box-bg-colorN) so they look the
// same as the other dashboards.
// Used by: Inventory Master dashboard (inventorymasterdashboard.js).

export interface DashboardTile {
  key: string;
  label: string;
  /** Font Awesome class, e.g. "fa fa-list". */
  icon: string;
  /** One of the app's tile colour classes, e.g. "box-bg-color3". */
  colorClass: string;
}

export interface DashboardTilesViewModel {
  title: string;
  tiles: DashboardTile[];
  emptyText: string;
}

export interface DashboardTilesScreenProps {
  reactProps?: DashboardTilesViewModel;
  onAction?: (action: string, payload?: Record<string, unknown>) => void;
}

export const DashboardTilesScreen: React.FC<DashboardTilesScreenProps> = ({ reactProps, onAction }) => {
  const vm = reactProps;
  if (!vm) return null;
  return (
    <div style={{ fontFamily: typography.fontFamily }}>
      <div className="page-header">
        <div className="col-sm-12">
          <h4>{vm.title}</h4>
        </div>
      </div>
      <div className="col-sm-12" style={{ marginTop: 20 }}>
        {vm.tiles.length === 0 ? (
          <p style={{ color: '#64748b', padding: spacing.md }}>{vm.emptyText}</p>
        ) : (
          <nav className="card-flex-box-appointment" aria-label={vm.title}>
            {vm.tiles.map((tile) => (
              <button
                key={tile.key}
                type="button"
                className={`card-box-item ${tile.colorClass}`}
                data-tile={tile.key}
                onClick={() => onAction?.('open', { key: tile.key })}
                style={{ border: 'none', textAlign: 'left', font: 'inherit', cursor: 'pointer' }}
              >
                <div className="card-box-header">
                  <i className={tile.icon} aria-hidden="true" />
                  <div>{tile.label}</div>
                </div>
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
};

export default DashboardTilesScreen;
