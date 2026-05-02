import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AnalyzerAnalyteMapInstance, i.AnalyzerAnalyteMapAttributes> {
    let AnalyzerAnalyteMap = sequelize.define<i.AnalyzerAnalyteMapInstance, i.AnalyzerAnalyteMapAttributes>('AnalyzerAnalyteMap', {
        Id: { type: DataTypes.BIGINT, field: 'AnalyzerAnalyteMapId', primaryKey: true, autoIncrement: true },
        AssetId: { type: DataTypes.BIGINT, field: 'AssetId' },
        AssetName: { type: DataTypes.STRING, field: 'AssetName' },
        AssetTypeId: { type: DataTypes.BIGINT, field: 'AssetTypeId' },
        AnalyzerTestMasterId: { type: DataTypes.BIGINT, field: 'AnalyzerTestMasterId' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        Name: { type: DataTypes.STRING, field: 'Name' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        SampleType: { type: DataTypes.STRING, field: 'SampleType' },
        AnalyteId: { type: DataTypes.BIGINT, field: 'AnalyteId' },
        AnalyteCode: { type: DataTypes.STRING, field: 'AnalyteCode' },
        AnalyteName: { type: DataTypes.STRING, field: 'AnalyteName' },
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
            tableName: 'analyzeranalytemap',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (AnalyzerAnalyteMap as any).associate = function (models: Models) {
        AnalyzerAnalyteMap.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        AnalyzerAnalyteMap.belongsTo(models.ReferenceValue, { as: 'AssetType', targetKey: 'ReferenceValueCodeId' });
        AnalyzerAnalyteMap.belongsTo(models.Analytemaster, { foreignKey: 'AnalyteId' });
    };
    return AnalyzerAnalyteMap;
}
