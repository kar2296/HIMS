import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientChiefComplaintInstance, i.PatientChiefComplaintAttributes> {
    let PatientChiefComplaint = sequelize.define<i.PatientChiefComplaintInstance,
        i.PatientChiefComplaintAttributes>('PatientChiefComplaint', {
            Id: { type: DataTypes.BIGINT, field: 'PatientChiefComplaintId', primaryKey: true, autoIncrement: true },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            ChiefComplaintId: { type: DataTypes.BIGINT, field: 'ChiefComplaintId' },
            ChiefComplaint: { type: DataTypes.STRING, field: 'ChiefComplaint' },
            ChiefComplaintCategoryId: { type: DataTypes.BIGINT, field: 'ChiefComplaintCategoryId' },
            Description: { type: DataTypes.STRING, field: 'Description' },
            StartDate: { type: DataTypes.DATE, field: 'StartDate' },
            EndDate: { type: DataTypes.DATE, field: 'EndDate' },
            Comments: { type: DataTypes.STRING, field: 'Comments' },
            PerformedDate: { type: DataTypes.DATE, field: 'PerformedDate' },
            PerformedBy: { type: DataTypes.BIGINT, field: 'PerformedBy' },
            PatientChiefComplaintStatusId: { type: DataTypes.BIGINT, field: 'PatientChiefComplaintStatusId' },
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
            tableName: 'patientchiefcomplaints',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (PatientChiefComplaint as any).associate = function(models: Models) {
                    PatientChiefComplaint.belongsTo(models.ReferenceValue,
                        { as: 'PatientChiefComplaintStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return PatientChiefComplaint;
}
