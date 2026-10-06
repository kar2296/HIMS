import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface DocumentAttributes extends IAttributes {
    Id: number;
    OrganizationId: number;
    FacilityId: number;
    DepartmentId: number;
    DocumentTitle: string;
    DocumentDate: Date;
    ExpiryDate: Date;
    DocumentForId: number;
    DocumentTypeId: number;
    DocumentName: string;
    DocumentStatusId: number;
    Comments: string;
    DocumentPath: string;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
    CancelledBy: number;
    CancelledAt: Date;
}

export interface DocumentInstance extends Instance<DocumentAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: DocumentAttributes;
}
