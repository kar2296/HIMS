import { IAudit } from '../../../Base/Index';
import { Instance } from '../../../../Core/Index';
export interface UserCategoryMapAttributes extends IAudit {
    Id?: number; // Primary key
    UserId: number;
    CategoryId: number;
    // Standard properties that appear to be required by IAttributes
    // (based on the pattern from your other models)
    Status?: number; // Status flag
    Rev?: number; // Revision number - this was specifically mentioned in the error
    // Audit properties - include these if they're not in IAudit
    CreatedBy?: number;
    CreatedAt?: Date;
    UpdatedBy?: number;
    UpdatedAt?: Date;
}
export interface UserCategoryMapInstance extends Instance<UserCategoryMapAttributes> {
    dataValues: UserCategoryMapAttributes;
    // Expose common methods if needed
    getDataValue(key: keyof UserCategoryMapAttributes): any;
    setDataValue(key: keyof UserCategoryMapAttributes, value: any): void;
}
