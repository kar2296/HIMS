import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ServiceBillEntryInstance, i.ServiceBillEntryAttributes> {
    let ServiceBillEntry = sequelize.define<i.ServiceBillEntryInstance, i.ServiceBillEntryAttributes>('ServiceBillEntry', {
        Id: { type: DataTypes.BIGINT, field: 'ServiceBillId', primaryKey: true, autoIncrement: true },
        ServiceBillNo: { type: DataTypes.STRING, field: 'ServiceBillNo' },
        ServiceBillDate: { type: DataTypes.DATE, field: 'ServiceBillDate' },
        ServiceBillTypeId: { type: DataTypes.BIGINT, field: 'ServiceBillTypeId' },
        ServiceBillEntryTypeId: { type: DataTypes.BIGINT, field: 'ServiceBillEntryTypeId' },
        ServiceBillStatusId: { type: DataTypes.BIGINT, field: 'ServiceBillStatusId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        DepartmentName: { type: DataTypes.STRING, field: 'DepartmentName' },
        VendorMasterId: { type: DataTypes.BIGINT, field: 'VendorMasterId' },
        VendorName: { type: DataTypes.STRING, field: 'VendorName' },
        RaisedBy: { type: DataTypes.INTEGER, field: 'RaisedBy' },
        RaisedDate: { type: DataTypes.DATE, field: 'RaisedDate' },
        RaisedComments: { type: DataTypes.STRING, field: 'RaisedComments' },
        AuthorizedBy: { type: DataTypes.INTEGER, field: 'AuthorizedBy' },
        AuthorizedDate: { type: DataTypes.DATE, field: 'AuthorizedDate' },
        AuthorizerComments: { type: DataTypes.STRING, field: 'AuthorizerComments' },
        ApprovedBy: { type: DataTypes.INTEGER, field: 'ApprovedBy' },
        ApprovedDate: { type: DataTypes.DATE, field: 'ApprovedDate' },
        ApproverComments: { type: DataTypes.STRING, field: 'ApproverComments' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        OrganisationId: { type: DataTypes.BIGINT, field: 'OrganisationId' },
        Particulars: { type: DataTypes.DECIMAL, field: 'Particulars' },
        Amount: { type: DataTypes.DECIMAL, field: 'Amount' },
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
            tableName: 'servicebillentrys',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (ServiceBillEntry as any).associate = function (models: Models) {
        ServiceBillEntry.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        ServiceBillEntry.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
        ServiceBillEntry.belongsTo(models.VendorMaster, { foreignKey: 'VendorMasterId' });
        ServiceBillEntry.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        ServiceBillEntry.belongsTo(models.ReferenceValue, {
            as: 'ServiceBillStatus',
            foreignKey: 'ServiceBillStatusId', targetKey: 'ReferenceValueCodeId'
        });
        ServiceBillEntry.belongsTo(models.ReferenceValue, {
            as: 'ServiceBillType', targetKey: 'ReferenceValueCodeId',
            foreignKey: 'ServiceBillTypeId'
        });
    };

    return ServiceBillEntry;
}
