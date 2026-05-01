import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientEmarInstance, i.PatientEmarAttributes> {
    let PatientEmar = sequelize.define<i.PatientEmarInstance, i.PatientEmarAttributes>('PatientEmar', {
        Id: { type: DataTypes.BIGINT, field: 'PatienteMARId', primaryKey: true, autoIncrement: true },
        PrescriptionDetailId: { type: DataTypes.BIGINT, field: 'PrescriptionDetailId' },
        PatientDispenseId: { type: DataTypes.BIGINT, field: 'PatientDispenseId' },
        DispenseDateTime: { type: DataTypes.DATE, field: 'DispenseDateTime' },
        ItemMasterId: { type: DataTypes.BIGINT, field: 'ItemMasterId' },
        ItemCode: { type: DataTypes.STRING, field: 'ItemCode' },
        ItemName: { type: DataTypes.STRING, field: 'ItemName' },
        DrugCode: { type: DataTypes.STRING, field: 'DrugCode' },
        DrugName: { type: DataTypes.STRING, field: 'DrugName' },
        DrugFrequencyId: { type: DataTypes.BIGINT, field: 'DrugFrequencyId' },
        DrugRouteId: { type: DataTypes.BIGINT, field: 'DrugRouteId' },
        Dosage: { type: DataTypes.STRING, field: 'Dosage' },
        Duration: { type: DataTypes.BIGINT, field: 'Duration' },
        DurationPeriodId: { type: DataTypes.BIGINT, field: 'DurationPeriodId' },
        PrescriptionQuantity: { type: DataTypes.BIGINT, field: 'PrescriptionQuantity' },
        PriorityId: { type: DataTypes.BIGINT, field: 'PriorityId' },
        CategoryId: { type: DataTypes.BIGINT, field: 'CategoryId' },
        SubCategoryId: { type: DataTypes.BIGINT, field: 'SubCategoryId' },
        ProductTypeId: { type: DataTypes.BIGINT, field: 'ProductTypeId' },
        SubProductTypeId: { type: DataTypes.BIGINT, field: 'SubProductTypeId' },
        GenericId: { type: DataTypes.BIGINT, field: 'GenericId' },
        GenericName: { type: DataTypes.STRING, field: 'GenericName' },
        ManufacturerId: { type: DataTypes.BIGINT, field: 'ManufacturerId' },
        ManufacturerName: { type: DataTypes.STRING, field: 'ManufacturerName' },
        ScheduleTypeId: { type: DataTypes.BIGINT, field: 'ScheduleTypeId' },
        ScheduleTypeDescription: { type: DataTypes.STRING, field: 'ScheduleTypeDescription' },
        BaseUomId: { type: DataTypes.BIGINT, field: 'BaseUomId' },
        SaleUomId: { type: DataTypes.BIGINT, field: 'SaleUomId' },
        RequestedQuantity: { type: DataTypes.DECIMAL, field: 'RequestedQuantity' },
        DispensedQuantity: { type: DataTypes.DECIMAL, field: 'DispensedQuantity' },
        StockItemId: { type: DataTypes.BIGINT, field: 'StockItemId' },
        StockSerialItemId: { type: DataTypes.BIGINT, field: 'StockSerialItemId' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        BatchId: { type: DataTypes.BIGINT, field: 'BatchId' },
        ExpiryDate: { type: DataTypes.DATE, field: 'ExpiryDate' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
        DispensedStatusId: { type: DataTypes.BIGINT, field: 'DispensedStatusId' },
        PrescriptionStatusId: { type: DataTypes.BIGINT, field: 'PrescriptionStatusId' },
        eMARStatusId: { type: DataTypes.BIGINT, field: 'eMARStatusId' },
        AdministerStartDate: { type: DataTypes.DATE, field: 'AdministerStartDate' },
        AdministerEndDate: { type: DataTypes.DATE, field: 'AdministerEndDate' },
        AdministerStatusId: { type: DataTypes.BIGINT, field: 'AdministerStatusId' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' }
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'patientemar',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (PatientEmar as any).associate = function(models: Models) {
                    PatientEmar.belongsTo(models.PrescriptionDetail, { foreignKey: 'PrescriptionDetailId' });
                    // PatientEmar.hasMany(models.Prescription);
                };
 return PatientEmar;
}
