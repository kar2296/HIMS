import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.AppointmentDisplayInstance, i.AppointmentDisplayAttributes> {
    let AppointmentDisplay = sequelize.define<i.AppointmentDisplayInstance, i.AppointmentDisplayAttributes>('AppointmentDisplay', {
        Id: { type: DataTypes.BIGINT, field: 'AppointmentDisplayId', primaryKey: true, autoIncrement: true },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        AppointmentId: { type: DataTypes.BIGINT, field: 'AppointmentId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        DisplayNo: { type: DataTypes.BIGINT, field: 'DisplayNo' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        TokenNo: { type: DataTypes.STRING, field: 'TokenNo' },
        RoomNoId: { type: DataTypes.BIGINT, field: 'RoomNoId' },
        TokenStatusId: { type: DataTypes.BIGINT, field: 'TokenStatusId' },
        LocationId: { type: DataTypes.BIGINT, field: 'LocationId' },
        IsAudioRaised: { type: DataTypes.BOOLEAN, field: 'IsAudioRaised' },
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
            tableName: 'appointmentdisplay',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (AppointmentDisplay as any).associate = function (models: Models) {
                    AppointmentDisplay.belongsTo(models.Patient);
                    AppointmentDisplay.belongsTo(models.Facility);
                    AppointmentDisplay.belongsTo(models.Department);
                    AppointmentDisplay.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
                    AppointmentDisplay.belongsTo(models.ReferenceValue, { as: 'TokenStatus', targetKey: 'ReferenceValueCodeId' });
        AppointmentDisplay.belongsTo(models.ReferenceValue, { as: 'OPDRoom', foreignKey: 'RoomNoId', targetKey: 'ReferenceValueCodeId' });

                };
 return AppointmentDisplay;
}
