import {IAttributes} from '../../../Base/Index';
import {Instance} from '../../../../Core/Index';

export interface FavoriteMasterDetailAttributes extends IAttributes {
    Id: number;
    FavoriteMasterId: number;
    FavoriteTypeId: number;
    ItemId: number;
    DisplayName: string;
    GroupName : string;
    Comments: string;
    IsActive: boolean;
    Status: number;
    Rev: number;
    CreatedBy: number;
    CreatedAt: Date;
    UpdatedBy: number;
    UpdatedAt: Date;
}

export interface FavoriteMasterDetailInstance extends Instance<FavoriteMasterDetailAttributes> {
    // I'm exposing every DB column as an instance field to so that tsc won't complain.
    // CreatedAt: Date;
    // UpdatedAt: Date;
    dataValues: FavoriteMasterDetailAttributes;
}
