import * as SequelizeStatic from 'sequelize';
import {DataTypes, Sequelize} from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AppointmentRequestInstance, i.AppointmentRequestAttributes> {
    let AppointmentRequest = sequelize.define<i.AppointmentRequestInstance, i.AppointmentRequestAttributes>('AppointmentRequest', {
       Id: { type: DataTypes.BIGINT, field: 'AppointmentRequestId', primaryKey: true, autoIncrement: true  },
       PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
       FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
       DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
       DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
       ResourceId: { type: DataTypes.BIGINT, field: 'ResourceId' },
       AppointmentTypeId: { type: DataTypes.BIGINT, field: 'AppointmentTypeId' },
       AppointmentDate: { type: DataTypes.DATE, field: 'AppointmentDate' },
       StartTime: { type: DataTypes.TIME, field: 'StartTime' },
       EndTime: { type: DataTypes.TIME, field: 'EndTime' },
       AppointmentId: { type: DataTypes.BIGINT, field: 'AppointmentId' },
       RequestMessage: { type: DataTypes.STRING, field: 'RequestMessage' },
       AppointmentRequestStatusId: { type: DataTypes.BIGINT, field: 'AppointmentRequestStatusId' },
       Status: { type: DataTypes.INTEGER, field: 'Status' },
       Rev: { type: DataTypes.INTEGER, field: 'Rev' },
       CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
       CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
       UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
       UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            classMethods: {},
            timestamps: true,
            tableName: 'appointmentrequests',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });
    (AppointmentRequest as any).associate = function (models: Models) {
        AppointmentRequest.belongsTo(models.Facility);
        AppointmentRequest.belongsTo(models.Department, { as: 'Department' });
        AppointmentRequest.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        AppointmentRequest.belongsTo(models.ResourceMaster, { foreignKey: 'ResourceId' });
        AppointmentRequest.belongsTo(models.Appointment, { as: 'Appointment', foreignKey: 'AppointmentId' });
        AppointmentRequest.belongsTo(models.ReferenceValue, { as: 'AppointmentRequestStatus', targetKey: 'ReferenceValueCodeId' });
    };

    return AppointmentRequest;
}
