import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.VirtualOrderDetailInstance, i.VirtualOrderDetailAttributes> {
    let VirtualOrderDetail = sequelize.define<i.VirtualOrderDetailInstance, i.VirtualOrderDetailAttributes>('VirtualOrderDetail', {
        Id: { type: DataTypes.BIGINT, field: 'VirtualOrderDetailId', primaryKey: true, autoIncrement: true },
        VirtualOrderId: { type: DataTypes.BIGINT, field: 'VirtualOrderId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        RequestDate: { type: DataTypes.DATE, field: 'RequestDate' },
        ServiceId: { type: DataTypes.BIGINT, field: 'ServiceId' },
        ServiceCode: { type: DataTypes.STRING, field: 'ServiceCode' },
        ServiceName: { type: DataTypes.STRING, field: 'ServiceName' },
        Quantity: { type: DataTypes.INTEGER, field: 'Quantity' },
        ServiceCategoryId: { type: DataTypes.BIGINT, field: 'ServiceCategoryId' },
        ServiceCategoryName: { type: DataTypes.STRING, field: 'ServiceCategoryName' },
        GrossAmount: { type: DataTypes.DECIMAL, field: 'GrossAmount' },
        NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
        DiscountModeId: { type: DataTypes.BIGINT, field: 'DiscountModeId' },
        Discount: { type: DataTypes.DECIMAL, field: 'Discount' },
        DoctorId: { type: DataTypes.INTEGER, field: 'DoctorId' },
        DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
        VirtualOrderDetailStatusId: { type: DataTypes.INTEGER, field: 'VirtualOrderDetailStatusId' },
        VirtualBillDetailId: { type: DataTypes.INTEGER, field: 'VirtualBillDetailId' },
        VirtualBillId: { type: DataTypes.INTEGER, field: 'VirtualBillId' },
        VirtualBillStatusId: { type: DataTypes.INTEGER, field: 'VirtualBillStatusId' },
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
            tableName: 'hims_virtualorderdetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (VirtualOrderDetail as any).associate = function (models: Models) {
        VirtualOrderDetail.belongsTo(models.ServiceItem, { foreignKey: 'ServiceId' });
        VirtualOrderDetail.belongsTo(models.VirtualOrder, { foreignKey: 'VirtualOrderId' });
    };
    return VirtualOrderDetail;
}
