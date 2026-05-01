import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.VirtualMedicineOrderDetailInstance, i.VirtualMedicineOrderDetailAttributes> {
    let VirtualMedicineOrderDetail = sequelize.define<i.VirtualMedicineOrderDetailInstance,
        i.VirtualMedicineOrderDetailAttributes>('VirtualMedicineOrderDetail', {
            Id: { type: DataTypes.BIGINT, field: 'MedicineOrderDetailId', primaryKey: true, autoIncrement: true },
            MedicineOrderId: { type: DataTypes.BIGINT, field: 'MedicineOrderId' },
            OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            DrugId: { type: DataTypes.BIGINT, field: 'DrugId' },
            DrugCode: { type: DataTypes.STRING, field: 'DrugCode' },
            DrugName: { type: DataTypes.STRING, field: 'DrugName' },
            MedicineOrderDate: { type: DataTypes.DATE, field: 'MedicineOrderDate' },
            MedicineOrderStatusId: { type: DataTypes.BIGINT, field: 'MedicineOrderStatusId' },
            PharmacyId: { type: DataTypes.BIGINT, field: 'PharmacyId' },
            OrderAmount: { type: DataTypes.DECIMAL, field: 'OrderAmount' },
            DeliveryAmount: { type: DataTypes.DECIMAL, field: 'DeliveryAmount' },
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
                tableName: 'hims_virtualmedicineorderdetails',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (VirtualMedicineOrderDetail as any).associate = function (models: Models) {
        VirtualMedicineOrderDetail.belongsTo(models.VirtualMedicineOrder, { foreignKey: 'MedicineOrderId' });
    };
    return VirtualMedicineOrderDetail;
}
