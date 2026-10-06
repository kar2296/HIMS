import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.GstMasterInstance, i.GstMasterAttributes> {
    let GstMaster = sequelize.define<i.GstMasterInstance, i.GstMasterAttributes>('GstMaster', {
        Id: { type: DataTypes.BIGINT, field: 'GstId', primaryKey: true, autoIncrement: true },
        GstCode: { type: DataTypes.STRING, field: 'GstCode' },
        GstName: { type: DataTypes.STRING, field: 'GstName' },
        GstDescription: { type: DataTypes.STRING, field: 'GstDescription' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        IsAllFacility: { type: DataTypes.BOOLEAN, field: 'IsAllFacility' },
        GstPercentage: { type: DataTypes.DECIMAL, field: 'GstPercentage' },
        ParentGstId: { type: DataTypes.BIGINT, field: 'ParentGstId' },
        ChildGstId: { type: DataTypes.BIGINT, field: 'ChildGstId' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        IsParent: { type: DataTypes.BOOLEAN, field: 'IsParent' },
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
            tableName: 'gstmaster',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (GstMaster as any).associate = function (models: Models) {
        GstMaster.belongsTo(models.GstMaster, { as: 'ChildGst', foreignKey: 'ChildGstId' });
        GstMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return GstMaster;
}
