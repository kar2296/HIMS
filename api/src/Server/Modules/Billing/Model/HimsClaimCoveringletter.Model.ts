import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ClaimCoveringletterInstance, i.ClaimCoveringletterAttributes> {
    let ClaimCoveringletter = sequelize.define<i.ClaimCoveringletterInstance, i.ClaimCoveringletterAttributes>('ClaimCoveringletter', {
        Id: { type: DataTypes.BIGINT, field: 'ClaimCoveringletterId', primaryKey: true, autoIncrement: true },
        GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
        GuarantorTypeId: { type: DataTypes.BIGINT, field: 'GuarantorTypeId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        ClaimSubmissionId: { type: DataTypes.BIGINT, field: 'ClaimSubmissionId' },
        ClaimSubmissionDetailId: { type: DataTypes.BIGINT, field: 'ClaimSubmissionDetailId' },
        ClaimSubmissionStatusId: { type: DataTypes.BIGINT, field: 'ClaimSubmissionStatusId' },
        IsClaimCoveringLetter: { type: DataTypes.BOOLEAN, field: 'IsClaimCoveringLetter' },
        SubmittedOn: { type: DataTypes.DATE, field: 'SubmittedOn' },
        submittedById: { type: DataTypes.BIGINT, field: 'SubmittedById' },
        ClaimNumber: { type: DataTypes.STRING, field: 'ClaimNumber' },
        ClaimCoveringletterStatusId: { type: DataTypes.BIGINT, field: 'ClaimCoveringletterStatusId' },
        TrackingNumber: { type: DataTypes.STRING, field: 'TrackingNumber' },
        ClaimAmount: { type: DataTypes.DECIMAL(18, 2), field: 'ClaimAmount' },
        CNAmount: { type: DataTypes.DECIMAL(18, 2), field: 'CNAmount' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        DispatchedById: { type: DataTypes.BIGINT, field: 'DispatchedById' },
        DispatchedOn: { type: DataTypes.DATE, field: 'DispatchedOn' },
        LetterDate: { type: DataTypes.DATE, field: 'LetterDate' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
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
            tableName: 'hims_claimcoveringletter',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (ClaimCoveringletter as any).associate = function (models: Models) {
        ClaimCoveringletter.belongsTo(models.Guarantor, { foreignKey: 'GuarantorId' });
        ClaimCoveringletter.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        ClaimCoveringletter.belongsTo(models.Patient);
        ClaimCoveringletter.belongsTo(models.ClaimSubmission);
        ClaimCoveringletter.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        // ClaimCoveringletter.belongsTo(models.User, { as: 'DispatchedUser', foreignKey: 'DispatchedById' });
        ClaimCoveringletter.belongsTo(models.User, { as: 'SubmittedUser', foreignKey: 'ClaimSubmissionId' });
        ClaimCoveringletter.belongsTo(models.ReferenceValue, { as: 'ClaimSubmissionStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return ClaimCoveringletter;
}
