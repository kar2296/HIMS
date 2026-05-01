import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.FeedbacksMasterInstance, i.FeedbacksMasterAttributes> {
    let FeedbacksMaster = sequelize.define<i.FeedbacksMasterInstance, i.FeedbacksMasterAttributes>('FeedbacksMaster', {
        Id: { type: DataTypes.BIGINT, field: 'FeedbacksMasterId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        FeedbackTypeId: { type: DataTypes.BIGINT, field: 'FeedbackTypeId' },
        FeedbackCategoryId: { type: DataTypes.BIGINT, field: 'FeedbackCategoryId' },
        Feedbacks: { type: DataTypes.STRING, field: 'Feedbacks' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
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
            tableName: 'feedbacksmaster',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (FeedbacksMaster as any).associate = function(models: Models) {
                    FeedbacksMaster.belongsTo(models.Facility);
                    FeedbacksMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                    FeedbacksMaster.belongsTo(models.ReferenceValue, { as: 'FeedbackCategory', targetKey: 'ReferenceValueCodeId' });
                    FeedbacksMaster.belongsTo(models.ReferenceValue, { as: 'FeedbackType', targetKey: 'ReferenceValueCodeId' });
                };
 return FeedbacksMaster;
}
