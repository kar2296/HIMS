import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AssetDocumentInstance, i.AssetDocumentAttributes> {
    let AssetDocument = sequelize.define<i.AssetDocumentInstance, i.AssetDocumentAttributes>('AssetDocument', {
        Id: { type: DataTypes.BIGINT, field: 'AssetDocumentId', primaryKey: true, autoIncrement: true },
        DocumentDate: { type: DataTypes.DATE, field: 'DocumentDate' },
        DocumentTypeId: { type: DataTypes.STRING, field: 'DocumentTypeId' },
        Attachments: { type: DataTypes.STRING, field: 'Attachments' },
        ReleaseToPatientId: { type: DataTypes.BIGINT, field: 'ReleaseToPatientId' },
        FilePath: { type: DataTypes.STRING, field: 'FilePath' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        Name: { type: DataTypes.STRING, field: 'Name' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        AssetId: { type: DataTypes.BIGINT, field: 'AssetId' },
        AssetName: { type: DataTypes.STRING, field: 'AssetName' },
        Department: { type: DataTypes.STRING, field: 'Department' },
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
            tableName: 'hims_assetdocuments',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (AssetDocument as any).associate = function (models: Models) {
        AssetDocument.belongsTo(models.ReferenceValue,
            { foreignKey: 'ReleaseToPatientId', as: 'YesNo', targetKey: 'ReferenceValueCodeId' });
        AssetDocument.belongsTo(models.ReferenceValue, { as: 'DocumentType', targetKey: 'ReferenceValueCodeId' });

    };
    return AssetDocument;
}
