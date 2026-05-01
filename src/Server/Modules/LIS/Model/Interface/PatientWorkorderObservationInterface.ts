import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface PatientWorkorderObservationAttributes extends IAttributes {
    Id: number;
    OrderdetailId: number;
    EncounterorderId: number;
    DisplayOrder: number;
    MCH: string;
    Observations: string;
    ObservationType: number;
    ObservationDid: number;
    ObservationName: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    Reason: string;
}

export interface PatientWorkorderObservationInstance extends Instance<PatientWorkorderObservationAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: PatientWorkorderObservationAttributes;
}
