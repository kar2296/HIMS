import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.UomMasterInstance, i.UomMasterAttributes> {
    let UomMaster = sequelize.define<i.UomMasterInstance, i.UomMasterAttributes>('UomMaster', {
        Id: { type: DataTypes.BIGINT, field: 'UomId', primaryKey: true, autoIncrement: true },
        UomCode: { type: DataTypes.STRING, field: 'UomCode' },
        UomName: { type: DataTypes.STRING, field: 'UomName' },
        UomDescription: { type: DataTypes.STRING, field: 'UomDescription' },
        UomTypeId: { type: DataTypes.BIGINT, field: 'UomTypeId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        IsAllFacility: { type: DataTypes.BOOLEAN, field: 'IsAllFacility' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        IsMultiUse: { type: DataTypes.BOOLEAN, field: 'IsMultiUse' },
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
            tableName: 'uommaster',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (UomMaster as any).associate = function (models: Models) {
        UomMaster.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        UomMaster.belongsTo(models.ReferenceValue, { as: 'UomType', targetKey: 'ReferenceValueCodeId' });
        UomMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return UomMaster;
}
