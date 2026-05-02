import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.SectionMasterInstance, i.SectionMasterAttributes> {
    let SectionMaster = sequelize.define<i.SectionMasterInstance, i.SectionMasterAttributes>('SectionMaster', {
       Id: { type: DataTypes.BIGINT, field: 'SectionId', primaryKey: true, autoIncrement: true  },
       ParentSectionId: { type: DataTypes.BIGINT, field: 'ParentSectionId' },
       SectionTypeId: { type: DataTypes.BIGINT, field: 'SectionTypeId' },
       SectionNoteTypeId: { type: DataTypes.STRING, field: 'SectionNoteTypeId' },
       Name: { type: DataTypes.STRING, field: 'Name' },
       Description: { type: DataTypes.STRING, field: 'Description' },
       SectionNoteTypeName: { type: DataTypes.STRING, field: 'SectionNoteTypeName' },
       SRef: { type: DataTypes.STRING, field: 'SRef' },
       DockPositionId: { type: DataTypes.BIGINT, field: 'DockPositionId' },
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
            tableName: 'hims_templatetabs',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (SectionMaster as any).associate = function(models: Models) {
                    SectionMaster.belongsTo(models.ReferenceValue, { as: 'DockPosition', targetKey: 'ReferenceValueCodeId' });
                    SectionMaster.belongsTo(models.ReferenceValue, { as: 'SectionType', targetKey: 'ReferenceValueCodeId' });
                    SectionMaster.belongsTo(models.ReferenceValue, { as: 'SectionNoteType', targetKey: 'ReferenceValueCodeId' });
                    SectionMaster.hasMany(models.SectionCategoryMap, { foreignKey: 'SectionId' });
                };
 return SectionMaster;
}
