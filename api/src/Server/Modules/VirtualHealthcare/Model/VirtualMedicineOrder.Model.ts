import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.VirtualMedicineOrderInstance, i.VirtualMedicineOrderAttributes> {
    let VirtualMedicineOrder = sequelize.define<i.VirtualMedicineOrderInstance, i.VirtualMedicineOrderAttributes>('VirtualMedicineOrder', {
        Id: { type: DataTypes.BIGINT, field: 'MedicineOrderId', primaryKey: true, autoIncrement: true },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        MedicineOrderNo: { type: DataTypes.STRING, field: 'MedicineOrderNo' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        FirstName: { type: DataTypes.STRING, field: 'FirstName' },
        LastName: { type: DataTypes.STRING, field: 'LastName' },
        PrescriptionAttachment: { type: DataTypes.STRING, field: 'PrescriptionAttachment' },
        InvoiceAttachment: { type: DataTypes.STRING, field: 'InvoiceAttachment' },
        MedicineOrderDate: { type: DataTypes.DATE, field: 'MedicineOrderDate' },
        DeliveryDate: { type: DataTypes.DATE, field: 'DeliveryDate' },
        DeliveryAddress: { type: DataTypes.STRING, field: 'DeliveryAddress' },
        PinCode: { type: DataTypes.STRING, field: 'PinCode' },
        CityId: { type: DataTypes.INTEGER, field: 'CityId' },
        StateId: { type: DataTypes.BIGINT, field: 'StateId' },
        LandMark: { type: DataTypes.STRING, field: 'LandMark' },
        latitudeId: { type: DataTypes.FLOAT, field: 'latitudeId' },
        longitudeId: { type: DataTypes.FLOAT, field: 'longitudeId' },
        MedicineOrderStatusId: { type: DataTypes.BIGINT, field: 'MedicineOrderStatusId' },
        PhoneNo: { type: DataTypes.STRING, field: 'PhoneNo' },
        PharmacyId: { type: DataTypes.INTEGER, field: 'PharmacyId' },
        PaymentModeId: { type: DataTypes.INTEGER, field: 'PaymentModeId' },
        OrderAmount: { type: DataTypes.DECIMAL, field: 'OrderAmount' },
        DeliveryAmount: { type: DataTypes.DECIMAL, field: 'DeliveryAmount' },
        TotalNetAmount: { type: DataTypes.DECIMAL, field: 'TotalNetAmount' },
        OrderComments: { type: DataTypes.STRING, field: 'OrderComments' },
        DeliveryPerson: { type: DataTypes.STRING, field: 'DeliveryPerson' },
        DeliveryComments: { type: DataTypes.STRING, field: 'DeliveryComments' },
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
            tableName: 'hims_virtualmedicineorder',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (VirtualMedicineOrder as any).associate = function (models: Models) {
        VirtualMedicineOrder.belongsTo(models.Patient);
        VirtualMedicineOrder.belongsTo(models.ReferenceValue, { as: 'MedicineOrderStatus', targetKey: 'ReferenceValueCodeId' });
        VirtualMedicineOrder.belongsTo(models.ReferenceValue, { as: 'PaymentMode', targetKey: 'ReferenceValueCodeId' });
        VirtualMedicineOrder.hasMany(models.VirtualMedicineOrderDetail, { foreignKey: 'MedicineOrderId' });
        VirtualMedicineOrder.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        VirtualMedicineOrder.belongsTo(models.Facility, { foreignKey: 'PharmacyId', as: 'PharmacyFacility' });
        VirtualMedicineOrder.belongsTo(models.Facility, { foreignKey: 'FacilityId', as: 'Facility' });
    };
    return VirtualMedicineOrder;
}
