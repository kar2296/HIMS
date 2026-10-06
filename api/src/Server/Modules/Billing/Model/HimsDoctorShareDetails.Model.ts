import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.DoctorShareDetailsInstance, i.DoctorShareDetailsAttributes> {
    let DoctorShareDetails = sequelize.define<i.DoctorShareDetailsInstance, i.DoctorShareDetailsAttributes>('DoctorShareDetails', {
        Id: { type: DataTypes.BIGINT, field: 'DoctorShareDetailId', primaryKey: true, autoIncrement: true },
        DoctorShareId: { type: DataTypes.BIGINT, field: 'DoctorShareId' },
        OrgId: { type: DataTypes.BIGINT, field: 'OrgId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        SharingTypeId: { type: DataTypes.BIGINT, field: 'SharingTypeId' },
        ServiceCategoryId: { type: DataTypes.BIGINT, field: 'ServiceCategoryId' },
        ServiceId: { type: DataTypes.BIGINT, field: 'ServiceId' },
        ServiceName: { type: DataTypes.STRING, field: 'ServiceName' },
        EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
        ShareTypeId: { type: DataTypes.BIGINT, field: 'ShareTypeId' },
        EligiblePercentage: { type: DataTypes.DECIMAL, field: 'EligiblePercentage' },
        SharePercentage: { type: DataTypes.DECIMAL, field: 'SharePercentage' },
        ShareAmount: { type: DataTypes.DECIMAL, field: 'ShareAmount' },
        MinAmount: { type: DataTypes.DECIMAL, field: 'MinAmount' },
        MaxAmount: { type: DataTypes.DECIMAL, field: 'MaxAmount' },
        ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
        ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
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
            tableName: 'doctorsharedetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (DoctorShareDetails as any).associate = function (models: Models) {
        DoctorShareDetails.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        DoctorShareDetails.belongsTo(models.ServiceItem, { foreignKey: 'ServiceId' });
        DoctorShareDetails.belongsTo(models.ServiceCategory, { foreignKey: 'ServiceCategoryId' });
        DoctorShareDetails.belongsTo(models.ReferenceValue, { as: 'SharingType', targetKey: 'ReferenceValueCodeId' });
        DoctorShareDetails.belongsTo(models.ReferenceValue, { as: 'ShareType', targetKey: 'ReferenceValueCodeId' });
        DoctorShareDetails.belongsTo(models.ReferenceValue, { as: 'EncounterType', targetKey: 'ReferenceValueCodeId' });
        DoctorShareDetails.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
    };
    return DoctorShareDetails;
}
