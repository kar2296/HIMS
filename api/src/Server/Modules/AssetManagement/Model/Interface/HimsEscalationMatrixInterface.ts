import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface EscalationMatrixAttributes extends IAttributes {
    Id: number;
    EscalationTypeId: number;
    EscalationStatusId: number;
    FacilityId: number;
    DepartmentId: number;
    EscalationDate: Date;
    OffSet: String;
    UnitId: number;
    AnchorId: number;
    HelpdeskStatusId: number;
    NotificationTypeId: number;
    NotificationToId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface EscalationMatrixInstance extends Instance<EscalationMatrixAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: EscalationMatrixAttributes;
}
