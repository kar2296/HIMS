import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.UserDefaultServiceInstance, i.UserDefaultServiceAttributes> {
    let UserDefaultService = sequelize.define<i.UserDefaultServiceInstance, i.UserDefaultServiceAttributes>(
        'UserDefaultService', {
        Id: { type: DataTypes.BIGINT, field: 'UserDefaultServiceId', primaryKey: true, autoIncrement: true },
        UserId: { type: DataTypes.BIGINT, field: 'UserId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        ServiceItemId: { type: DataTypes.BIGINT, field: 'ServiceItemId' },
        Quantity: { type: DataTypes.INTEGER, field: 'Quantity' },
        PatientTypeId: { type: DataTypes.BIGINT, field: 'PatientTypeId' },
        VisitTypeId: { type: DataTypes.BIGINT, field: 'VisitTypeId' },
        GuarantorTypeId: { type: DataTypes.BIGINT, field: 'GuarantorTypeId' },
        GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
        DiscountModeId: { type: DataTypes.BIGINT, field: 'DiscountModeId' },
        Discount: { type: DataTypes.DECIMAL, field: 'Discount' },
        Rate: { type: DataTypes.DECIMAL, field: 'Rate' },
        EligibleDaysFrom: { type: DataTypes.INTEGER, field: 'EligibleDaysFrom' },
        EligibleDays: { type: DataTypes.INTEGER, field: 'EligibleDays' },
        NooFVisitFree: { type: DataTypes.INTEGER, field: 'NooFVisitFree' },
        StatusId: { type: DataTypes.BOOLEAN, field: 'StatusId' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.BIGINT, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.BIGINT, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'userdefaultservices',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (UserDefaultService as any).associate = function (models: Models) {
        UserDefaultService.belongsTo(models.ServiceItem, { foreignKey: 'ServiceItemId' });
    };
    return UserDefaultService;
}
