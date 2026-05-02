import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PreOperativeChecklistDetailsInstance, i.PreOperativeChecklistDetailsAttributes> {
    let PreOperativeChecklistDetails = sequelize.define<i.PreOperativeChecklistDetailsInstance, i.PreOperativeChecklistDetailsAttributes>(
        'PreOperativeChecklistDetails', {
            Id: { type: DataTypes.BIGINT, field: 'PreOperativeChecklistDetailsId', primaryKey: true, autoIncrement: true },
            PreOperativeChecklistId: { type: DataTypes.BIGINT, field: 'PreOperativeChecklistId' },
            CheckListMasterId: { type: DataTypes.BIGINT, field: 'CheckListMasterId' },
            CheckListTypeId: { type: DataTypes.BIGINT, field: 'CheckListTypeId' },
            CheckListCategoryId: { type: DataTypes.BIGINT, field: 'CheckListCategoryId' },
            Description: { type: DataTypes.STRING, field: 'Description' },
            RatingId: { type: DataTypes.BIGINT, field: 'RatingId' },
            PreOperativeChecklistStatusId: { type: DataTypes.BIGINT, field: 'PreOperativeChecklistStatusId' },
            FeedbackMasterId: { type: DataTypes.BIGINT, field: 'FeedbackMasterId' },
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
            tableName: 'preoperativechecklistdetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PreOperativeChecklistDetails as any).associate = function (models: Models) {
        PreOperativeChecklistDetails.belongsTo(models.CheckList, { foreignKey: 'CheckListMasterId' });
        PreOperativeChecklistDetails.belongsTo(models.ReferenceValue,
            { as: 'CheckListCategory', targetKey: 'ReferenceValueCodeId' });
       PreOperativeChecklistDetails.belongsTo(models.FeedbacksMaster, { foreignKey: 'FeedbackMasterId' });
    };
    return PreOperativeChecklistDetails;
}
