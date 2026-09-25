import type React from 'react';
/**
 * Shared types for the EMR Workspace.
 *
 * Field names mirror the existing backend models (api/src/Server/Modules/...) exactly, so rows
 * can be sent back to the same Manage/Add/Update endpoints the legacy AngularJS screens use.
 */

/** Context handed over by the AngularJS hollow controller (emrworkspace.js). */
export interface EmrWorkspaceContext {
  patientId: number;
  encounterId: number;
  /** Active consultation ("visit entry"). Every record saved from a panel is tagged with it. */
  consultationId?: number | null;
  userId: number;
  userTypeId?: number;
  facilityId?: number;
}

/** Subset of the session encounter object (Visit/Visit/GetEncounters row). */
export interface EncounterInfo {
  Id: number;
  PatientId?: number;
  EncounterTypeId?: number;
  VisitIdentifier?: string;
  DoctorId?: number;
  DoctorName?: string;
  DepartmentId?: number;
  AppointmentId?: number;
  GuarantorId?: number;
  GuarantorTypeId?: number;
  ArrivedDate?: string;
  AdmissionDate?: string;
  DischargeDate?: string;
  CreatedAt?: string;
  EncounterStatusId?: number;
  WardId?: number;
  RoomId?: number;
  BedId?: number;
  [key: string]: any;
}

export interface PatientInfo {
  Id: number;
  MRN?: string;
  FirstName?: string;
  MiddleName?: string;
  LastName?: string;
  DOB?: string;
  Mobile?: string;
  Email?: string;
  PhotoPath?: string;
  Gender?: { Description?: string } | null;
  Nationality?: { Description?: string } | null;
  BloodGroup?: { Description?: string } | null;
  [key: string]: any;
}

/** Generic "General/Options/getoptions" lookup row. */
export interface LookupItem {
  Id: number;
  Text: string;
  [key: string]: any;
}

/* ───────────── EMR form (profile) model ───────────── */

/** hims_templatetabs row -- one EMR panel definition. */
export interface SectionMasterInfo {
  Id: number;
  Name: string;
  SectionTypeId?: number;
  SectionNoteTypeId?: string;
  SRef?: string | null;
  DockPositionId?: number;
  Description?: string;
}

/** hims_templatetabscreenmap row -- a panel placed on an EMR form. */
export interface ProfileSectionInfo {
  Id?: number;
  ProfileId: number;
  SectionId: number;
  DockPositionId?: number;
  DisplayOrder?: string | number;
  SectionMaster?: SectionMasterInfo;
}

/** hims_templatescreens row -- an EMR form ("EMR Form Group" in the toolbar). */
export interface ProfileInfo {
  Id: number;
  Name: string;
  Description?: string;
  ProfilemasterTypeId?: string;
  IsIVF?: boolean;
  ProfileSections?: ProfileSectionInfo[];
}

/** consultations row -- a visit entry. ProgressNoteStatusId 1 Draft, 2 Completed (approved), 3 Finalized (released). */
export interface ConsultationInfo {
  Id: number;
  PatientId: number;
  EncounterId: number;
  ProfileId?: number;
  Name?: string;
  ProgressNoteStatusId?: number;
  ProgressNoteStatus?: { Description?: string };
  ReferenceNo?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
  CreatedUser?: { FirstName?: string; LastName?: string };
  ProfileMaster?: ProfileInfo;
}

/** Per-form panel settings kept in emr_profile_section_settings (nickname / mandatory). */
export interface SectionSetting {
  ProfileId: number;
  SectionId: number;
  NickName?: string | null;
  IsMandatory?: boolean;
}

/** One tab in the workspace, resolved from a profile section (or the built-in fallback set). */
export interface WorkspaceTab {
  key: string;
  label: string;
  /** Panel type (SectionMaster.SRef, or a built-in key when there is no form). */
  sref: string;
  section?: SectionMasterInfo;
  mandatory?: boolean;
  /** Dock position from the form: 2 = top, 3 = right. */
  dock?: number;
}

export interface ApiListResponse<T> {
  Data: T[];
  PageContext?: { TotalRecords?: number };
}

/** Callbacks the hollow controller passes in (they run inside Angular's digest). */
export interface EmrHostCallbacks {
  /** Opens an existing AngularJS modal (utl.Modal.open) and calls onClosed when it closes. */
  openLegacyModal?: (modalName: string, params: Record<string, any>, onClosed?: () => void, options?: { fixed?: boolean }) => void;
  /** $state.go wrapper. */
  navigateTo?: (stateName: string, params?: Record<string, any>) => void;
  /** utl.Http.doDownload wrapper -- used for server-generated PDFs (print). */
  downloadFile?: (action: string, data: Record<string, any>) => void;
}

/** Every panel receives the same props so the registry stays uniform. */
export interface EmrPanelProps extends EmrHostCallbacks {
  context: EmrWorkspaceContext;
  encounter: EncounterInfo | null;
  /** False when there is no visit, no started visit entry, or the entry is finalized. */
  canEdit: boolean;
  /** The EMR panel definition this tab was built from (custom/question panels need it). */
  section?: SectionMasterInfo;
  /** Section ids on the active EMR form (server print needs the list). */
  profileSectionIds?: number[];
  /** Panels call this after a successful save so the header/other panels can refresh. */
  onDataChanged?: (panelKey: string) => void;
  /** Panels register their save handler here so the toolbar "Save" button can trigger it. */
  registerSaveHandler?: (handler: (() => Promise<boolean>) | null) => void;
  /**
   * Question panels only: the standard panel(s) to show while no questions are configured for this panel
   * (picked from the panel name, e.g. "Diagnosis" -> Diagnosis panel). See panelRegistry.builtInPanelsForName.
   */
  fallbackPanels?: Array<{ label: string; component: React.FC<EmrPanelProps> }>;
  /** Opens "Copy from previous visit" with the given visit entry pre-selected (only while the entry is editable). */
  onCopyFromVisit?: (consultationId: number) => void;
}
