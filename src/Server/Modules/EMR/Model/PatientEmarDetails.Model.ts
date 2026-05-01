import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientEmarDetailsInstance, i.PatientEmarDetailsAttributes> {
    let PatientEmarDetails = sequelize.define<i.PatientEmarDetailsInstance, i.PatientEmarDetailsAttributes>('PatientEmarDetails', {
        Id: { type: DataTypes.BIGINT, field: 'PatienteMARDetailsId', primaryKey: true, autoIncrement: true },
        PatienteMARId: { type: DataTypes.BIGINT, field: 'PatienteMARId' },
        DrugCode: { type: DataTypes.STRING, field: 'DrugCode' },
        DrugName: { type: DataTypes.STRING, field: 'DrugName' },
        DrugFrequencyId: { type: DataTypes.BIGINT, field: 'DrugFrequencyId' },
        DrugRouteId: { type: DataTypes.BIGINT, field: 'DrugRouteId' },
        Dosage: { type: DataTypes.STRING, field: 'Dosage' },
        Duration: { type: DataTypes.BIGINT, field: 'Duration' },
        DurationPeriodId: { type: DataTypes.BIGINT, field: 'DurationPeriodId' },
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
        DispensedStatusId: { type: DataTypes.BIGINT, field: 'DispensedStatusId' },
        PrescriptionStatusId: { type: DataTypes.BIGINT, field: 'PrescriptionStatusId' },
        AdministerStartDate: { type: DataTypes.DATE, field: 'AdministerStartDate' },
        AdministerEndDate: { type: DataTypes.DATE, field: 'AdministerEndDate' },
        AdministerStatusId: { type: DataTypes.BIGINT, field: 'AdministerStatusId' },
        AdministeredBy: { type: DataTypes.BIGINT, field: 'AdministeredBy' },
        PrescriptionQuantity: { type: DataTypes.DECIMAL, field: 'PrescriptionQuantity' },
        DispensedQuantity: { type: DataTypes.DECIMAL, field: 'DispensedQuantity' },
        AdministerQuantity: { type: DataTypes.DECIMAL, field: 'AdministerQuantity' },
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
            tableName: 'encounterdoctors',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });



    return PatientEmarDetails;
}
