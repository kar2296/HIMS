import { IAttributes } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface FavoriteMasterAttributes extends IAttributes {
    Id: number;
    Name: string;
    FavoriteTypeId: number;
    FacilityId: number;
    DepartmentId: number;
    UserId: number;
    IsActive: boolean;
    ActiveStatusId: number;
    AccessibleTypeId: number;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface FavoriteMasterInstance extends Instance<FavoriteMasterAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: FavoriteMasterAttributes;
}
