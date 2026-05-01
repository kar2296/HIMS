import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.UomConversionInstance, i.UomConversionAttributes> {
    let UomConversion = sequelize.define<i.UomConversionInstance, i.UomConversionAttributes>('UomConversion', {
        Id: { type: DataTypes.BIGINT, field: 'UomConversionId', primaryKey: true, autoIncrement: true },
        ItemMasterId: { type: DataTypes.BIGINT, field: 'ItemMasterId' },
        UomTypeId: { type: DataTypes.BIGINT, field: 'UomTypeId' },
        UomTypeCode: { type: DataTypes.STRING, field: 'UomTypeCode' },
        UomTypeName: { type: DataTypes.STRING, field: 'UomTypeName' },
        UomId: { type: DataTypes.BIGINT, field: 'UomId' },
        UomCode: { type: DataTypes.STRING, field: 'UomCode' },
        UomName: { type: DataTypes.STRING, field: 'UomName' },
        ConversionQuantity: { type: DataTypes.INTEGER, field: 'ConversionQuantity' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        DisplayOrder: { type: DataTypes.INTEGER, field: 'DisplayOrder' },
        StatusId: { type: DataTypes.BOOLEAN, field: 'StatusId' },
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
            tableName: 'uomconversions',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

        (UomConversion as any).associate = function(models: Models) {
            UomConversion.belongsTo(models.UomMaster, { as: 'UomMaster', foreignKey: 'UomId' });
        };


    return UomConversion;
}
