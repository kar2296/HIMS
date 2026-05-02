import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.OpticalEntryInstance, i.OpticalEntryAttributes> {
    let OpticalEntry = sequelize.define<i.OpticalEntryInstance, i.OpticalEntryAttributes>('OpticalEntry', {
        Id: { type: DataTypes.BIGINT, field: 'OpticalEntryId', primaryKey: true, autoIncrement: true },
        OrderNo: { type: DataTypes.STRING, field: 'OrderNo' },
        OrderDate: { type: DataTypes.DATE, field: 'OrderDate' },
        OrderStatusId: { type: DataTypes.INTEGER, field: 'OrderStatusId' },
        FacilityId: { type: DataTypes.INTEGER, field: 'FacilityId' },
        OrganizationId: { type: DataTypes.INTEGER, field: 'OrganizationId' },
        PatientId: { type: DataTypes.INTEGER, field: 'PatientId' },
        DoctorId: { type: DataTypes.INTEGER, field: 'DoctorId' },
        AddressLine1: { type: DataTypes.STRING, field: 'AddressLine1' },
        AddressLine2: { type: DataTypes.STRING, field: 'AddressLine2' },
        OpticalSize: { type: DataTypes.STRING, field: 'OpticalSize' },
        FrameColor: { type: DataTypes.STRING, field: 'FrameColor' },
        LensTypeId: { type: DataTypes.BIGINT, field: 'LensTypeId' },
        GrindingCharges: { type: DataTypes.DECIMAL, field: 'GrindingCharges' },
        Remarks: { type: DataTypes.STRING, field: 'Remarks' },
        RightDVSPH: { type: DataTypes.STRING, field: 'RightDVSPH' },
        RightDVCYL: { type: DataTypes.STRING, field: 'RightDVCYL' },
        RightDVAXIS: { type: DataTypes.STRING, field: 'RightDVAXIS' },
        RightNVSPH: { type: DataTypes.STRING, field: 'RightNVSPH' },
        RightNVCYL: { type: DataTypes.STRING, field: 'RightNVCYL' },
        RightNVAXIS: { type: DataTypes.STRING, field: 'RightNVAXIS' },
        LeftDVSPH: { type: DataTypes.STRING, field: 'LeftDVSPH' },
        LeftDVCYL: { type: DataTypes.STRING, field: 'LeftDVCYL' },
        LeftDVAXIS: { type: DataTypes.STRING, field: 'LeftDVAXIS' },
        LeftNVSPH: { type: DataTypes.STRING, field: 'LeftNVSPH' },
        LeftNVCYL: { type: DataTypes.STRING, field: 'LeftNVCYL' },
        LeftNVAXIS: { type: DataTypes.STRING, field: 'LeftNVAXIS' },
        DeliveryDate: { type: DataTypes.DATE, field: 'DeliveryDate' },
        TotalAmount: { type: DataTypes.DECIMAL, field: 'TotalAmount' },
        AdvanceAmount: { type: DataTypes.DECIMAL, field: 'AdvanceAmount' },
        BalanceAmount: { type: DataTypes.DECIMAL, field: 'BalanceAmount' },
        ReceivedBy: { type: DataTypes.INTEGER, field: 'ReceivedBy' },
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
            tableName: 'opticalentry',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (OpticalEntry as any).associate = function (models: Models) {
        OpticalEntry.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        OpticalEntry.belongsTo(models.Patient, { foreignKey: 'PatientId' });
    };
    return OpticalEntry;
}
