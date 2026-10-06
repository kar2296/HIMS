import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.VirtualBillDetailInstance, i.VirtualBillDetailAttributes> {
    let VirtualBillDetail = sequelize.define<i.VirtualBillDetailInstance, i.VirtualBillDetailAttributes>('VirtualBillDetail', {
        Id: { type: DataTypes.BIGINT, field: 'VirtualBillDetailId', primaryKey: true, autoIncrement: true },
        VirtualBillId: { type: DataTypes.BIGINT, field: 'VirtualBillId' },
        BillDateTime: { type: DataTypes.DATE, field: 'BillDateTime' },
        ServiceId: { type: DataTypes.BIGINT, field: 'ServiceId' },
        ServiceCode: { type: DataTypes.STRING, field: 'ServiceCode' },
        ServiceName: { type: DataTypes.STRING, field: 'ServiceName' },
        ServiceTypeId: { type: DataTypes.BIGINT, field: 'ServiceTypeId' },
        ServiceGroupId: { type: DataTypes.BIGINT, field: 'ServiceGroupId' },
        ServiceCategoryId: { type: DataTypes.BIGINT, field: 'ServiceCategoryId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        VirtualBillStatusId: { type: DataTypes.BIGINT, field: 'VirtualBillStatusId' },
        Quantity: { type: DataTypes.INTEGER, field: 'Quantity' },
        ReturnedQuantity: { type: DataTypes.INTEGER, field: 'ReturnedQuantity' },
        Rate: { type: DataTypes.DECIMAL, field: 'Rate' },
        GrossAmount: { type: DataTypes.DECIMAL, field: 'GrossAmount' },
        DiscountPercentage: { type: DataTypes.DECIMAL, field: 'DiscountPercentage' },
        UnitDiscountAmount: { type: DataTypes.DECIMAL, field: 'UnitDiscountAmount' },
        DiscountAmount: { type: DataTypes.DECIMAL, field: 'DiscountAmount' },
        UnitProportionateDiscount: { type: DataTypes.DECIMAL, field: 'UnitProportionateDiscount' },
        ProportionateDiscount: { type: DataTypes.DECIMAL, field: 'ProportionateDiscount' },
        DoctorDiscountAmount: { type: DataTypes.DECIMAL, field: 'DoctorDiscountAmount' },
        NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
        ReceivedAmount: { type: DataTypes.DECIMAL, field: 'ReceivedAmount' },
        ReturnedAmount: { type: DataTypes.DECIMAL, field: 'ReturnedAmount' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
        VirtualOrderId: { type: DataTypes.BIGINT, field: 'VirtualOrderId' },
        VirtualOrderDetailId: { type: DataTypes.BIGINT, field: 'VirtualOrderDetailId' },
        VirtualOrderStatusId: { type: DataTypes.BIGINT, field: 'VirtualOrderStatusId' },
        VirtualOrderDateTime: { type: DataTypes.DATE, field: 'VirtualOrderDateTime' },
        DiscountModeId: { type: DataTypes.BIGINT, field: 'DiscountModeId' },
        DiscountAuthorizedBy: { type: DataTypes.INTEGER, field: 'DiscountAuthorizedBy' },
        DoctorShare: { type: DataTypes.DECIMAL, field: 'DoctorShare' },
        DoctorShareActual: { type: DataTypes.DECIMAL, field: 'DoctorShareActual' },
        DoctorShareDisc: { type: DataTypes.DECIMAL, field: 'DoctorShareDisc' },
        CancelReason: { type: DataTypes.STRING, field: 'CancelReason' },
        CancelledBy: { type: DataTypes.BIGINT, field: 'CancelledBy' },
        IsInvoicedDoctorShare: { type: DataTypes.INTEGER, field: 'IsInvoicedDoctorShare' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
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
            tableName: 'hims_virtualbilldetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    // (VirtualBillDetail as any).associate = function (models: Models) {
    //     VirtualBillDetail.belongsTo(models.Department);
    //     VirtualBillDetail.belongsTo(models.ServiceItem, { foreignKey: 'ServiceId' });
    //     VirtualBillDetail.belongsTo(models.ServiceCategory, { foreignKey: 'ServiceCategoryId' });
    //     VirtualBillDetail.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
    //     VirtualBillDetail.belongsTo(models.User, { as: 'UpdatedUser', foreignKey: 'UpdatedBy' });
    //     VirtualBillDetail.belongsTo(models.User, { foreignKey: 'DoctorId' });
    //     VirtualBillDetail.belongsTo(models.StoreMaster, { foreignKey: 'StoreMasterId' });
    //     VirtualBillDetail.belongsTo(models.GstMaster, { foreignKey: 'GSTId' });
    //     VirtualBillDetail.belongsTo(models.ItemMaster, { foreignKey: 'ItemMasterId' });
    //     VirtualBillDetail.belongsTo(models.OpticalItemMaster, { foreignKey: 'OpticalItemMasterId' });
    //     VirtualBillDetail.belongsTo(models.PatientBills, { foreignKey: 'PatientBillId' });
    //     VirtualBillDetail.belongsTo(models.Encounter);
    //     VirtualBillDetail.belongsTo(models.ReferenceValue, { as: 'PatientBillStatus', targetKey: 'ReferenceValueCodeId' });
    //     VirtualBillDetail.belongsTo(models.OrderStatus);
    // };
    return VirtualBillDetail;
}
