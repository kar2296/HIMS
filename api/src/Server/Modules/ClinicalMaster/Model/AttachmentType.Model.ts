import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AttachmentTypeInstance, i.AttachmentTypeAttributes> {
    let AttachmentType = sequelize.define<i.AttachmentTypeInstance, i.AttachmentTypeAttributes>('AttachmentType', {
       Id: { type: DataTypes.BIGINT, field: 'AttachmentTypeId', primaryKey: true, autoIncrement: true  },
       Name: { type: DataTypes.STRING, field: 'Name' },
       Description: { type: DataTypes.STRING, field: 'Description' },
       DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
       ReferrenceLink: { type: DataTypes.STRING, field: 'ReferrenceLink' },
       IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
       ActiveStatusId : { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
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
            tableName: 'attachmenttypes',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (AttachmentType as any).associate = function(models: Models) {
                    AttachmentType.belongsTo(models.Department);
                    AttachmentType.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return AttachmentType;
}
