import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.TreatmentPlanDetailInstance, i.TreatmentPlanDetailAttributes> {
    let TreatmentPlanDetail = sequelize.define<i.TreatmentPlanDetailInstance, i.TreatmentPlanDetailAttributes>('TreatmentPlanDetail', {
        Id: { type: DataTypes.BIGINT, field: 'TreatmentPlanDetailId', primaryKey: true, autoIncrement: true },
        TreatmentPlanId: { type: DataTypes.BIGINT, field: 'TreatmentPlanId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        DoctorId: { type: DataTypes.INTEGER, field: 'DoctorId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        PlanScheduleDate: { type: DataTypes.DATE, field: 'PlanScheduleDate' },
        PlanStartTime: { type: DataTypes.TIME, field: 'PlanStartTime' },
        PlanEndTime: { type: DataTypes.TIME, field: 'PlanEndTime' },
        ServiceItemId: { type: DataTypes.BIGINT, field: 'ServiceItemId' },
        ServiceCode: { type: DataTypes.STRING, field: 'ServiceCode' },
        ServiceName: { type: DataTypes.STRING, field: 'ServiceName' },
        ServiceCategoryId: { type: DataTypes.BIGINT, field: 'ServiceCategoryId' },
        ServicePrice: { type: DataTypes.DECIMAL, field: 'ServicePrice' },
        Quantity: { type: DataTypes.INTEGER, field: 'Quantity' },
        NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
        PlanDetailStatusId: { type: DataTypes.INTEGER, field: 'PlanDetailStatusId' },
        TreatmentInstructions: { type: DataTypes.STRING, field: 'TreatmentInstructions' },
        CompletedById: { type: DataTypes.BIGINT, field: 'CompletedById' },
        CompletedDateTime: { type: DataTypes.DATE, field: 'CompletedDateTime' },
        CancelledById: { type: DataTypes.BIGINT, field: 'CancelledById' },
        CancelledDateTime: { type: DataTypes.DATE, field: 'CancelledDateTime' },
        PatientBillDetailId: { type: DataTypes.INTEGER, field: 'PatientBillDetailId' },
        PatientBillId: { type: DataTypes.INTEGER, field: 'PatientBillId' },
        PatientBillStatusId: { type: DataTypes.INTEGER, field: 'PatientBillStatusId' },
        AdditionalComments: { type: DataTypes.STRING, field: 'AdditionalComments' },
        IsPaid: { type: DataTypes.BOOLEAN, field: 'IsPaid' },
        IsFollowup: { type: DataTypes.BOOLEAN, field: 'IsFollowup' },
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
            tableName: 'hims_treatmentplandetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (TreatmentPlanDetail as any).associate = function (models: Models) {
        TreatmentPlanDetail.belongsTo(models.Encounter);
        TreatmentPlanDetail.belongsTo(models.TreatmentPlan);
        TreatmentPlanDetail.belongsTo(models.ServiceItem);
        TreatmentPlanDetail.belongsTo(models.ReferenceValue, {
            as: 'PlanStatus', foreignKey: 'PlanDetailStatusId', targetKey: 'ReferenceValueCodeId'
        });
    };
    return TreatmentPlanDetail;
}
