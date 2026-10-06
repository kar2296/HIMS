import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientDietOrderDetailInstance, i.PatientDietOrderDetailAttributes> {
    let PatientDietOrderDetail = sequelize.define<i.PatientDietOrderDetailInstance,
        i.PatientDietOrderDetailAttributes>('PatientDietOrderDetail', {
            Id: { type: DataTypes.BIGINT, field: 'PatientDietOrderDetailId', primaryKey: true, autoIncrement: true },
            PatientDietOrderId: { type: DataTypes.BIGINT, field: 'PatientDietOrderId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            RequestDate: { type: DataTypes.DATE, field: 'RequestDate' },
            DietItemId: { type: DataTypes.BIGINT, field: 'DietItemId' },
            DietItemCode: { type: DataTypes.STRING, field: 'DietItemCode' },
            DietName: { type: DataTypes.STRING, field: 'DietName' },
            DietCategoryId: { type: DataTypes.BIGINT, field: 'DietCategoryId' },
            DietFrequencyId: { type: DataTypes.BIGINT, field: 'DietFrequencyId' },
            Description: { type: DataTypes.STRING, field: 'Description' },
            DietItemTypeId: { type: DataTypes.BIGINT, field: 'DietItemTypeId' },
            IsAttender: { type: DataTypes.BOOLEAN, field: 'IsAttender' },
            IsDirectBill: { type: DataTypes.BOOLEAN, field: 'IsDirectBill' },
            DoctorId: { type: DataTypes.INTEGER, field: 'DoctorId' },
            DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
            OrderStatusId: { type: DataTypes.INTEGER, field: 'OrderStatusId' },
            OrderPriorityId: { type: DataTypes.INTEGER, field: 'OrderPriorityId' },
            PatientBillDetailId: { type: DataTypes.INTEGER, field: 'PatientBillDetailId' },
            PatientBillId: { type: DataTypes.INTEGER, field: 'PatientBillId' },
            PatientBillStatusId: { type: DataTypes.INTEGER, field: 'PatientBillStatusId' },
            Price: { type: DataTypes.DECIMAL, field: 'Price' },
            Quantity: { type: DataTypes.INTEGER, field: 'Quantity' },
            NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
            Discount: { type: DataTypes.INTEGER, field: 'Discount' },
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
                tableName: 'patientdietorderdetails',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (PatientDietOrderDetail as any).associate = function (models: Models) {
        PatientDietOrderDetail.belongsTo(models.DietItemMaster, { foreignKey: 'DietItemId' });
        PatientDietOrderDetail.belongsTo(models.ReferenceValue, { as: 'DietItemType', targetKey: 'ReferenceValueCodeId' });
        PatientDietOrderDetail.belongsTo(models.ReferenceValue, { as: 'DietFrequency', targetKey: 'ReferenceValueCodeId' });
        PatientDietOrderDetail.belongsTo(models.ReferenceValue, { as: 'DietCategory', targetKey: 'ReferenceValueCodeId' });
        PatientDietOrderDetail.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        PatientDietOrderDetail.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        PatientDietOrderDetail.belongsTo(models.OrderStatus, { foreignKey: 'OrderStatusId' });
        PatientDietOrderDetail.belongsTo(models.ServiceItem, { foreignKey: 'DietItemId', targetKey: 'MasterItemId' });
        PatientDietOrderDetail.belongsTo(models.PatientDietOrder);


    };
    return PatientDietOrderDetail;
}
