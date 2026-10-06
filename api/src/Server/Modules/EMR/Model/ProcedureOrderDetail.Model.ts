import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ProcedureOrderDetailInstance, i.ProcedureOrderDetailAttributes> {
    let ProcedureOrderDetail = sequelize.define<i.ProcedureOrderDetailInstance, i.ProcedureOrderDetailAttributes>('ProcedureOrderDetail', {
        Id: { type: DataTypes.BIGINT, field: 'ProcedureOrderDetailId', primaryKey: true, autoIncrement: true },
        ProcedureOrderId: { type: DataTypes.BIGINT, field: 'ProcedureOrderId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        SubDepartmentId: { type: DataTypes.BIGINT, field: 'SubDepartmentId' },
        MasterObjectTypeId: { type: DataTypes.INTEGER, field: 'MasterObjectTypeId' },
        MasterId: { type: DataTypes.INTEGER, field: 'MasterId' },
        ProcedureTypeId: { type: DataTypes.INTEGER, field: 'ProcedureTypeId' },
        ProcedureId: { type: DataTypes.BIGINT, field: 'ProcedureId' },
        ProcedureCode: { type: DataTypes.STRING, field: 'ProcedureCode' },
        ProcedureName: { type: DataTypes.STRING, field: 'ProcedureName' },
        ProcedureDescription: { type: DataTypes.STRING, field: 'ProcedureDescription' },
        ProcedurePrice: { type: DataTypes.DECIMAL, field: 'ProcedurePrice' },
        ServiceItemId: { type: DataTypes.BIGINT, field: 'ServiceItemId' },
        ServiceCode: { type: DataTypes.STRING, field: 'ServiceCode' },
        ServiceName: { type: DataTypes.STRING, field: 'ServiceName' },
        ServiceCategoryId: { type: DataTypes.BIGINT, field: 'ServiceCategoryId' },
        ServiceCategoryName: { type: DataTypes.STRING, field: 'ServiceCategoryName' },
        ServicePrice: { type: DataTypes.DECIMAL, field: 'ServicePrice' },
        Quantity: { type: DataTypes.INTEGER, field: 'Quantity' },
        GstId: { type: DataTypes.INTEGER, field: 'GstId' },
        GstPercentage: { type: DataTypes.DECIMAL, field: 'GstPercentage' },
        NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
        DiagnosisId: { type: DataTypes.INTEGER, field: 'DiagnosisId' },
        IsOrdered: { type: DataTypes.INTEGER, field: 'IsOrdered' },
        DoctorId: { type: DataTypes.INTEGER, field: 'DoctorId' },
        OrderToLocationId: { type: DataTypes.INTEGER, field: 'OrderToLocationId' },
        OrderFromLocationId: { type: DataTypes.INTEGER, field: 'OrderFromLocationId' },
        OrderLocationId: { type: DataTypes.INTEGER, field: 'OrderLocationId' },
        OrderStatusId: { type: DataTypes.INTEGER, field: 'OrderStatusId' },
        OrderPriorityId: { type: DataTypes.INTEGER, field: 'OrderPriorityId' },
        ProcedureInstructions: { type: DataTypes.STRING, field: 'ProcedureInstructions' },
        GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
        IsSelf: { type: DataTypes.BOOLEAN, field: 'IsSelf' },
        IsAlertRequired: { type: DataTypes.INTEGER, field: 'IsAlertRequired' },
        ScheduleDate: { type: DataTypes.DATE, field: 'ScheduleDate' },
        IsProcessed: { type: DataTypes.INTEGER, field: 'IsProcessed' },
        ResultEstimatedDate: { type: DataTypes.DATE, field: 'ResultEstimatedDate' },
        IsCanceled: { type: DataTypes.INTEGER, field: 'IsCanceled' },
        CanceledById: { type: DataTypes.BIGINT, field: 'CanceledById' },
        CanceledDateTime: { type: DataTypes.DATE, field: 'CanceledDateTime' },
        PatientBillDetailId: { type: DataTypes.INTEGER, field: 'PatientBillDetailId' },
        PatientBillId: { type: DataTypes.INTEGER, field: 'PatientBillId' },
        PatientBillStatusId: { type: DataTypes.INTEGER, field: 'PatientBillStatusId' },
        IsDirectBill: { type: DataTypes.BOOLEAN, field: 'IsDirectBill' },
        ToothNo: { type: DataTypes.STRING, field: 'ToothNo' },
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
            tableName: 'procedureorderdetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (ProcedureOrderDetail as any).associate = function (models: Models) {
        ProcedureOrderDetail.belongsTo(models.Department, { as: 'OrderLocation', foreignKey: 'OrderLocationId' });
        ProcedureOrderDetail.belongsTo(models.Department, { as: 'OrderToLocation', foreignKey: 'OrderToLocationId' });
        ProcedureOrderDetail.belongsTo(models.Department, { as: 'OrderFromLocation', foreignKey: 'OrderFromLocationId' });
        ProcedureOrderDetail.belongsTo(models.ReferenceValue, { as: 'PatientBillStatus', targetKey: 'ReferenceValueCodeId' });
        ProcedureOrderDetail.belongsTo(models.ReferenceValue, { as: 'OrderPriority', targetKey: 'ReferenceValueCodeId' });
        ProcedureOrderDetail.belongsTo(models.Department, { as: 'Department', foreignKey: 'DepartmentId' });
        ProcedureOrderDetail.belongsTo(models.OrderStatus);
        ProcedureOrderDetail.belongsTo(models.Encounter);
        ProcedureOrderDetail.belongsTo(models.ProcedureOrder);
        ProcedureOrderDetail.belongsTo(models.ServiceItem);
    };
    return ProcedureOrderDetail;
}
