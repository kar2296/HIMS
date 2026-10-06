import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ProcedureOrderInstance, i.ProcedureOrderAttributes> {
    let ProcedureOrder = sequelize.define<i.ProcedureOrderInstance, i.ProcedureOrderAttributes>('ProcedureOrder', {
        Id: { type: DataTypes.BIGINT, field: 'ProcedureOrderId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        SubDepartmentId: { type: DataTypes.BIGINT, field: 'SubDepartmentId' },
        ServiceCategoryId: { type: DataTypes.BIGINT, field: 'ServiceCategoryId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        PatientGuarantorId: { type: DataTypes.BIGINT, field: 'PatientGuarantorId' },
        ServiceRateCategoryId: { type: DataTypes.BIGINT, field: 'ServiceRateCategoryId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
        DoctorId: { type: DataTypes.INTEGER, field: 'DoctorId' },
        ConsultationId: { type: DataTypes.INTEGER, field: 'ConsultationId' },
        OrderNumber: { type: DataTypes.STRING, field: 'OrderNumber' },
        OrderRequestDate: { type: DataTypes.DATE, field: 'OrderRequestDate' },
        OrderScheduleDate: { type: DataTypes.DATE, field: 'OrderScheduleDate' },
        OrderFromId: { type: DataTypes.BIGINT, field: 'OrderFromId' },
        OrderToId: { type: DataTypes.BIGINT, field: 'OrderToId' },
        OrderStatusId: { type: DataTypes.INTEGER, field: 'OrderStatusId' },
        OrderCompletedDate: { type: DataTypes.DATE, field: 'OrderCompletedDate' },
        OrderPriorityId: { type: DataTypes.INTEGER, field: 'OrderPriorityId' },
        OrderTotal: { type: DataTypes.INTEGER, field: 'OrderTotal' },
        OrderNotes: { type: DataTypes.STRING, field: 'OrderNotes' },
        OrderComments: { type: DataTypes.STRING, field: 'OrderComments' },
        IsDirectBill: { type: DataTypes.BOOLEAN, field: 'IsDirectBill' },
        BillingStatusId: { type: DataTypes.INTEGER, field: 'BillingStatusId' },
        PatientBillStatusId: { type: DataTypes.INTEGER, field: 'PatientBillStatusId' },
        PatientBillId: { type: DataTypes.BIGINT, field: 'PatientBillId' },
        BillNumber: { type: DataTypes.STRING, field: 'BillNumber' },
        BillAmount: { type: DataTypes.DECIMAL, field: 'BillAmount' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
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
            tableName: 'procedureorders',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (ProcedureOrder as any).associate = function (models: Models) {
        ProcedureOrder.belongsTo(models.User, { foreignKey: 'DoctorId' });
        ProcedureOrder.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        ProcedureOrder.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        ProcedureOrder.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        ProcedureOrder.belongsTo(models.PatientGuarantor, { foreignKey: 'PatientGuarantorId' });
        ProcedureOrder.belongsTo(models.ReferenceValue, { as: 'OrderPriority', targetKey: 'ReferenceValueCodeId' });
        ProcedureOrder.belongsTo(models.Department, { foreignKey: 'OrderFromId', as: 'OrderFrom' });
        ProcedureOrder.belongsTo(models.Department, { foreignKey: 'OrderToId', as: 'OrderTo' });
        ProcedureOrder.belongsTo(models.Department, { foreignKey: 'SubDepartmentId', as: 'SubDeparement' });
        ProcedureOrder.belongsTo(models.Department, { foreignKey: 'DepartmentId', as: 'ParentDepartment' });
        ProcedureOrder.belongsTo(models.OrderStatus, { foreignKey: 'OrderStatusId' });
        ProcedureOrder.belongsTo(models.PatientBills, { foreignKey: 'PatientBillId', as: 'PatientBills' });
        ProcedureOrder.belongsTo(models.ServiceCategory, { foreignKey: 'ServiceCategoryId' });
        ProcedureOrder.hasMany(models.ProcedureOrderDetail);
    };
    return ProcedureOrder;
}
