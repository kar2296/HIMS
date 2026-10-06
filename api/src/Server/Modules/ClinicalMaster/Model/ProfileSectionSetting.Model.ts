import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

/**
 * Per-form panel settings used by the React EMR Workspace (panel nickname / mandatory flag).
 * Keyed by (ProfileId, SectionId) because ProfileSection rows are re-created when a form is re-ordered.
 * Table: emr_profile_section_settings  (see scripts/emr_profile_section_settings.sql)
 */
export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ProfileSectionSettingInstance, i.ProfileSectionSettingAttributes> {
    let ProfileSectionSetting = sequelize.define<i.ProfileSectionSettingInstance, i.ProfileSectionSettingAttributes>('ProfileSectionSetting', {
        Id: { type: DataTypes.BIGINT, field: 'Id', primaryKey: true, autoIncrement: true },
        ProfileId: { type: DataTypes.BIGINT, field: 'ProfileId' },
        SectionId: { type: DataTypes.BIGINT, field: 'SectionId' },
        NickName: { type: DataTypes.STRING, field: 'NickName' },
        IsMandatory: { type: DataTypes.BOOLEAN, field: 'IsMandatory' },
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
            tableName: 'emr_profile_section_settings',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (ProfileSectionSetting as any).associate = function (models: Models) {
        ProfileSectionSetting.belongsTo(models.SectionMaster, { foreignKey: 'SectionId' });
        ProfileSectionSetting.belongsTo(models.ProfileMaster, { foreignKey: 'ProfileId' });
    };
    return ProfileSectionSetting;
}
