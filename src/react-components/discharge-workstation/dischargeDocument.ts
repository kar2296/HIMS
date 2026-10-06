/**
 * Discharge summary document model.
 *
 * The workstation edits a summary as named sections plus a list of discharge medicines, but the
 * record is stored exactly where the classic form stores it: patientcertificates.DataTemplate (HTML).
 * That keeps the existing print (PrintPatientCertificate), list and classic form working.
 *
 * Round-trip: buildSummaryHtml() writes printable HTML with data-dsw-* markers; parseSummaryHtml()
 * reads it back. HTML written by the classic form has no markers and is reported as `legacy`, so the
 * screen opens it as a whole document instead of guessing at sections.
 *
 * All user text is HTML-escaped before it is written (the HTML is later rendered by print / classic form).
 */

export type SectionKey =
  | 'admissionReason'
  | 'admissionDiagnosis'
  | 'finalDiagnosis'
  | 'hospitalCourse'
  | 'procedures'
  | 'investigations'
  | 'conditionAtDischarge'
  | 'advice'
  | 'followUp';

export interface SectionDef {
  key: SectionKey;
  title: string;
  /** Must be filled before the summary can be completed / approved. */
  required?: boolean;
  placeholder: string;
  rows: number;
  /** Spans the full width of the form. */
  wide?: boolean;
}

export const SECTIONS: SectionDef[] = [
  { key: 'admissionReason', title: 'Reason for Admission / Presenting Complaints', placeholder: 'Presenting complaints and reason for admission', rows: 3 },
  { key: 'admissionDiagnosis', title: 'Diagnosis at Admission', placeholder: 'Provisional / admitting diagnosis', rows: 2 },
  { key: 'finalDiagnosis', title: 'Final Diagnosis', required: true, placeholder: 'Final diagnosis at discharge (with ICD-10 code if known)', rows: 2 },
  { key: 'hospitalCourse', title: 'Hospital Course', required: true, placeholder: 'Course in hospital, treatment given and response', rows: 6, wide: true },
  { key: 'procedures', title: 'Procedures / Surgeries', placeholder: 'Procedures or surgeries done, with dates', rows: 3 },
  { key: 'investigations', title: 'Key Investigations & Findings', placeholder: 'Significant lab, imaging and other findings', rows: 3 },
  { key: 'conditionAtDischarge', title: 'Condition at Discharge', required: true, placeholder: 'General condition and vitals at discharge', rows: 3 },
  { key: 'advice', title: 'Advice, Diet & Activity', required: true, placeholder: 'Advice on diet, activity, wound care, warning signs', rows: 3 },
  { key: 'followUp', title: 'Follow-up', placeholder: 'When and where to follow up', rows: 2 },
];

export type SectionValues = Record<SectionKey, string>;

export interface DischargeMedicine {
  name: string;
  dose?: string;
  frequency?: string;
  route?: string;
  duration?: string;
  instructions?: string;
}

export interface SummaryDocument {
  sections: SectionValues;
  medicines: DischargeMedicine[];
}

export type ParsedSummary =
  | { kind: 'empty' }
  | { kind: 'structured'; doc: SummaryDocument }
  | { kind: 'legacy'; html: string };

export const emptySections = (): SectionValues =>
  SECTIONS.reduce((acc, s) => ({ ...acc, [s.key]: '' }), {} as SectionValues);

export const emptyDocument = (): SummaryDocument => ({ sections: emptySections(), medicines: [] });

const MED_FIELDS: (keyof DischargeMedicine)[] = ['name', 'dose', 'frequency', 'route', 'duration', 'instructions'];
const MED_HEADERS = ['Medicine', 'Dose', 'Frequency', 'Route', 'Duration', 'Instructions'];

export const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Multi-line text -> escaped paragraph body; blank lines start a new paragraph. */
const textToHtml = (text: string): string =>
  text
    .trim()
    .split(/\n{2,}/)
    .map((para) => `<p data-dsw-body="1">${para.split('\n').map(escapeHtml).join('<br>')}</p>`)
    .join('');

const heading = (title: string) =>
  `<p><strong><u>${escapeHtml(title.toUpperCase())}</u>:</strong></p>`;

const cleanMedicine = (m: DischargeMedicine): DischargeMedicine => {
  const out: DischargeMedicine = { name: String(m.name ?? '').trim() };
  MED_FIELDS.slice(1).forEach((f) => {
    const v = String(m[f] ?? '').trim();
    if (v) out[f] = v;
  });
  return out;
};

const medicinesHtml = (medicines: DischargeMedicine[]): string => {
  const rows = medicines
    .map((m, i) => `<tr><td>${i + 1}</td>${MED_FIELDS.map((f) => `<td>${escapeHtml(m[f] || '')}</td>`).join('')}</tr>`)
    .join('');
  const cell = 'style="border:1px solid #999;padding:4px 6px;text-align:left"';
  return (
    `<table data-dsw-meds-table="1" style="border-collapse:collapse;width:100%" border="1" cellpadding="4">` +
    `<thead><tr><th ${cell}>#</th>${MED_HEADERS.map((h) => `<th ${cell}>${h}</th>`).join('')}</tr></thead>` +
    `<tbody>${rows}</tbody></table>`
  );
};

