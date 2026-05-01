import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.VirtualOrderInstance, i.VirtualOrderAttributes> {
    let VirtualOrder = sequelize.define<i.VirtualOrderInstance, i.VirtualOrderAttributes>('VirtualOrder', {
        Id: { type: DataTypes.BIGINT, field: 'VirtualOrderId', primaryKey: true, autoIncrement: true },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        VirtualCategoryId: { type: DataTypes.BIGINT, field: 'VirtualCategoryId' },
        VirtualSubCategoryId: { type: DataTypes.BIGINT, field: 'VirtualSubCategoryId' },
        CategoryTypeId: { type: DataTypes.BIGINT, field: 'CategoryTypeId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        PatientMRN: { type: DataTypes.STRING, field: 'PatientMRN' },
        PatientName: { type: DataTypes.STRING, field: 'PatientName' },
        PatientMobile: { type: DataTypes.STRING, field: 'PatientMobile' },
        IsDirectBill: { type: DataTypes.BOOLEAN, field: 'IsDirectBill' },
        OrderNumber: { type: DataTypes.STRING, field: 'OrderNumber' },
        OrderRequestDate: { type: DataTypes.DATE, field: 'OrderRequestDate' },
        OrderScheduleDate: { type: DataTypes.DATE, field: 'OrderScheduleDate' },
        DoctorId: { type: DataTypes.INTEGER, field: 'DoctorId' },
        DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
        OrderFromId: { type: DataTypes.BIGINT, field: 'OrderFromId' },
        OrderToId: { type: DataTypes.BIGINT, field: 'OrderToId' },
        SubDepartmentId: { type: DataTypes.BIGINT, field: 'SubDepartmentId' },
        VirtualOrderStatusId: { type: DataTypes.INTEGER, field: 'VirtualOrderStatusId' },
        OrderCompletedDate: { type: DataTypes.DATE, field: 'OrderCompletedDate' },
        OrderPriorityId: { type: DataTypes.INTEGER, field: 'OrderPriorityId' },
        OrderTotal: { type: DataTypes.INTEGER, field: 'OrderTotal' },
        VirtualBillId: { type: DataTypes.INTEGER, field: 'VirtualBillId' },
        VirtualBillStatusId: { type: DataTypes.INTEGER, field: 'VirtualBillStatusId' },
        VirtualBillNumber: { type: DataTypes.STRING, field: 'VirtualBillNumber' },
        VirtualBillAmount: { type: DataTypes.DECIMAL, field: 'VirtualBillAmount' },
        VirtualBillDate: { type: DataTypes.DATE, field: 'VirtualBillDate' },
        PaymentModeId: { type: DataTypes.INTEGER, field: 'PaymentModeId' },
        RequestTypeId: { type: DataTypes.INTEGER, field: 'RequestTypeId' },
        AppointmentId: { type: DataTypes.INTEGER, field: 'AppointmentId' },
        OrderConsultTypeId: { type: DataTypes.BIGINT, field: 'OrderConsultTypeId' },
        OrderModeId: { type: DataTypes.INTEGER, field: 'OrderModeId' },
        OrderRemarks: { type: DataTypes.STRING, field: 'OrderRemarks' },
        Symptoms: { type: DataTypes.STRING, field: 'Symptoms' },
        StartTime: { type: DataTypes.TIME, field: 'StartTime' },
        EndTime: { type: DataTypes.TIME, field: 'EndTime' },
        GrossAmount: { type: DataTypes.DECIMAL, field: 'GrossAmount' },
        DiscountAmount: { type: DataTypes.DECIMAL, field: 'DiscountAmount' },
        TotalNetAmount: { type: DataTypes.DECIMAL, field: 'TotalNetAmount' },
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
            tableName: 'hims_virtualorders',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (VirtualOrder as any).associate = function (models: Models) {
        VirtualOrder.belongsTo(models.Patient);
        VirtualOrder.belongsTo(models.ReferenceValue, { as: 'VirtualOrderStatus', targetKey: 'ReferenceValueCodeId' });
        VirtualOrder.belongsTo(models.ReferenceValue, {
            as: 'AppoinmentRequestType', foreignKey: 'RequestTypeId', targetKey: 'ReferenceValueCodeId'
        });
        VirtualOrder.belongsTo(models.ReferenceValue, { as: 'OrderMode', targetKey: 'ReferenceValueCodeId' });
        VirtualOrder.belongsTo(models.ReferenceValue, { as: 'PaymentMode', targetKey: 'ReferenceValueCodeId' });
        VirtualOrder.belongsTo(models.ReferenceValue, {
            as: 'OrderConsultType', targetKey: 'ReferenceValueCodeId',
            foreignKey: 'OrderConsultTypeId'
        });
        VirtualOrder.belongsTo(models.VirtualCategory, { foreignKey: 'VirtualCategoryId' });
        VirtualOrder.belongsTo(models.VirtualSubCategory, { foreignKey: 'VirtualSubCategoryId' });
        VirtualOrder.hasMany(models.VirtualOrderDetail);
        VirtualOrder.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        VirtualOrder.belongsTo(models.Department, { foreignKey: 'OrderToId' });
        VirtualOrder.belongsTo(models.Appointment, { foreignKey: 'AppointmentId' });
        VirtualOrder.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        VirtualOrder.hasOne(models.EncounterDoctor);
    };
    return VirtualOrder;
}
