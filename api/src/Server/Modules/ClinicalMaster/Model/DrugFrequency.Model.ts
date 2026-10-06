import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.DrugFrequencyInstance, i.DrugFrequencyAttributes> {
    let DrugFrequency = sequelize.define<i.DrugFrequencyInstance, i.DrugFrequencyAttributes>('DrugFrequency', {
       Id: { type: DataTypes.BIGINT, field: 'DrugFrequencyId', primaryKey: true, autoIncrement: true  },
       DrugFrequencyTypeId: { type: DataTypes.BIGINT, field: 'DrugFrequencyTypeId' },
       Code: { type: DataTypes.STRING, field: 'Code' },
       Name: { type: DataTypes.STRING, field: 'Name' },
       Description: { type: DataTypes.STRING, field: 'Description' },
       NoOfTimes: { type: DataTypes.INTEGER, field: 'NoOfTimes' },
       DrugFrequencySIGCodeId: { type: DataTypes.BIGINT, field: 'DrugFrequencySIGCodeId' },
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
            tableName: 'drugfrequencies',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (DrugFrequency as any).associate = function(models: Models) {
                    DrugFrequency.belongsTo(models.Facility);
                    DrugFrequency.belongsTo(models.ReferenceValue, { as: 'DrugFrequencyType', targetKey: 'ReferenceValueCodeId' });
                    DrugFrequency.belongsTo(models.ReferenceValue, { as: 'DrugFrequencySIGCode', targetKey: 'ReferenceValueCodeId' });
                    DrugFrequency.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return DrugFrequency;
}
