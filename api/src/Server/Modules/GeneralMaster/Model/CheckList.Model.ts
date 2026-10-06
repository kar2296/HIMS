import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.CheckListInstance, i.CheckListAttributes> {
    let CheckList = sequelize.define<i.CheckListInstance, i.CheckListAttributes>('CheckList', {
        Id: { type: DataTypes.BIGINT, field: 'CheckListId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        CheckListTypeId: { type: DataTypes.BIGINT, field: 'CheckListTypeId' },
        CheckListCategoryId: { type: DataTypes.BIGINT, field: 'CheckListCategoryId' },
        CheckLists: { type: DataTypes.STRING, field: 'CheckLists' },
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
            tableName: 'checklist',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (CheckList as any).associate = function(models: Models) {
        CheckList.belongsTo(models.Facility);
        CheckList.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        CheckList.belongsTo(models.ReferenceValue, { as: 'CheckListCategory', targetKey: 'ReferenceValueCodeId' });
        CheckList.belongsTo(models.ReferenceValue, { as: 'CheckListType', targetKey: 'ReferenceValueCodeId' });
                };
 return CheckList;
}
