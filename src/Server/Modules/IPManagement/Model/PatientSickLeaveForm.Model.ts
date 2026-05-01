import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientSickLeaveFormInstance, i.PatientSickLeaveFormAttributes> {
    let PatientSickLeaveForm = sequelize.define<i.PatientSickLeaveFormInstance, i.PatientSickLeaveFormAttributes>('PatientSickLeaveForm', {
        Id: { type: DataTypes.BIGINT, field: 'PatientSickLeaveFormId', primaryKey: true, autoIncrement: true },
        FormTypeId: { type: DataTypes.BIGINT, field: 'FormTypeId' },
        LeaveDayTypeId: { type: DataTypes.BIGINT, field: 'LeaveDayTypeId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        LeaveFormNumber: { type: DataTypes.STRING, field: 'LeaveFormNumber' },
        Diagnosis: { type: DataTypes.STRING, field: 'Diagnosis' },
        ChiefComplaints: { type: DataTypes.STRING, field: 'ChiefComplaints' },
        IssueDate: { type: DataTypes.DATE, field: 'IssueDate' },
        ValidFrom: { type: DataTypes.DATE, field: 'ValidFrom' },
        ValidTo: { type: DataTypes.DATE, field: 'ValidTo' },
        DaysCount: { type: DataTypes.DECIMAL, field: 'DaysCount' },
        Notes: { type: DataTypes.STRING, field: 'Notes' },
        IsExecutedFromDuty: { type: DataTypes.BOOLEAN, field: 'IsExecutedFromDuty' },
        IsFitforlightduty: { type: DataTypes.BOOLEAN, field: 'IsFitforlightduty' },
        Isproofofattandanceatpractice: { type: DataTypes.BOOLEAN, field: 'Isproofofattandanceatpractice' },
        ActiveStatusId: { type: DataTypes.DECIMAL, field: 'ActiveStatusId' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' }
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'patientsickleaveform',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientSickLeaveForm as any).associate = function (models: Models) {
        PatientSickLeaveForm.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        PatientSickLeaveForm.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        PatientSickLeaveForm.belongsTo(models.User, {  as: 'Doctor', foreignKey: 'DoctorId' });
        PatientSickLeaveForm.belongsTo(models.User, {  as: 'CreatedUser', foreignKey: 'CreatedBy' });
        PatientSickLeaveForm.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return PatientSickLeaveForm;
}
