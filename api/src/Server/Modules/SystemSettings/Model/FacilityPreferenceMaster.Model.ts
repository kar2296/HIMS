import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.FacilityPreferenceMasterInstance, i.FacilityPreferenceMasterAttributes> {
    let FacilityPreferenceMaster = sequelize.define<i.FacilityPreferenceMasterInstance,
        i.FacilityPreferenceMasterAttributes>('FacilityPreferenceMaster', {
            Id: { type: DataTypes.BIGINT, field: 'FacilityPreferenceMasterId', primaryKey: true, autoIncrement: true },
            Category: { type: DataTypes.STRING, field: 'Category' },
            Section: { type: DataTypes.STRING, field: 'Section' },
            PreferenceDisplay: { type: DataTypes.STRING, field: 'PreferenceDisplay' },
            PreferenceKey: { type: DataTypes.STRING, field: 'PreferenceKey' },
            PreferenceDefaultValue: { type: DataTypes.STRING, field: 'PreferenceDefaultValue' },
            PreferenceType: { type: DataTypes.STRING, field: 'PreferenceType' },
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
            tableName: 'facilitypreferencemasters',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });



    return FacilityPreferenceMaster;
}
