import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AnalyzerTestInstance, i.AnalyzerTestAttributes> {
    let AnalyzerTest = sequelize.define<i.AnalyzerTestInstance, i.AnalyzerTestAttributes>('AnalyzerTest', {
        Id: { type: DataTypes.BIGINT, field: 'AnalyzerTestMasterId', primaryKey: true, autoIncrement: true },
        AssetId: { type: DataTypes.BIGINT, field: 'AssetId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        AssetName: { type: DataTypes.STRING, field: 'AssetName' },
        Name: { type: DataTypes.STRING, field: 'Name' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        AssetTypeId: { type: DataTypes.STRING, field: 'AssetTypeId' },
        Barcode: { type: DataTypes.STRING, field: 'Barcode' },
        DisplayNo: { type: DataTypes.INTEGER, field: 'DisplayNo' },
        EquipmentName: { type: DataTypes.STRING, field: 'EquipmentName' },
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
            tableName: 'analyzertestmaster',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (AnalyzerTest as any).associate = function (models: Models) {
        AnalyzerTest.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        AnalyzerTest.belongsTo(models.ReferenceValue, { as: 'AssetType', targetKey: 'ReferenceValueCodeId' });
    };
    return AnalyzerTest;
}
