import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientAdmissionRequestLogInstance, i.PatientAdmissionRequestLogAttributes> {
    let PatientAdmissionRequestLog = sequelize.define<i.PatientAdmissionRequestLogInstance,
    i.PatientAdmissionRequestLogAttributes>('PatientAdmissionRequestLog', {
        Id: { type: DataTypes.BIGINT, field: 'PatientAdmissionRequestLogId', primaryKey: true, autoIncrement: true },
        PatientAdmissionRequestId: { type: DataTypes.BIGINT, field: 'PatientAdmissionRequestId' },
        AdmissionRequestStatusId: { type: DataTypes.BIGINT, field: 'AdmissionRequestStatusId' },
        Reason: { type: DataTypes.STRING, field: 'Reason' },
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
            tableName: 'patientadmissionrequestLog',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (PatientAdmissionRequestLog as any).associate = function(models: Models) {
                    PatientAdmissionRequestLog.belongsTo(models.Patient);
                };
 return PatientAdmissionRequestLog;
}
