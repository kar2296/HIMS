import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.StorePreferenceInstance, i.StorePreferenceAttributes> {
    let StorePreference = sequelize.define<i.StorePreferenceInstance, i.StorePreferenceAttributes>('StorePreference', {
        Id: { type: DataTypes.BIGINT, field: 'StorePreferenceId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        Category: { type: DataTypes.STRING, field: 'Category' },
        Section: { type: DataTypes.STRING, field: 'Section' },
        PreferenceDisplay: { type: DataTypes.STRING, field: 'PreferenceDisplay' },
        PreferenceKey: { type: DataTypes.STRING, field: 'PreferenceKey' },
        PreferenceValue: { type: DataTypes.STRING, field: 'PreferenceValue' },
        PreferenceType: { type: DataTypes.STRING, field: 'PreferenceType' },
        DisplayOrder: { type: DataTypes.INTEGER, field: 'DisplayOrder' },
        Row: { type: DataTypes.INTEGER, field: 'Row' },
        Col: { type: DataTypes.INTEGER, field: 'Col' },
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
            tableName: 'storepreferences',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });



    return StorePreference;
}
