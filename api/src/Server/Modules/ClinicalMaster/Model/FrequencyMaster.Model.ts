import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.FrequencyMasterInstance, i.FrequencyMasterAttributes> {
    let FrequencyMaster = sequelize.define<i.FrequencyMasterInstance, i.FrequencyMasterAttributes>('FrequencyMaster', {
       Id: { type: DataTypes.BIGINT, field: 'FrequencyId', primaryKey: true, autoIncrement: true  },
       FrequencyTypeId: { type: DataTypes.BIGINT, field: 'FrequencyTypeId' },
       Code: { type: DataTypes.STRING, field: 'Code' },
       Name: { type: DataTypes.STRING, field: 'Name' },
       Description: { type: DataTypes.STRING, field: 'Description' },
       NoOfTimes: { type: DataTypes.INTEGER, field: 'NoOfTimes' },
       FrequencySIGCodeId: { type: DataTypes.BIGINT, field: 'FrequencySIGCodeId' },
       StartDuration: { type: DataTypes.STRING, field: 'StartDuration' },
       FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
       IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
       ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
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
            tableName: 'frequencymasters',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (FrequencyMaster as any).associate = function(models: Models) {
                    FrequencyMaster.belongsTo(models.Facility);
                    FrequencyMaster.belongsTo(models.ReferenceValue, { as: 'FrequencyType', targetKey: 'ReferenceValueCodeId' });
                    FrequencyMaster.belongsTo(models.ReferenceValue, { as: 'FrequencySIGCode', targetKey: 'ReferenceValueCodeId' });
                    FrequencyMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return FrequencyMaster;
}
