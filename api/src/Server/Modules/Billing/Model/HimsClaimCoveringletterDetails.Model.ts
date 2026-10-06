import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ClaimCoveringletterDetailsInstance, i.ClaimCoveringletterDetailsAttributes> {
    let ClaimCoveringletterDetails = sequelize.define<i.ClaimCoveringletterDetailsInstance, i.ClaimCoveringletterDetailsAttributes>(
        'ClaimCoveringletterDetails', {
            Id: { type: DataTypes.BIGINT, field: 'ClaimCoveringletterDetailId', primaryKey: true, autoIncrement: true },
            ClaimCoveringletterId: { type: DataTypes.BIGINT, field: 'ClaimCoveringletterId' },
            GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
            GuarantorChecklistId: { type: DataTypes.BIGINT, field: 'GuarantorChecklistId' },
            Title: { type: DataTypes.STRING, field: 'Title' },
            ChecklistValue: { type: DataTypes.STRING, field: 'ChecklistValue' },
            IsClaimCoveringLetter: { type: DataTypes.BOOLEAN, field: 'IsClaimCoveringLetter' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            Description: { type: DataTypes.STRING, field: 'Description' },
            PatientBillId: { type: DataTypes.BIGINT, field: 'PatientBillId' },
            Date: { type: DataTypes.DATE, field: 'Date' },
            Comments: { type: DataTypes.STRING, field: 'Comments' },
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
            tableName: 'hims_claimcoveringletterdetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (ClaimCoveringletterDetails as any).associate = function (models: Models) {
        ClaimCoveringletterDetails.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        ClaimCoveringletterDetails.belongsTo(models.ClaimCoveringletter, { foreignKey: 'ClaimCoveringletterId' });
        // ClaimCoveringletterDetails.belongsTo(models.PatientBills, { foreignKey: 'PatientBillId' });
    };
    return ClaimCoveringletterDetails;
}
