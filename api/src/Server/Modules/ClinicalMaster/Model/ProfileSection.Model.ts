import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ProfileSectionInstance, i.ProfileSectionAttributes> {
    let ProfileSection = sequelize.define<i.ProfileSectionInstance, i.ProfileSectionAttributes>('ProfileSection', {
        Id: { type: DataTypes.BIGINT, field: 'ProfileSectionId', primaryKey: true, autoIncrement: true },
        ProfileId: { type: DataTypes.BIGINT, field: 'ProfileId' },
        SectionId: { type: DataTypes.BIGINT, field: 'SectionId' },
        DockPositionId: { type: DataTypes.BIGINT, field: 'DockPositionId' },
        DisplayOrder: { type: DataTypes.STRING, field: 'DisplayOrder' },
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
            tableName: 'hims_templatetabscreenmap',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (ProfileSection as any).associate = function(models: Models) {
                    ProfileSection.belongsTo(models.SectionMaster, { foreignKey: 'SectionId' });
                    ProfileSection.belongsTo(models.ProfileMaster, { foreignKey: 'ProfileId' });
                };
 return ProfileSection;
}
