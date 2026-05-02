import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.OtDocumentInstance, i.OtDocumentAttributes> {
    let OtDocument = sequelize.define<i.OtDocumentInstance, i.OtDocumentAttributes>('OtDocument', {
        Id: { type: DataTypes.BIGINT, field: 'OtDocumentId', primaryKey: true, autoIncrement: true },
        OTRegisterId: { type: DataTypes.BIGINT, field: 'OTRegisterId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        Name: { type: DataTypes.STRING, field: 'Name' },
        DocumentTypeId: { type: DataTypes.BIGINT, field: 'DocumentTypeId' },
        ReleaseToPatientId: { type: DataTypes.BIGINT, field: 'ReleaseToPatientId' },
        FilePath: { type: DataTypes.STRING, field: 'FilePath' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        DocumentDate: { type: DataTypes.DATE, field: 'DocumentDate' },
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
            tableName: 'otdocuments',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (OtDocument as any).associate = function(models: Models) {
                    OtDocument.belongsTo(models.Patient);
                    OtDocument.belongsTo(models.ReferenceValue,
                        { foreignKey: 'ReleaseToPatientId', as: 'YesNo', targetKey: 'ReferenceValueCodeId' });
                    OtDocument.belongsTo(models.ReferenceValue, { as: 'DocumentType', targetKey: 'ReferenceValueCodeId' });
                };
 return OtDocument;
}
