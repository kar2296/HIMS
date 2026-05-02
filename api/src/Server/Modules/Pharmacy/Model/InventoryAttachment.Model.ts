import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.InventoryAttachmentInstance, i.InventoryAttachmentAttributes> {
    let InventoryAttachment = sequelize.define<i.InventoryAttachmentInstance, i.InventoryAttachmentAttributes>('InventoryAttachment', {
        Id: { type: DataTypes.BIGINT, field: 'InventoryAttachmentId', primaryKey: true, autoIncrement: true },
        ItemId: { type: DataTypes.BIGINT, field: 'ItemId' },
        ScreenName: { type: DataTypes.STRING, field: 'ScreenName' },
        AttachmentName: { type: DataTypes.STRING, field: 'AttachmentName' },
        AttachmentTypeId: { type: DataTypes.BIGINT, field: 'AttachmentTypeId' },
        AttachmentType: { type: DataTypes.STRING, field: 'AttachmentType' },
        ObjectTypeId: { type: DataTypes.BIGINT, field: 'ObjectTypeId' },
        FilePath: { type: DataTypes.STRING, field: 'FilePath' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
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
            tableName: 'inventoryattachments',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });



    return InventoryAttachment;
}
