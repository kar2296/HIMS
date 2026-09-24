/**
 * Discharge Summary Workstation.
 *
 * - From the menu (app.emrdischargesummary): worklist of in-patients -> editor for the chosen admission.
 * - From a patient's EMR (patientemr.dischargeworkstation): opens that admission's editor directly.
 *
 * Mounted by public/views/emr/dischargeworkstation/dischargeworkstation.{js,html}; the hollow
 * controller only passes session context and host callbacks. Data lives in the existing
 * patientcertificates table (see dischargeDocument.ts / dischargeData.ts).
 */
import React, { useState } from 'react';
import { DischargeWorkstationStyles } from './DischargeWorkstationStyles';
import { DischargeWorklist } from './DischargeWorklist';
import { DischargeEditor } from './DischargeEditor';

export interface DischargeWorkstationScreenProps {
  reactProps?: {
    context?: {
      /** Opened from a patient's EMR: never show the worklist, wait for the admission instead. */
      patientEmr?: boolean;
      /** Set when opened from a patient's EMR; the worklist is skipped. */
      encounterId?: number;
      userId?: number;
      facilityId?: number;
    };
  };
  downloadFile?: (action: string, data: unknown) => void;
  navigateTo?: (state: string, params?: Record<string, unknown>) => void;
}

export const DischargeWorkstationScreen: React.FC<DischargeWorkstationScreenProps> = ({ reactProps, downloadFile, navigateTo }) => {
  const ctx = reactProps?.context || {};
  const fixedEncounterId = ctx.encounterId && ctx.encounterId > 0 ? ctx.encounterId : 0;
  const [selectedId, setSelectedId] = useState<number>(0);
  const encounterId = fixedEncounterId || selectedId;

  return (
    <div className="dsw-root">
      <DischargeWorkstationStyles />
      {!encounterId && ctx.patientEmr ? (
        <div className="dsw-stack">
          <div className="dsw-card">Loading the patient's admission…</div>
        </div>
      ) : encounterId ? (
        <DischargeEditor
          key={encounterId}
          encounterId={encounterId}
          userId={ctx.userId || 0}
          facilityId={ctx.facilityId || 0}
          onBack={fixedEncounterId ? undefined : () => setSelectedId(0)}
          downloadFile={downloadFile}
          navigateTo={navigateTo}
        />
      ) : (
        <DischargeWorklist onOpen={(a) => setSelectedId(a.Id)} />
      )}
    </div>
  );
};
