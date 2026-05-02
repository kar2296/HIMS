import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.SectionCategoryMapInstance, i.SectionCategoryMapAttributes> {
    let SectionCategoryMap = sequelize.define<i.SectionCategoryMapInstance, i.SectionCategoryMapAttributes>('SectionCategoryMap', {
        Id: { type: DataTypes.BIGINT, field: 'SectionCategoryMapId', primaryKey: true, autoIncrement: true  },
        SectionId: { type: DataTypes.BIGINT, field: 'SectionId', primaryKey: true },
        CategoryId: { type: DataTypes.BIGINT, field: 'CategoryId', primaryKey: true },
        DisplayOrder: { type: DataTypes.STRING, field: 'DisplayOrder' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.BIGINT, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.BIGINT, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'questionsectioncategorymap',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true
        });

     (SectionCategoryMap as any).associate = function(models: Models) {
                    SectionCategoryMap.belongsTo(models.SectionMaster, { foreignKey: 'SectionId' });
                    SectionCategoryMap.belongsTo(models.Category);
                };
 return SectionCategoryMap;
}
