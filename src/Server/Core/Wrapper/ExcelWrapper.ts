import * as XLSX from 'xlsx';

export class Excel {
    public static ReadFile(filename: string, opts?: XLSX.ParsingOptions): XLSX.WorkBook {
        return XLSX.readFile(filename);
    }
    public static Read(data: any, opts?: XLSX.ParsingOptions): XLSX.WorkBook {
        return XLSX.read(data, opts);
    }
    public static Write(data: any, opts?: XLSX.WritingOptions): any {
        return XLSX.write(data, opts);
    }
    private workbook: XLSX.WorkBook;
    constructor(workbook: XLSX.WorkBook) {
        if (!workbook) {
            throw 'workbook is empty';
        }
        this.workbook = workbook;
    }
    public get Sheets(): { [sheet: string]: XLSX.WorkSheet } {
        return this.workbook.Sheets;
    }
    public get SheetNames(): Array<string> {
        return this.workbook.SheetNames;
    }
    public GetWorksheetByName(name: string): XLSX.WorkSheet {
        return this.workbook.Sheets[name];
    }
    public ToCSV(worksheet: string | XLSX.WorkSheet): any {
        let sheet = this._getWorksheet(worksheet);
        return XLSX.utils.sheet_to_csv(sheet);
    }
    public ToJSON(worksheet: string | XLSX.WorkSheet): any {
        let sheet = this._getWorksheet(worksheet);
        return XLSX.utils.sheet_to_json(sheet);
    }
    public ToFormulae(worksheet: string | XLSX.WorkSheet): any {
        let sheet = this._getWorksheet(worksheet);
        return XLSX.utils.sheet_to_formulae(sheet);
    }
    public ToEncode(cellAddress: XLSX.CellAddress): any {
        return XLSX.utils.encode_cell(cellAddress);
    }
    public ToEncodeRange(frm: XLSX.CellAddress, to: XLSX.CellAddress): any {
        return XLSX.utils.encode_range(frm, to);
    }
    private _getWorksheet(worksheet: string | XLSX.WorkSheet) {
        let sheet: XLSX.WorkSheet = worksheet as XLSX.WorkSheet;
        if (typeof worksheet === 'string') {
            sheet = this.GetWorksheetByName(worksheet);
        }
        return sheet;
    }
}
