import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface EncounterIPPackageDetailAttributes extends IAttributes {
    Id: number;
    EncounterIPPackageId: number;
    IPPackageDetailId: number;
    ServiceCategoryId: number;
    ServiceCategoryCode: string;
    ServiceCategoryName: string;
    ActualAmount: number;
    PackageAmount: number;
    ActualPatAmount: number;
    ActiveStatusId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface EncounterIPPackageDetailInstance extends Instance<EncounterIPPackageDetailAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: EncounterIPPackageDetailAttributes;
}
