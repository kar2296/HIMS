import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface ItemContractMapAttributes extends IAttributes {
    Id: number;
    ItemMasterId: number;
    ContractName: string;
    DepartmentId: number;
    DepartmentName: string;
    Name:string;
    FilePath: string;
    DocumentTypeId: number;
    DocumentDate: Date;
    Attachments: string;
    ReleaseToPatientId: number;
    Comments: string;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface ItemContractMapInstance extends Instance<ItemContractMapAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: ItemContractMapAttributes;
}
