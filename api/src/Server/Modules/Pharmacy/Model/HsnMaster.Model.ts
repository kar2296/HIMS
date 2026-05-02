import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.HsnMasterInstance, i.HsnMasterAttributes> {
    let HsnMaster = sequelize.define<i.HsnMasterInstance, i.HsnMasterAttributes>('HsnMaster', {
        Id: { type: DataTypes.BIGINT, field: 'HSNId', primaryKey: true, autoIncrement: true },
        HSNCode: { type: DataTypes.STRING, field: 'HSNCode' },
        HSNName: { type: DataTypes.STRING, field: 'HSNName' },
        HSNCompany: { type: DataTypes.STRING, field: 'HSNCompany' },
        GstId: { type: DataTypes.BIGINT, field: 'GstId' },
        GstCode: { type: DataTypes.STRING, field: 'GstCode' },
        GstPercentage: { type: DataTypes.DECIMAL, field: 'GstPercentage' },
        InGstId: { type: DataTypes.BIGINT, field: 'InGstId' },
        InGstCode: { type: DataTypes.STRING, field: 'InGstCode' },
        InGstPercentage: { type: DataTypes.DECIMAL, field: 'InGstPercentage' },
        CGstId: { type: DataTypes.BIGINT, field: 'CGstId' },
        CGstCode: { type: DataTypes.STRING, field: 'CGstCode' },
        CGstPercentage: { type: DataTypes.DECIMAL, field: 'CGstPercentage' },
        SGstId: { type: DataTypes.BIGINT, field: 'SGstId' },
        SGstCode: { type: DataTypes.STRING, field: 'SGstCode' },
        SGstPercentage: { type: DataTypes.DECIMAL, field: 'SGstPercentage' },
        Remarks: { type: DataTypes.STRING, field: 'Remarks' },
        ActiveStatusId: { type: DataTypes.BOOLEAN, field: 'ActiveStatusId' },
        Status: { type: DataTypes.STRING, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'hsnmaster',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (HsnMaster as any).associate = function(models: Models) {
                    HsnMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return HsnMaster;
}
