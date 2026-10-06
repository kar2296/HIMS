import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.DoctorShareInstance, i.DoctorShareAttributes> {
    let DoctorShare = sequelize.define<i.DoctorShareInstance, i.DoctorShareAttributes>('DoctorShare', {
        Id: { type: DataTypes.BIGINT, field: 'DoctorShareId', primaryKey: true, autoIncrement: true },
        OrgId: { type: DataTypes.BIGINT, field: 'OrgId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        DoctorClassId: { type: DataTypes.BIGINT, field: 'DoctorClassId' },
        ShareTypeId: { type: DataTypes.BIGINT, field: 'ShareTypeId' },
        ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
        ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
        EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
        ActiveStatusId: { type: DataTypes.BIGINT, field: 'ActiveStatusId' },
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
            tableName: 'doctorshare',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (DoctorShare as any).associate = function (models: Models) {
        DoctorShare.hasMany(models.DoctorShareDetails, { foreignKey: 'DoctorShareId' });
        DoctorShare.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        DoctorShare.belongsTo(models.ReferenceValue, { as: 'DoctorClass', targetKey: 'ReferenceValueCodeId' });
        DoctorShare.belongsTo(models.ReferenceValue, { as: 'ShareType', targetKey: 'ReferenceValueCodeId' });
        DoctorShare.belongsTo(models.ReferenceValue, { as: 'EncounterType', targetKey: 'ReferenceValueCodeId' });
        DoctorShare.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return DoctorShare;
}
