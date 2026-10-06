import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.CustomerBillsInstance, i.CustomerBillsAttributes> {
    let CustomerBills = sequelize.define<i.CustomerBillsInstance, i.CustomerBillsAttributes>('CustomerBills', {
        Id: { type: DataTypes.BIGINT, field: 'CustomerBillId', primaryKey: true, autoIncrement: true },
        BillNumber: { type: DataTypes.STRING, field: 'BillNumber' },
        BillDateTime: { type: DataTypes.DATE, field: 'BillDateTime' },
        BillTypeId: { type: DataTypes.BIGINT, field: 'BillTypeId' },
        BillPriorityId: { type: DataTypes.BIGINT, field: 'BillPriorityId' },
        BillAmount: { type: DataTypes.DECIMAL, field: 'BillAmount' },
        GrossAmount: { type: DataTypes.DECIMAL, field: 'GrossAmount' },
        DiscountTypeId: { type: DataTypes.BIGINT, field: 'DiscountTypeId' },
        DiscountModeId: { type: DataTypes.BIGINT, field: 'DiscountModeId' },
        DiscountValue: { type: DataTypes.DECIMAL, field: 'DiscountValue' },
        DiscountAmount: { type: DataTypes.DECIMAL, field: 'DiscountAmount' },
        DiscountApprovedBy: { type: DataTypes.BIGINT, field: 'DiscountApprovedBy' },
        LineTotalDiscount: { type: DataTypes.DECIMAL, field: 'LineTotalDiscount' },
        NetAmountBeforeGst: { type: DataTypes.DECIMAL, field: 'NetAmountBeforeGst' },
        GstAmount: { type: DataTypes.DECIMAL, field: 'GstAmount' },
        CGstAmount: { type: DataTypes.DECIMAL, field: 'CGstAmount' },
        SGstAmount: { type: DataTypes.DECIMAL, field: 'SGstAmount' },
        RoundOffValue: { type: DataTypes.DECIMAL, field: 'RoundOffValue' },
        NetAmount: { type: DataTypes.DECIMAL, field: 'NetAmount' },
        CustomerBillStatusId: { type: DataTypes.INTEGER, field: 'CustomerBillStatusId' },
        BilledCounter: { type: DataTypes.INTEGER, field: 'BilledCounter' },
        BillGeneratedBy: { type: DataTypes.BIGINT, field: 'BillGeneratedBy' },
        BillApprovedBy: { type: DataTypes.BIGINT, field: 'BillApprovedBy' },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        FacilityName: { type: DataTypes.STRING, field: 'FacilityName' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        DepartmentName: { type: DataTypes.STRING, field: 'DepartmentName' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        StoreName: { type: DataTypes.STRING, field: 'StoreName' },
        CustomerMasterId: { type: DataTypes.BIGINT, field: 'CustomerMasterId' },
        CustomerName: { type: DataTypes.STRING, field: 'CustomerName' },
        CustomerTypeId: { type: DataTypes.BIGINT, field: 'CustomerTypeId' },
        GSTNumber: { type: DataTypes.STRING, field: 'GSTNumber' },
        Mobile: { type: DataTypes.STRING, field: 'Mobile' },
        CancelReasonId: { type: DataTypes.BIGINT, field: 'CancelReasonId' },
        CancelAmount: { type: DataTypes.DECIMAL, field: 'CancelAmount' },
        CancelledBy: { type: DataTypes.BIGINT, field: 'CancelledBy' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
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
            tableName: 'customerbills',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (CustomerBills as any).associate = function (models: Models) {
        CustomerBills.hasMany(models.CustomerBillDetails, { foreignKey: 'CustomerBillId' });
        CustomerBills.belongsTo(models.ReferenceValue, { as: 'CustomerBillStatus', targetKey: 'ReferenceValueCodeId' });
        CustomerBills.belongsTo(models.ReferenceValue, { as: 'BillPriority', targetKey: 'ReferenceValueCodeId' });
        CustomerBills.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
        CustomerBills.belongsTo(models.StoreMaster, { foreignKey: 'StoreMasterId' });
        CustomerBills.belongsTo(models.CustomerMaster, { foreignKey: 'CustomerMasterId' });
        CustomerBills.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        CustomerBills.belongsTo(models.User, { as: 'GeneratedUser', foreignKey: 'BillGeneratedBy' });
        CustomerBills.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        CustomerBills.belongsTo(models.User, { as: 'ApprovedUser', foreignKey: 'BillApprovedBy' });
        CustomerBills.belongsTo(models.User, { as: 'CancelledUser', foreignKey: 'CancelledBy' });
    };
    return CustomerBills;
}
