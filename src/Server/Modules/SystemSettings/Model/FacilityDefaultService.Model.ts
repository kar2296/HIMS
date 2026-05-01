import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.FacilityDefaultServiceInstance, i.FacilityDefaultServiceAttributes> {
    let FacilityDefaultService = sequelize.define<i.FacilityDefaultServiceInstance, i.FacilityDefaultServiceAttributes>(
        'FacilityDefaultService', {
       Id: { type: DataTypes.BIGINT, field: 'FacilityDefaultServiceId', primaryKey: true, autoIncrement: true },
       FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
       ServiceItemId: { type: DataTypes.BIGINT, field: 'ServiceItemId' },
       Quantity: { type: DataTypes.INTEGER, field: 'Quantity' },
       PatientTypeId: { type: DataTypes.BIGINT, field: 'PatientTypeId' },
       VisitTypeId: { type: DataTypes.BIGINT, field: 'VisitTypeId' },
       GuarantorTypeId: { type: DataTypes.BIGINT, field: 'GuarantorTypeId' },
       GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
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
            tableName: 'facilitydefaultservices',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (FacilityDefaultService as any).associate = function(models: Models) {
                    FacilityDefaultService.belongsTo(models.ServiceItem, { foreignKey: 'ServiceItemId' });
                };
 return FacilityDefaultService;
}
