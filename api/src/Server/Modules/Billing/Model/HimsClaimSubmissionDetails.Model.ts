import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ClaimSubmissionDetailsInstance, i.ClaimSubmissionDetailsAttributes> {
    let ClaimSubmissionDetails = sequelize.define<i.ClaimSubmissionDetailsInstance, i.ClaimSubmissionDetailsAttributes>(
        'ClaimSubmissionDetails', {
            Id: { type: DataTypes.BIGINT, field: 'ClaimSubmissionDetailId', primaryKey: true, autoIncrement: true },
            ClaimSubmissionId: { type: DataTypes.BIGINT, field: 'ClaimSubmissionId' },
            GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            PatientBillId: { type: DataTypes.BIGINT, field: 'PatientBillId' },
            IsClaimCoveringLetter: { type: DataTypes.BOOLEAN, field: 'IsClaimCoveringLetter' },
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        },
        {
            indexes: [],
            timestamps: true,
            tableName: 'claimsubmissiondetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (ClaimSubmissionDetails as any).associate = function (models: Models) {
        ClaimSubmissionDetails.belongsTo(models.ClaimSubmission, { foreignKey: 'ClaimSubmissionId' });
        ClaimSubmissionDetails.belongsTo(models.Guarantor, { foreignKey: 'GuarantorId' });
        ClaimSubmissionDetails.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        ClaimSubmissionDetails.belongsTo(models.Encounter, { foreignKey: 'PatientId' });
        ClaimSubmissionDetails.belongsTo(models.PatientGuarantor, { foreignKey: 'PatientId' });
        ClaimSubmissionDetails.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        ClaimSubmissionDetails.belongsTo(models.PatientBills, { foreignKey: 'PatientBillId' });
    };
    return ClaimSubmissionDetails;
}
