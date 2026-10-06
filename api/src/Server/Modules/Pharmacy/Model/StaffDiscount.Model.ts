import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.StaffDiscountInstance, i.StaffDiscountAttributes> {
    let StaffDiscount = sequelize.define<i.StaffDiscountInstance, i.StaffDiscountAttributes>('StaffDiscount', {
        Id: { type: DataTypes.BIGINT, field: 'StaffDiscountId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        StoreTypeId: { type: DataTypes.BIGINT, field: 'StoreTypeId' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        UserTypeId: { type: DataTypes.BIGINT, field: 'UserTypeId' },
        UserId: { type: DataTypes.BIGINT, field: 'UserId' },
        StaffDiscountTypeId: { type: DataTypes.BIGINT, field: 'StaffDiscountTypeId' },
        StaffDiscountPercentage: { type: DataTypes.DECIMAL, field: 'StaffDiscountPercentage' },
        ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
        ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'staffdiscounts',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (StaffDiscount as any).associate = function (models: Models) {
        StaffDiscount.belongsTo(models.Facility);
        StaffDiscount.belongsTo(models.ReferenceValue, { as: 'StoreType', targetKey: 'ReferenceValueCodeId' });
        StaffDiscount.belongsTo(models.StoreMaster, { foreignKey: 'StoreMasterId' });
        StaffDiscount.belongsTo(models.ReferenceValue, { as: 'UserType', targetKey: 'ReferenceValueCodeId' });
        StaffDiscount.belongsTo(models.User);
        StaffDiscount.belongsTo(models.User, { as: 'UserName', foreignKey: 'CreatedBy' });
        StaffDiscount.belongsTo(models.ReferenceValue, { as: 'StaffDiscountType', targetKey: 'ReferenceValueCodeId' });
        StaffDiscount.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return StaffDiscount;
}
