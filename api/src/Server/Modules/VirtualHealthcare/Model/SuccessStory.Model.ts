import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.SuccessStoryInstance, i.SuccessStoryAttributes> {
    let SuccessStory = sequelize.define<i.SuccessStoryInstance,
        i.SuccessStoryAttributes>('SuccessStory', {
            Id: { type: DataTypes.BIGINT, field: 'SuccessStoryId', primaryKey: true, autoIncrement: true },
            OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            CategoryId: { type: DataTypes.BIGINT, field: 'CategoryId' },
            Title: { type: DataTypes.STRING, field: 'Title' },
            Attachment: { type: DataTypes.STRING, field: 'Attachment' },
            SuccessStory: { type: DataTypes.STRING, field: 'SuccessStory' },
            SuccessStoryDate: { type: DataTypes.DATE, field: 'SuccessStoryDate' },
            Content: { type: DataTypes.STRING, field: 'Content' },
            IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
            ActiveStatusId: { type: DataTypes.BIGINT, field: 'ActiveStatusId' },
            CreatedId: { type: DataTypes.INTEGER, field: 'CreatedId' },
            CreatedDate: { type: DataTypes.DATE, field: 'CreatedDate' },
            UpdatedId: { type: DataTypes.INTEGER, field: 'UpdatedId' },
            UpdatedDate: { type: DataTypes.DATE, field: 'UpdatedDate' },
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
                tableName: 'hims_successstory',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (SuccessStory as any).associate = function (models: Models) {
        SuccessStory.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        SuccessStory.belongsTo(models.ReferenceValue, {
            as: 'SuccessCategory', targetKey: 'ReferenceValueCodeId',
            foreignKey: 'CategoryId'
        });
        SuccessStory.belongsTo(models.ReferenceValue, {
            as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId',
            foreignKey: 'ActiveStatusId'
        });
        SuccessStory.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        SuccessStory.belongsTo(models.User, { as: 'UpdatedUser', foreignKey: 'UpdatedBy' });
    };
    return SuccessStory;
}
