import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.CarePathSectionInstance, i.CarePathSectionAttributes> {
    let CarePathSection = sequelize.define<i.CarePathSectionInstance, i.CarePathSectionAttributes>('CarePathSection', {
        Id: { type: DataTypes.BIGINT, field: 'CarePathSectionId', primaryKey: true, autoIncrement: true },
        CarePathId: { type: DataTypes.BIGINT, field: 'CarePathId' },
        SectionId: { type: DataTypes.BIGINT, field: 'SectionId' },
        SectionTypeId: { type: DataTypes.BIGINT, field: 'SectionTypeId' },
        IsManditory: { type: DataTypes.BOOLEAN, field: 'IsManditory' },
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
            tableName: 'carepathsection',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (CarePathSection as any).associate = function(models: Models) {
                    CarePathSection.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                    CarePathSection.belongsTo(models.ReferenceValue, { as: 'SectionType', targetKey: 'ReferenceValueCodeId' });
                    CarePathSection.belongsTo(models.SectionMaster, { foreignKey: 'SectionId' });
                };
 return CarePathSection;
}
