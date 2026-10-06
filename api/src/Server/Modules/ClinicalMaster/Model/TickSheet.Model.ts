import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.TickSheetInstance, i.TickSheetAttributes> {
    let TickSheet = sequelize.define<i.TickSheetInstance, i.TickSheetAttributes>('TickSheet', {
       Id: { type: DataTypes.BIGINT, field: 'TickSheetId', primaryKey: true, autoIncrement: true  },
       TickSheetTypeId: { type: DataTypes.BIGINT, field: 'TickSheetTypeId' },
       DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
       SubDepartmentId: { type: DataTypes.BIGINT, field: 'SubDepartmentId' },
       TickSheetName: { type: DataTypes.STRING, field: 'TickSheetName' },
       TickSheetMasterTypeId: { type: DataTypes.STRING, field: 'TickSheetMasterTypeId' },
       TickSheetMasterTypeName: { type: DataTypes.STRING, field: 'TickSheetMasterTypeName' },
       ItemId: { type: DataTypes.STRING, field: 'ItemId' },
       ItemName: { type: DataTypes.STRING, field: 'ItemName' },
       DisplayOrder: { type: DataTypes.BIGINT, field: 'DisplayOrder' },
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
            tableName: 'ticksheets',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (TickSheet as any).associate = function(models: Models) {
                    TickSheet.belongsTo(models.Department,  { as: 'ParentDepartment', foreignKey: 'DepartmentId' });
                    TickSheet.belongsTo(models.Department,  { as: 'SubDepartment', foreignKey: 'SubDepartmentId' });
                    TickSheet.belongsTo(models.ReferenceValue, { as: 'TickSheetType', targetKey: 'ReferenceValueCodeId' });
                    TickSheet.belongsTo(models.ReferenceValue, { as: 'TickSheetMasterType', targetKey: 'ReferenceValueCodeId' });
                    TickSheet.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return TickSheet;
}
