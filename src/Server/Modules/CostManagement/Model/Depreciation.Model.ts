import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.DepreciationInstance, i.DepreciationAttributes> {
    let Depreciation = sequelize.define<i.DepreciationInstance, i.DepreciationAttributes>('Depreciation', {
        Id: { type: DataTypes.BIGINT, field: 'DepreciationId', primaryKey: true, autoIncrement: true },
        AssetId: { type: DataTypes.BIGINT, field: 'AssetId' },
        AssetTypeId: { type: DataTypes.BIGINT, field: 'AssetTypeId' },
        AssetName: { type: DataTypes.STRING, field: 'AssetName' },
        Department: { type: DataTypes.STRING, field: 'Department' },
        DocumentDate: { type: DataTypes.DATE, field: 'DocumentDate' },
        DocumentTypeId: { type: DataTypes.STRING, field: 'DocumentTypeId' },
        Attachments: { type: DataTypes.STRING, field: 'Attachments' },
        FilePath: { type: DataTypes.STRING, field: 'FilePath' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        Name: { type: DataTypes.STRING, field: 'Name' },
        Cost: { type: DataTypes.DECIMAL, field: 'Cost' },
        ReleaseToPatientId: { type: DataTypes.BIGINT, field: 'ReleaseToPatientId' },
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
            tableName: 'depreciations',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (Depreciation as any).associate = function(models: Models) {
                    Depreciation.belongsTo(models.ReferenceValue,
                        { foreignKey: 'ReleaseToPatientId', as: 'YesNo', targetKey: 'ReferenceValueCodeId' });
                    Depreciation.belongsTo(models.ReferenceValue, { as: 'DocumentType', targetKey: 'ReferenceValueCodeId' });

                };
 return Depreciation;
}
