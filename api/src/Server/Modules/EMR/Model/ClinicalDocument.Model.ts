import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ClinicalDocumentInstance, i.ClinicalDocumentAttributes> {
    let ClinicalDocument = sequelize.define<i.ClinicalDocumentInstance, i.ClinicalDocumentAttributes>('ClinicalDocument', {
       Id: { type: DataTypes.BIGINT, field: 'ClinicalDocumentId', primaryKey: true, autoIncrement: true  },
       PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
       EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
       ConsultationId: { type: DataTypes.INTEGER, field: 'ConsultationId' },
       Name: { type: DataTypes.STRING, field: 'Name' },
       DocumentTypeId: { type: DataTypes.BIGINT, field: 'DocumentTypeId' },
       ReleaseToPatientId: { type: DataTypes.INTEGER, field: 'ReleaseToPatientId' },
       ReleaseToPatient: {
           type: DataTypes.VIRTUAL,
           get() {
               return this.getDataValue('ReleaseToPatientId');
           }
       },
       FilePath: { type: DataTypes.STRING, field: 'FilePath' },
       Comments: { type: DataTypes.STRING, field: 'Comments' },
       WorkOrderId: { type: DataTypes.BIGINT, field: 'WorkOrderId' },
       CreatedDate: { type: DataTypes.DATE, field: 'CreatedDate' },
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
            tableName: 'hims_clinicaldocuments',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (ClinicalDocument as any).associate = function(models: Models) {
                    ClinicalDocument.belongsTo(models.ReferenceValue, {
                        foreignKey: 'ReleaseToPatientId',
                        as: 'YesNo',
                        targetKey: 'ReferenceValueCodeId'
                    });
                    ClinicalDocument.belongsTo(models.ReferenceValue, {
                        as: 'DocumentType',
                        targetKey: 'ReferenceValueCodeId'
                    });
                    ClinicalDocument.belongsTo(models.User, {
                        as: 'CreatedUser',
                        foreignKey: 'CreatedBy'
                    });
                    ClinicalDocument.belongsTo(models.Encounter, {
                        as: 'Encounter',
                        foreignKey: 'EncounterId'
                    });

                };
 return ClinicalDocument;
}
