import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ClaimSubmissionInstance, i.ClaimSubmissionAttributes> {
    let ClaimSubmission = sequelize.define<i.ClaimSubmissionInstance, i.ClaimSubmissionAttributes>('ClaimSubmission', {
        Id: { type: DataTypes.BIGINT, field: 'ClaimSubmissionId', primaryKey: true, autoIncrement: true },
        ClaimNumber: { type: DataTypes.STRING, field: 'ClaimNumber' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
        GuarantorTypeId: { type: DataTypes.BIGINT, field: 'GuarantorTypeId' },
        ClaimSubmissionStatusId: { type: DataTypes.BIGINT, field: 'ClaimSubmissionStatusId' },
        SubmittedOn: { type: DataTypes.DATE, field: 'SubmittedOn' },
        DispatchedOn: { type: DataTypes.DATE, field: 'DispatchedOn' },
        TrackingNumber: { type: DataTypes.STRING, field: 'TrackingNumber' },
        DispatchedById: { type: DataTypes.BIGINT, field: 'DispatchedById' },
        SubmittedById: { type: DataTypes.BIGINT, field: 'SubmittedById' },
        ClaimAmount: { type: DataTypes.BIGINT, field: 'ClaimAmount' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        CNAmount: { type: DataTypes.BIGINT, field: 'CNAmount' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        IsClaimCoveringLetter: { type: DataTypes.BOOLEAN, field: 'IsClaimCoveringLetter' },
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
            tableName: 'claimsubmission',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (ClaimSubmission as any).associate = function (models: Models) {
        ClaimSubmission.hasMany(models.ClaimSubmissionDetails, { foreignKey: 'ClaimSubmissionId' });
        ClaimSubmission.belongsTo(models.Guarantor, { foreignKey: 'GuarantorId' });
        ClaimSubmission.belongsTo(models.User, { foreignKey: 'CreatedBy', as: 'CreatedUser' });
        ClaimSubmission.belongsTo(models.User, { foreignKey: 'DispatchedById', as: 'DispatchedUser' });
        ClaimSubmission.belongsTo(models.User, { foreignKey: 'SubmittedById', as: 'SubmittedUser' });
        ClaimSubmission.belongsTo(models.CityMaster, { foreignKey: 'GuarantorId' });
        ClaimSubmission.belongsTo(models.CountryMaster, { foreignKey: 'GuarantorId' });
        ClaimSubmission.belongsTo(models.DistrictMaster, { foreignKey: 'GuarantorId' });
        ClaimSubmission.belongsTo(models.StateMaster, { foreignKey: 'GuarantorId' });
        ClaimSubmission.belongsTo(models.ReferenceValue, { as: 'ClaimSubmissionStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return ClaimSubmission;
}
