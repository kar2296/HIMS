import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.OrderFollowupInstance, i.OrderFollowupAttributes> {
    let OrderFollowup = sequelize.define<i.OrderFollowupInstance, i.
        OrderFollowupAttributes>('OrderFollowup', {
            Id: { type: DataTypes.BIGINT, field: 'OrderFollowupId', primaryKey: true, autoIncrement: true },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            PatientOrderId: { type: DataTypes.BIGINT, field: 'PatientOrderId' },
            OrderDetailId: { type: DataTypes.BIGINT, field: 'OrderDetailId' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
            DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
            TestTypeId: { type: DataTypes.BIGINT, field: 'TestTypeId' },
            TestId: { type: DataTypes.BIGINT, field: 'TestId' },
            TestCode: { type: DataTypes.STRING, field: 'TestCode' },
            TestName: { type: DataTypes.STRING, field: 'TestName' },
            OrderedDate: { type: DataTypes.DATE, field: 'OrderedDate' },
            NextFollowupDate: { type: DataTypes.DATE, field: 'NextFollowupDate' },
            FollowupStatusId: { type: DataTypes.BIGINT, field: 'FollowupStatusId' },
            FollowupNotes: { type: DataTypes.STRING, field: 'FollowupNotes' },
            FollowupAppointmentOn: { type: DataTypes.DATE, field: 'FollowupAppointmentOn' },
            Duration: { type: DataTypes.INTEGER, field: 'Duration' },
            DurationPeriodId: { type: DataTypes.BIGINT, field: 'DurationPeriodId' },
            FollowupBy: { type: DataTypes.BIGINT, field: 'FollowupBy' },
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
                tableName: 'hims_orderfollowup',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (OrderFollowup as any).associate = function (models: Models) {
        OrderFollowup.belongsTo(models.Encounter);
        OrderFollowup.belongsTo(models.Patient);
        OrderFollowup.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        OrderFollowup.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
        OrderFollowup.belongsTo(models.ReferenceValue,
            { as: 'TESTMASTERTYP', foreignKey: 'TestTypeId', targetKey: 'ReferenceValueCodeId' });
        OrderFollowup.belongsTo(models.ReferenceValue,
            { as: 'OrderFollowupStatus', foreignKey: 'FollowupStatusId', targetKey: 'ReferenceValueCodeId' });
    };
    return OrderFollowup;
}
