import { IAudit } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';

export interface UserFacilityMapAttributes extends IAudit {
    Id?: number; // Primary key - this was missing and causing the model error
    Rev?: number; // Revision number
    UserId: number;
    FacilityId: number;
    Status?: number; // Status field (commonly needed)
    CreatedBy?: number;
    CreatedAt?: Date;
    UpdatedBy?: number;
    UpdatedAt?: Date;
}
export interface UserFacilityMapInstance extends Instance<UserFacilityMapAttributes> {
    dataValues: UserFacilityMapAttributes;
    // Instance methods
    getDataValue<K extends keyof UserFacilityMapAttributes>(key: K): UserFacilityMapAttributes[K];
    setDataValue<K extends keyof UserFacilityMapAttributes>(key: K, value: UserFacilityMapAttributes[K]): void;
}

