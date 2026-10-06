import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ProfileMasterInstance, i.ProfileMasterAttributes> {
    let ProfileMaster = sequelize.define<i.ProfileMasterInstance, i.ProfileMasterAttributes>('ProfileMaster', {
        Id: { type: DataTypes.BIGINT, field: 'ProfileId', primaryKey: true, autoIncrement: true },
        Name: { type: DataTypes.STRING, field: 'Name' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        IsIVF: { type: DataTypes.BOOLEAN, field: 'IsIVF' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        PrintConfig: { type: DataTypes.STRING, field: 'PrintConfig' },
        ProfilemasterTypeId: { type: DataTypes.STRING, field: 'ProfilemasterTypeId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
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
            tableName: 'hims_templatescreens',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (ProfileMaster as any).associate = function (models: Models) {
        ProfileMaster.hasMany(models.ProfileSection, { foreignKey: 'ProfileId' });
        ProfileMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        ProfileMaster.belongsTo(models.ReferenceValue, {
            as: 'SectionNoteType', foreignKey: 'ProfilemasterTypeId',
            targetKey: 'ReferenceValueCodeId'
        });
    };
    return ProfileMaster;
}
