import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.VitalMasterInstance, i.VitalMasterAttributes> {
    let VitalMaster = sequelize.define<i.VitalMasterInstance, i.VitalMasterAttributes>('VitalMaster', {
        Id: { type: DataTypes.BIGINT, field: 'VitalId', primaryKey: true, autoIncrement: true },
        VitalName: { type: DataTypes.STRING, field: 'VitalName' },
        UOM: { type: DataTypes.STRING, field: 'UOM' },
        GraphTypeId: { type: DataTypes.BIGINT, field: 'GraphTypeId' },
        VitalValueTypeId: { type: DataTypes.BIGINT, field: 'VitalValueTypeId' },
        LoincCode: { type: DataTypes.STRING, field: 'LoincCode' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        ReferrenceLink: { type: DataTypes.STRING, field: 'ReferrenceLink' },
        ValueFormat: { type: DataTypes.STRING, field: 'ValueFormat' },
        ReferenceRangeFrom: { type: DataTypes.STRING, field: 'ReferenceRangeFrom' },
        ReferenceRangeTo: { type: DataTypes.STRING, field: 'ReferenceRangeTo' },
        Mnemonic: { type: DataTypes.STRING, field: 'Mnemonic' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        DisplayOrder: { type: DataTypes.INTEGER, field: 'DisplayOrder' },
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
            tableName: 'vitalmasters',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (VitalMaster as any).associate = function (models: Models) {
        VitalMaster.belongsTo(models.ReferenceValue, { as: 'GraphType', targetKey: 'ReferenceValueCodeId' });
        VitalMaster.belongsTo(models.ReferenceValue, { as: 'VitalValueType', targetKey: 'ReferenceValueCodeId' });
        VitalMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return VitalMaster;
}
