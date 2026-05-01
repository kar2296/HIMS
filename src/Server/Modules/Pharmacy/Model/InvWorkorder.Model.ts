import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.InvWorkorderInstance, i.InvWorkorderAttributes> {
    let InvWorkorder = sequelize.define<i.InvWorkorderInstance, i.InvWorkorderAttributes>('InvWorkorder', {
        Id: { type: DataTypes.BIGINT, field: 'InvWorkorderId', primaryKey: true, autoIncrement: true },
        InvWorkorderNo: { type: DataTypes.STRING, field: 'InvWorkorderNo' },
        InvWorkorderDate: { type: DataTypes.DATE, field: 'InvWorkorderDate' },
        InvWorkorderTypeId: { type: DataTypes.BIGINT, field: 'InvWorkorderTypeId' },
        InvWorkorderStatusId: { type: DataTypes.BIGINT, field: 'InvWorkorderStatusId' },
        StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
        StoreName: { type: DataTypes.STRING, field: 'StoreName' },
        ParticularId: { type: DataTypes.BIGINT, field: 'ParticularId' },
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
        TotalGrossAmount: { type: DataTypes.DECIMAL, field: 'TotalGrossAmount' },
        TotalDiscountAmount: { type: DataTypes.DECIMAL, field: 'TotalDiscountAmount' },
        TotalGstAmount: { type: DataTypes.DECIMAL, field: 'TotalGstAmount' },
        TotalInGstAmount: { type: DataTypes.DECIMAL, field: 'TotalInGstAmount' },
        TotalCGstAmount: { type: DataTypes.DECIMAL, field: 'TotalCGstAmount' },
        TotalSGstAmount: { type: DataTypes.DECIMAL, field: 'TotalSGstAmount' },
        OtherCharges: { type: DataTypes.DECIMAL, field: 'OtherCharges' },
        RoundOff: { type: DataTypes.DECIMAL, field: 'RoundOff' },
        TotalNetAmount: { type: DataTypes.DECIMAL, field: 'TotalNetAmount' },
        TotalAmount: { type: DataTypes.DECIMAL, field: 'TotalAmount' },
        TransportCharges: { type: DataTypes.DECIMAL, field: 'TransportCharges' },
        TransportChargesGstId: { type: DataTypes.BIGINT, field: 'TransportChargesGstId' },
        TransportChargesGstPercentage: { type: DataTypes.DECIMAL, field: 'TransportChargesGstPercentage' },
        TransportChargesGstAmount: { type: DataTypes.DECIMAL, field: 'TransportChargesGstAmount' },
        LeviesandTaxes: { type: DataTypes.STRING, field: 'LeviesandTaxes' },
        DeliverySchedule: { type: DataTypes.STRING, field: 'DeliverySchedule' },
        TermsofDispatch: { type: DataTypes.STRING, field: 'TermsofDispatch' },
        TermsofPayment: { type: DataTypes.STRING, field: 'TermsofPayment' },
        PaymentTermsId: { type: DataTypes.BIGINT, field: 'PaymentTermsId' },
        OtherChargesGstId: { type: DataTypes.BIGINT, field: 'OtherChargesGstId' },
        OtherChargesGstPercentage: { type: DataTypes.DECIMAL, field: 'OtherChargesGstPercentage' },
        OtherChargesGstAmount: { type: DataTypes.DECIMAL, field: 'OtherChargesGstAmount' },
        Remarks: { type: DataTypes.STRING, field: 'Remarks' },
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
            tableName: 'inventoryworkorder',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (InvWorkorder as any).associate = function (models: Models) {
        InvWorkorder.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        InvWorkorder.belongsTo(models.Department, { foreignKey: 'DepartmentId' });
        InvWorkorder.belongsTo(models.StoreMaster, { as: 'StoreMaster', foreignKey: 'StoreMasterId' });
        InvWorkorder.belongsTo(models.VendorMaster, { foreignKey: 'VendorMasterId' });
        InvWorkorder.belongsTo(models.User, { as: 'RaisedUser', foreignKey: 'RaisedBy' });
        InvWorkorder.belongsTo(models.User, { as: 'ApprovedUser', foreignKey: 'ApprovedBy' });
        InvWorkorder.belongsTo(models.User, { as: 'AuthorizedUser', foreignKey: 'AuthorizedBy' });
        InvWorkorder.belongsTo(models.ReferenceValue, {
            as: 'InvWorkorderStatus',
            foreignKey: 'InvWorkorderStatusId', targetKey: 'ReferenceValueCodeId'
        });
        InvWorkorder.belongsTo(models.ReferenceValue, {
            as: 'InvWorkorderType', targetKey: 'ReferenceValueCodeId',
            foreignKey: 'InvWorkorderTypeId'
        });
        // InvWorkorder.hasMany(models.InvWorkorderDetail);
    };

    return InvWorkorder;
}
