import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ServiceItemPerformingDoctorInstance, i.ServiceItemPerformingDoctorAttributes> {
    let ServiceItemPerformingDoctor = sequelize.define<i.ServiceItemPerformingDoctorInstance,
        i.ServiceItemPerformingDoctorAttributes>('ServiceItemPerformingDoctor', {
            Id: { type: DataTypes.BIGINT, field: 'PerformingDoctorId', primaryKey: true, autoIncrement: true },
            ServiceItemId: { type: DataTypes.BIGINT, field: 'ServiceItemId' },
            ServiceRateCategoryId: { type: DataTypes.BIGINT, field: 'ServiceRateCategoryId' },
            Rate: { type: DataTypes.DECIMAL, field: 'Rate' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            PatientBillId: { type: DataTypes.BIGINT, field: 'PatientBillId' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
            DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            ShareTypeId: { type: DataTypes.BIGINT, field: 'ShareTypeId' },
            DoctorShareValue: { type: DataTypes.DECIMAL, field: 'DoctorShareValue' },
            DoctorShare: { type: DataTypes.DECIMAL, field: 'DoctorShare' },
            TeamId: { type: DataTypes.BIGINT, field: 'TeamId' },
            VisitTypeId: { type: DataTypes.BIGINT, field: 'VisitTypeId' },
            StatusId: { type: DataTypes.BIGINT, field: 'StatusId' },
            IsDisplayAllDoctors: { type: DataTypes.BOOLEAN, field: 'IsDisplayAllDoctors' },
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' }
        },
            {
                indexes: [],
                timestamps: true,
                tableName: 'serviceitemperformingdoctors',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (ServiceItemPerformingDoctor as any).associate = function (models: Models) {
        ServiceItemPerformingDoctor.belongsTo(models.ReferenceValue, { as: 'Team', targetKey: 'ReferenceValueCodeId' });
    };
    return ServiceItemPerformingDoctor;
}
