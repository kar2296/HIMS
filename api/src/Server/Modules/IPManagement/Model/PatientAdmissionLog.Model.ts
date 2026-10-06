import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientAdmissionLogInstance, i.PatientAdmissionLogAttributes> {
    let PatientAdmissionLog = sequelize.define<i.PatientAdmissionLogInstance, i.PatientAdmissionLogAttributes>('PatientAdmissionLog', {
        Id: { type: DataTypes.BIGINT, field: 'AdmissionLogId', primaryKey: true, autoIncrement: true },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        //        VisitIdentifier: { type: DataTypes.BIGINT, field: 'VisitIdentifier' },
        AdmissionStatusId: { type: DataTypes.BIGINT, field: 'AdmissionStatusId' },
         AdmittingReasonId: { type: DataTypes.STRING, field: 'AdmittingReasonId' },
        DoctorId: { type: DataTypes.STRING, field: 'DoctorId' },
              //Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'patientadmissionlog',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {}
            }
        });

     (PatientAdmissionLog as any).associate = function(models: Models) {
                    PatientAdmissionLog.belongsTo(models.ReferenceValue, { as: 'AdmissionStatus', targetKey: 'ReferenceValueCodeId' });
                    PatientAdmissionLog.belongsTo(models.User, { as: 'Created', foreignKey: 'CreatedBy' });
               PatientAdmissionLog.belongsTo(models.ReferenceValue, { as: 'AdmittingReason', targetKey: 'ReferenceValueCodeId' });
                  PatientAdmissionLog.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
                };
 return PatientAdmissionLog;
}
