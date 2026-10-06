import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientAllergyInstance, i.PatientAllergyAttributes> {
    let PatientAllergy = sequelize.define<i.PatientAllergyInstance, i.PatientAllergyAttributes>('PatientAllergy', {
       Id: { type: DataTypes.BIGINT, field: 'PatientAllergyId', primaryKey: true, autoIncrement: true  },
       EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
       ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
       PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
       AllergyId: { type: DataTypes.BIGINT, field: 'AllergyId' },
       AllergyName: { type: DataTypes.STRING, field: 'AllergyName' },
       AllergyTypeId: { type: DataTypes.BIGINT, field: 'AllergyTypeId' },
       Description: { type: DataTypes.STRING, field: 'Description' },
       Symptom: { type: DataTypes.STRING, field: 'Symptom' },
       ADRStatus: { type: DataTypes.STRING, field: 'ADRStatus' },
       ADRScoreId: { type: DataTypes.BIGINT, field: 'ADRScoreId' },
       StartDate: { type: DataTypes.DATE, field: 'StartDate' },
       EndDate: { type: DataTypes.DATE, field: 'EndDate' },
       AllergySeverityId: { type: DataTypes.BIGINT, field: 'AllergySeverityId' },
       AllergySource: { type: DataTypes.STRING, field: 'AllergySource' },
       Comments: { type: DataTypes.STRING, field: 'Comments' },
       PatientAllergyStatusId: { type: DataTypes.BIGINT, field: 'PatientAllergyStatusId' },
       PerformedDate: { type: DataTypes.DATE, field: 'PerformedDate' },
       PerformedBy: { type: DataTypes.BIGINT, field: 'PerformedBy' },
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
            tableName: 'patientallergies',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (PatientAllergy as any).associate = function(models: Models) {
                    PatientAllergy.belongsTo(models.ReferenceValue, { as: 'AllergyType', targetKey: 'ReferenceValueCodeId' });
                    PatientAllergy.belongsTo(models.ReferenceValue, { as: 'AllergySeverity', targetKey: 'ReferenceValueCodeId' });
                    PatientAllergy.belongsTo(models.ReferenceValue, { as: 'PatientAllergyStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return PatientAllergy;
}
