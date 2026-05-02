import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientFeedbackDetailsInstance, i.PatientFeedbackDetailsAttributes> {
    let PatientFeedbackDetails = sequelize.define<i.PatientFeedbackDetailsInstance, i.PatientFeedbackDetailsAttributes>(
        'PatientFeedbackDetails', {
            Id: { type: DataTypes.BIGINT, field: 'PatientFeedbackDetailsId', primaryKey: true, autoIncrement: true },
            PatientFeedbackId: { type: DataTypes.BIGINT, field: 'PatientFeedbackId' },
            FeedbackMasterId: { type: DataTypes.BIGINT, field: 'FeedbackMasterId' },
            FeedbackTypeId: { type: DataTypes.BIGINT, field: 'FeedbackTypeId' },
            FeedbackCategoryId: { type: DataTypes.BIGINT, field: 'FeedbackCategoryId' },
            Description: { type: DataTypes.STRING, field: 'Description' },
            RatingId: { type: DataTypes.BIGINT, field: 'RatingId' },
            PatientFeedbackStatusId: { type: DataTypes.BIGINT, field: 'PatientFeedBackStatusId' },
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
            tableName: 'patientfeedbackdetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientFeedbackDetails as any).associate = function (models: Models) {
        PatientFeedbackDetails.belongsTo(models.FeedbacksMaster, { foreignKey: 'FeedbackMasterId' });
        PatientFeedbackDetails.belongsTo(models.ReferenceValue, { as: 'FeedbackCategory', targetKey: 'ReferenceValueCodeId' });
        PatientFeedbackDetails.belongsTo(models.ReferenceValue, { as: 'Rating', targetKey: 'ReferenceValueCodeId' });
    };
    return PatientFeedbackDetails;
}
