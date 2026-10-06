import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ABGParametersInstance, i.ABGParametersAttributes> {
    let ABGParameters = sequelize.define<i.ABGParametersInstance, i.ABGParametersAttributes>('ABGParameters', {
        Id: { type: DataTypes.BIGINT, field: 'ABGParameterId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        ABGParameters: { type: DataTypes.STRING, field: 'ABGParameters' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        Mnemonic: { type: DataTypes.STRING, field: 'Mnemonic' },
        LoincCode: { type: DataTypes.STRING, field: 'LoincCode' },
        ParameterTypeId: { type: DataTypes.BIGINT, field: 'ParameterTypeId' },
        ItemServiceId: { type: DataTypes.BIGINT, field: 'ItemServiceId' },
        NormalFrom: { type: DataTypes.STRING, field: 'NormalFrom' },
        NormalTo: { type: DataTypes.STRING, field: 'NormalTo' },
        LowFrom: { type: DataTypes.STRING, field: 'LowFrom' },
        LowTo: { type: DataTypes.STRING, field: 'LowTo' },
        HighFrom: { type: DataTypes.STRING, field: 'HighFrom' },
        HighTo: { type: DataTypes.STRING, field: 'HighTo' },
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
            tableName: 'hims_abgparameters',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (ABGParameters as any).associate = function (models: Models) {
        ABGParameters.belongsTo(models.Facility);
        ABGParameters.belongsTo(models.ReferenceValue, { as: 'ParameterType', targetKey: 'ReferenceValueCodeId' });
        ABGParameters.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return ABGParameters;
}
