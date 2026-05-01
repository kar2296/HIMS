import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.StatisticsInstance, i.StatisticsAttributes> {
    let Statistics = sequelize.define<i.StatisticsInstance, i.StatisticsAttributes>('Statistics', {
        Id: { type: DataTypes.BIGINT, field: 'StatisticsId', primaryKey: true, autoIncrement: true },
        DocumentDate: { type: DataTypes.DATE, field: 'DocumentDate' },
        DocumentTypeId: { type: DataTypes.STRING, field: 'DocumentTypeId' },
        Attachments: { type: DataTypes.STRING, field: 'Attachments' },
        ReleaseToPatientId: { type: DataTypes.BIGINT, field: 'ReleaseToPatientId' },
        FilePath: { type: DataTypes.STRING, field: 'FilePath' },
        Name: { type: DataTypes.STRING, field: 'Name' },
        AssetId: { type: DataTypes.BIGINT, field: 'AssetId' },
        AssetName: { type: DataTypes.STRING, field: 'AssetName' },
        Department: { type: DataTypes.STRING, field: 'Department' },
        Comments: { type: DataTypes.TEXT, field: 'Comments' },
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
            tableName: 'statistics',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (Statistics as any).associate = function(models: any) {
        Statistics.belongsTo(models.ReferenceValue,
            { foreignKey: 'ReleaseToPatientId', as: 'YesNo', targetKey: 'ReferenceValueCodeId' });
        Statistics.belongsTo(models.ReferenceValue, { as: 'DocumentType', targetKey: 'ReferenceValueCodeId' });

    };
    return Statistics as SequelizeStatic.Model<i.StatisticsInstance, i.StatisticsAttributes>;
}