/** Printable HTML for patientcertificates.DataTemplate. Empty sections are left out. */
export function buildSummaryHtml(doc: SummaryDocument): string {
  const parts: string[] = [];
  let medsPlaced = false;
  SECTIONS.forEach((s) => {
    // Discharge medicines print just before the advice section.
    if (s.key === 'advice') {
      parts.push(medicinesBlock(doc.medicines));
      medsPlaced = true;
    }
    const text = (doc.sections[s.key] || '').trim();
    if (text) parts.push(`<div data-dsw-section="${s.key}">${heading(s.title)}${textToHtml(text)}</div>`);
  });
  if (!medsPlaced) parts.push(medicinesBlock(doc.medicines));
  return `<div data-dsw-doc="1">${parts.join('')}</div>`;
}

function medicinesBlock(medicines: DischargeMedicine[]): string {
  const meds = (medicines || []).map(cleanMedicine).filter((m) => m.name);
  if (meds.length === 0) return '';
  const json = escapeHtml(JSON.stringify(meds));
  return `<div data-dsw-meds="${json}">${heading('Discharge Medications')}${medicinesHtml(meds)}</div>`;
}

/** Reads text back out of a section body (paragraphs -> blank line, <br> -> newline). */
function bodyText(section: Element): string {
  const bodies = Array.from(section.querySelectorAll('p[data-dsw-body]'));
  return bodies
    .map((p) => {
      const clone = p.cloneNode(true) as Element;
      clone.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
      return clone.textContent || '';
    })
    .join('\n\n')
    .trim();
}

const hasVisibleContent = (html: string, parser: DOMParser): boolean => {
  const body = parser.parseFromString(html, 'text/html').body;
  return !!(body.textContent || '').trim() || !!body.querySelector('img, table');
};

export function parseSummaryHtml(html: string | null | undefined, parser: DOMParser = new DOMParser()): ParsedSummary {
  const source = (html || '').trim();
  if (!source || !hasVisibleContent(source, parser)) return { kind: 'empty' };

  const dom = parser.parseFromString(source, 'text/html');
  const root = dom.querySelector('[data-dsw-doc]');
  if (!root) return { kind: 'legacy', html: source };

  const doc = emptyDocument();
  root.querySelectorAll('[data-dsw-section]').forEach((el) => {
    const key = el.getAttribute('data-dsw-section') as SectionKey;
    if (key in doc.sections) doc.sections[key] = bodyText(el);
  });
  const medsEl = root.querySelector('[data-dsw-meds]');
  if (medsEl) {
    try {
      const list = JSON.parse(medsEl.getAttribute('data-dsw-meds') || '[]');
      if (Array.isArray(list)) doc.medicines = list.map(cleanMedicine).filter((m) => m.name);
    } catch {
      doc.medicines = [];
    }
  }
  return { kind: 'structured', doc };
}

const BLOCKED_TAGS = 'script,style,iframe,object,embed,link,meta,base,form,input,button,textarea,select';

/**
 * Read-only display copy of stored HTML: removes active content (scripts, frames, forms, event
 * handlers, javascript: URLs). Only used to *show* a summary; stored HTML is never rewritten.
 */
export function sanitizeForDisplay(html: string, parser: DOMParser = new DOMParser()): string {
  const dom = parser.parseFromString(html || '', 'text/html');
  dom.body.querySelectorAll(BLOCKED_TAGS).forEach((el) => el.remove());
  dom.body.querySelectorAll('*').forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      // Browsers ignore whitespace and control characters inside a URL scheme ("java\tscript:").
      const value = Array.from(attr.value)
        .filter((ch) => ch.charCodeAt(0) > 0x20)
        .join('')
        .toLowerCase();
      if (name.startsWith('on') || ((name === 'href' || name === 'src' || name === 'xlink:href') && value.startsWith('javascript:'))) {
        el.removeAttribute(attr.name);
      }
    });
  });
  return dom.body.innerHTML;
}

/** Titles of required sections that are still empty. */
export const missingRequired = (sections: SectionValues): string[] =>
  SECTIONS.filter((s) => s.required && !(sections[s.key] || '').trim()).map((s) => s.title);

/** patientcertificates.CertificateStatusId values (ReferenceValue CertificateStatus). */
export const CERT_STATUS = { CREATED: 1, DRAFT: 2, APPROVED: 3, CANCELLED: 4, RELEASED: 5 } as const;

export const certStatusLabel = (id?: number | null): string => {
  switch (id) {
    case CERT_STATUS.DRAFT:
      return 'Draft';
    case CERT_STATUS.CREATED:
      return 'Completed';
    case CERT_STATUS.APPROVED:
      return 'Approved';
    case CERT_STATUS.RELEASED:
      return 'Released';
    case CERT_STATUS.CANCELLED:
      return 'Cancelled';
    default:
      return 'Not started';
  }
};

/** Approved / released summaries are locked, like the classic form. */
export const isLocked = (statusId?: number | null) =>
  statusId === CERT_STATUS.APPROVED || statusId === CERT_STATUS.RELEASED || statusId === CERT_STATUS.CANCELLED;
