/**
 * Builds the culture-report HTML that the Antibiotic Culture popup hands back to the result
 * editor (same table layout as the previous AngularJS version).
 * Plain-text values are HTML-escaped; Gram stain and Remarks are already rich-text HTML.
 */
export interface CultureReportInput {
  specimenName?: string;
  growth?: string;
  microNo?: string;
  site?: string;
  cultureReport?: string;
  organismIsolated?: string;
  gramStainHtml?: string;
  remarksHtml?: string;
  antibiotics: { name: string; result?: string; mic?: string }[];
}

export const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const hasText = (html?: string) => Boolean(html && html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim());

const row = (label: string, valueHtml: string) =>
  `<tr><td><b>${label}</b></td><td>:</td><td colspan= 3>${valueHtml}</td></tr>`;

export function buildCultureReportHtml(input: CultureReportInput): string {
  const tested = input.antibiotics.filter((a) => a.result || a.mic);
  let antibioticTable = '';
  if (tested.length > 0) {
    antibioticTable =
      '<table border="0" cellpadding="1" cellspacing="1" style="width:100vw;"><tbody>' +
      '<tr><td><b>Antiboitic</b></td><td>&nbsp;</td><td><b>Result</b></td><td>&nbsp;</td><td><b>MIC</b></td></tr>' +
      tested
        .map((a) => `<tr><td>${escapeHtml(a.name)}</td><td>:</td><td>${escapeHtml(a.result)}</td><td>:</td><td>${escapeHtml(a.mic)}</td></tr>`)
        .join('') +
      '</tbody></table>';
  }

  let html = '<table border="0" cellpadding="1" cellspacing="1" style="width:100vw;"><tbody>';
  if (input.specimenName) html += row('Specimen Name', escapeHtml(input.specimenName));
  if (input.growth) html += row('Growth', escapeHtml(input.growth));
  if (input.microNo) html += row('Micro No.', escapeHtml(input.microNo));
  if (input.site) html += row('Site', escapeHtml(input.site));
  if (input.cultureReport) html += row('Culture Report', escapeHtml(input.cultureReport));
  if (input.organismIsolated) html += row('Organism Isolated', escapeHtml(input.organismIsolated));
  if (hasText(input.gramStainHtml)) html += row('Gram Stain', input.gramStainHtml as string);
  if (hasText(input.remarksHtml)) {
    html += '<tr><td colspan="4"><br></td></tr>';
    html += row('Remarks', input.remarksHtml as string);
  }
  if (antibioticTable) html += `<tr><td vlign=top>${antibioticTable}</td><td>&nbsp;</td><td vlign=top></td></tr>`;
  html += '</tbody></table>';
  return html;
}
