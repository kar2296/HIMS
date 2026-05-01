import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface PatientWorkOrderAntibioticsAttributes extends IAttributes {
    Id: number;
    OrderId: number;
    WorkOrderId: number;
    PatientId: number;
    EncounterId: number;
    OrderedDate: Date;
    SpecimenId: string;
    OrganismIsolatedId: string;
    GramStain: string;
    ColonyCount: string;
    Blood: string;
    Remarks: string;
    TypeId: number;
    Antibiotics: string;
    MCH: string;
    MicroNo: string;
    CultutreReport: string;
    ResultId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface PatientWorkOrderAntibioticsInstance extends Instance<PatientWorkOrderAntibioticsAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientWorkOrderAntibioticsAttributes;
}
