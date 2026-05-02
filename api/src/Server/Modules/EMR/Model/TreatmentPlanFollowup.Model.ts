import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.TreatmentPlanFollowupInstance, i.TreatmentPlanFollowupAttributes> {
    let TreatmentPlanFollowup = sequelize.define<i.TreatmentPlanFollowupInstance, i.
        TreatmentPlanFollowupAttributes>('TreatmentPlanFollowup', {
            Id: { type: DataTypes.BIGINT, field: 'TreatmentFollowUpId', primaryKey: true, autoIncrement: true },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            TreatmentPlanId: { type: DataTypes.BIGINT, field: 'TreatmentPlanId' },
            TreatmentPlanDetailId: { type: DataTypes.BIGINT, field: 'TreatmentPlanDetailId' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
            DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
            ServiceCategoryId: { type: DataTypes.BIGINT, field: 'ServiceCategoryId' },
            ServiceItemId: { type: DataTypes.BIGINT, field: 'ServiceItemId' },
            ServiceCode: { type: DataTypes.STRING, field: 'ServiceCode' },
            ServiceName: { type: DataTypes.STRING, field: 'ServiceName' },
            TreatmentRequestDate: { type: DataTypes.DATE, field: 'TreatmentRequestDate' },
            TreatmentScheduleDate: { type: DataTypes.DATE, field: 'TreatmentScheduleDate' },
            FollowupStatusId: { type: DataTypes.BIGINT, field: 'FollowupStatusId' },
            FollowupNotes: { type: DataTypes.STRING, field: 'FollowupNotes' },
            NextFollowupOn: { type: DataTypes.DATE, field: 'NextFollowupOn' },
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
                tableName: 'hims_treatmentplanfollowup',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (TreatmentPlanFollowup as any).associate = function (models: Models) {
        TreatmentPlanFollowup.belongsTo(models.Encounter);
        TreatmentPlanFollowup.belongsTo(models.Patient);
        TreatmentPlanFollowup.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        TreatmentPlanFollowup.belongsTo(models.User, { as: 'FollowupUser', foreignKey: 'FollowupBy' });
        TreatmentPlanFollowup.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
        TreatmentPlanFollowup.belongsTo(models.ReferenceValue,
            { as: 'OrderFollowupStatus', foreignKey: 'FollowupStatusId', targetKey: 'ReferenceValueCodeId' });
    };
    return TreatmentPlanFollowup;
}
