import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientBillSplitDetailsInstance, i.PatientBillSplitDetailsAttributes> {
    let PatientBillSplitDetails = sequelize.define<i.PatientBillSplitDetailsInstance, i.PatientBillSplitDetailsAttributes>(
        'PatientBillSplitDetails', {
            Id: { type: DataTypes.BIGINT, field: 'PatientBillSplitDetailId', primaryKey: true, autoIncrement: true },
            PatientBillId: { type: DataTypes.BIGINT, field: 'PatientBillId' },
            PatientBillDetailId: { type: DataTypes.BIGINT, field: 'PatientBillDetailId' },
            PatientBillSummaryId: { type: DataTypes.BIGINT, field: 'PatientBillSummaryId' },
            VisitGuarantorId: { type: DataTypes.BIGINT, field: 'VisitGuarantorId' },
            BillDateTime: { type: DataTypes.DATE, field: 'BillDateTime' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
            DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
            ServiceId: { type: DataTypes.BIGINT, field: 'ServiceId' },
            ServiceName: { type: DataTypes.BIGINT, field: 'ServiceName' },
            ItemAmount: { type: DataTypes.DECIMAL, field: 'ItemAmount' },
            ItemDiscount: { type: DataTypes.DECIMAL, field: 'ItemDiscount' },
            FreeItemAmount: { type: DataTypes.DECIMAL, field: 'FreeItemAmount' },
            FreeItemDiscount: { type: DataTypes.DECIMAL, field: 'FreeItemDiscount' },
            IsSplit: { type: DataTypes.BOOLEAN, field: 'IsSplit' },
            SplitGuarantorId: { type: DataTypes.BIGINT, field: 'SplitGuarantorId' },
            SplitItemAmount: { type: DataTypes.DECIMAL, field: 'SplitItemAmount' },
            SplitItemDiscount: { type: DataTypes.DECIMAL, field: 'SplitItemDiscount' },
            FreeSplitItemAmount: { type: DataTypes.DECIMAL, field: 'FreeSplitItemAmount' },
            FreeSplitItemDiscount: { type: DataTypes.DECIMAL, field: 'FreeSplitItemDiscount' },
            IsSupplementary: { type: DataTypes.BOOLEAN, field: 'IsSupplementary' },
            IsPackageItem: { type: DataTypes.BOOLEAN, field: 'IsPackageItem' },
            PackageId: { type: DataTypes.BIGINT, field: 'PackageId' },
            PackageName: { type: DataTypes.STRING, field: 'PackageName' },
            IsExclude: { type: DataTypes.BOOLEAN, field: 'IsExclude' },
            IsNightCharge: { type: DataTypes.BOOLEAN, field: 'IsNightCharge' },
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
            AliasId: { type: DataTypes.STRING, field: 'AliasId' },
            AliasName: { type: DataTypes.STRING, field: 'AliasName' },
        },
        {
            indexes: [],
            timestamps: true,
            tableName: 'patientbillsplitdetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientBillSplitDetails as any).associate = function (models: Models) {
        PatientBillSplitDetails.belongsTo(models.PatientBillSummary);
        PatientBillSplitDetails.belongsTo(models.PatientBillDetails, { foreignKey: 'PatientBillDetailId' });
    };
    return PatientBillSplitDetails;
}
