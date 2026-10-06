import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ReferralChargeInstance, i.ReferralChargeAttributes> {
    let ReferralCharge = sequelize.define<i.ReferralChargeInstance, i.ReferralChargeAttributes>('ReferralCharge', {
        Id: { type: DataTypes.BIGINT, field: 'ReferralChargeId', primaryKey: true, autoIncrement: true },
        ReferralId: { type: DataTypes.BIGINT, field: 'ReferralId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        DiscountModeId: { type: DataTypes.BIGINT, field: 'DiscountModeId' },
        ReferralCharge: { type: DataTypes.STRING, field: 'ReferralCharge' },
        ServiceCategoryId: { type: DataTypes.BIGINT, field: 'ServiceCategoryId' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'referralcharge',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (ReferralCharge as any).associate = function(models: Models) {
                    ReferralCharge.belongsTo(models.Facility);
                    ReferralCharge.belongsTo(models.ServiceCategory);
                    ReferralCharge.belongsTo(models.ReferenceValue, { as: 'DiscountMode', targetKey: 'ReferenceValueCodeId' });

                };
 return ReferralCharge;
}
