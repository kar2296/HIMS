import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface CategorySectionEntryAttributes extends IAttributes {
    Id: number;
    EncounterId: number;
    ConsultationId: number;
    IPCasesheetId: number;
    IPCasesheetAt: Date;
    IPCasesheetUserId: number;
    OTRegisterId: number;
    PhysioRegisterId: number;
    PatientId: number;
    SectionId: number;
    ResultValueRichText: string;
    CategoryKey: string;
    ConceptKey: string;
    TermKey: string;
    ResultValue: string;
    ResultBinary: string;
    ResultPath: string;
    EntryDate: Date;
    Comments: string;
    ResultValueJSON: string;
    TermName: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface CategorySectionEntryInstance extends Instance<CategorySectionEntryAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: CategorySectionEntryAttributes;
}
