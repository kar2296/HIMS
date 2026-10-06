import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.ServiceRequestInstance, i.ServiceRequestAttributes> {
    let ServiceRequest = sequelize.define<i.ServiceRequestInstance, i.ServiceRequestAttributes>('ServiceRequest', {
        Id: { type: DataTypes.BIGINT, field: 'ServiceRequestId', primaryKey: true, autoIncrement: true },
        TicketNumberIdentifier: { type: DataTypes.STRING, field: 'TicketNumberIdentifier' },
        AssetId: { type: DataTypes.BIGINT, field: 'AssetId' },
        WorkOrderId: { type: DataTypes.BIGINT, field: 'WorkOrderId' },
        Name: { type: DataTypes.STRING, field: 'Name' },
        FacilityId: { type: DataTypes.INTEGER, field: 'FacilityId' },
        FromDepartmentId: { type: DataTypes.BIGINT, field: 'FromDepartmentId' },
        ToDepartmentId: { type: DataTypes.BIGINT, field: 'ToDepartmentId' },
        PriorityId: { type: DataTypes.BIGINT, field: 'PriorityId' },
        CategoryId: { type: DataTypes.BIGINT, field: 'CategoryId' },
        SeviorityId: { type: DataTypes.BIGINT, field: 'SeviorityId' },
        ServiceTypeId: { type: DataTypes.BIGINT, field: 'ServiceTypeId' },
        ServiceRequestId: { type: DataTypes.STRING, field: 'ServiceRequestId' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        ReportedOn: { type: DataTypes.DATE, field: 'ReportedOn' },
        RequestTypeId: { type: DataTypes.BIGINT, field: 'RequestTypeId' },
        ExpectedDate: { type: DataTypes.DATE, field: 'ExpectedDate' },
        CompletedOn: { type: DataTypes.DATE, field: 'CompletedOn' },
        ServiceDescription: { type: DataTypes.BIGINT, field: 'ServiceDescription' },
        OtherInformation: { type: DataTypes.STRING, field: 'OtherInformation' },
        SubjectDetail: { type: DataTypes.STRING, field: 'SubjectDetail' },
        ServiceRequestStatusId: { type: DataTypes.BIGINT, field: 'ServiceRequestStatusId' },
        AssetTicketStatusId: { type: DataTypes.BIGINT, field: 'AssetTicketStatusId' },
        AssignTypeId: { type: DataTypes.STRING, field: 'AssignTypeId' },
        AssignedId: { type: DataTypes.STRING, field: 'AssignedId' },
        AssetName: { type: DataTypes.STRING, field: 'AssetName' },
        Impact: { type: DataTypes.STRING, field: 'Impact' },
        Attachments: { type: DataTypes.STRING, field: 'Attachments' },
        FilePath: { type: DataTypes.STRING, field: 'FilePath' },
        Remarks_Ins: { type: DataTypes.STRING, field: 'Remarks_Ins' },
        Remarks_Exvend: { type: DataTypes.STRING, field: 'Remarks_Exvend' },
        AssignedBy: { type: DataTypes.STRING, field: 'AssignedBy' },
        AssignedOn: { type: DataTypes.DATE, field: 'AssignedOn' },
        ClosedOn: { type: DataTypes.DATE, field: 'ClosedOn' },
        CompletedById: { type: DataTypes.INTEGER, field: 'CompletedById' },
        ServiceCharge: { type: DataTypes.STRING, field: 'ServiceCharge' },
        AdditionalCost: { type: DataTypes.STRING, field: 'AdditionalCost' },
        TechnicalDescription: { type: DataTypes.STRING, field: 'TechnicalDescription' },
        Parts: { type: DataTypes.STRING, field: 'Parts' },
        WorkComments: { type: DataTypes.STRING, field: 'WorkComments' },
        WorkImpact: { type: DataTypes.STRING, field: 'WorkImpact' },
        WorkCompletedOn: { type: DataTypes.DATE, field: 'WorkCompletedOn' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        WorkClosureComments: { type: DataTypes.STRING, field: 'WorkClosureComments' },
        ShortCode: { type: DataTypes.STRING, field: 'ShortCode' },
        AssetTypeId: { type: DataTypes.STRING, field: 'AssetTypeId' },
        ToFacilityId: { type: DataTypes.STRING, field: 'ToFacilityId' },
        AssignedFacilityId: { type: DataTypes.STRING, field: 'AssignedFacilityId' },
        AssignedVendorId: { type: DataTypes.STRING, field: 'AssignedVendorId' },
        ReopenComments: { type: DataTypes.STRING, field: 'ReopenComments' },
        RatingId: { type: DataTypes.BIGINT, field: 'RatingId' },
        Signature: { type: DataTypes.STRING, field: 'Signature' },
        SignPath: { type: DataTypes.STRING, field: 'SignPath' },
        Subject: { type: DataTypes.STRING, field: 'Subject' },
        ReportedBy: { type: DataTypes.STRING, field: 'ReportedBy' },
        PhoneNo: { type: DataTypes.STRING, field: 'PhoneNo' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        RequestedBy: { type: DataTypes.INTEGER, field: 'RequestedBy' },
        ReportedById: { type: DataTypes.INTEGER, field: 'ReportedById' },
        ResolvedBy: { type: DataTypes.INTEGER, field: 'ResolvedBy' },
        OnBehalfofUser: { type: DataTypes.BOOLEAN, field: 'OnBehalfofUser' },
        IsResovedOnPhone: { type: DataTypes.BOOLEAN, field: 'IsResovedOnPhone' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'hims_servicerequest',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (ServiceRequest as any).associate = function (models: Models) {
        ServiceRequest.belongsTo(models.Department, { as: 'FromDepartment', foreignKey: 'FromDepartmentId' });
        ServiceRequest.belongsTo(models.Department, { as: 'ToDepartment', foreignKey: 'ToDepartmentId' });
        ServiceRequest.belongsTo(models.Facility);
        ServiceRequest.belongsTo(models.ReferenceValue, { as: 'ServiceRequestStatus', targetKey: 'ReferenceValueCodeId' });
        ServiceRequest.belongsTo(models.ReferenceValue, {
            as: 'AssetServiceType', foreignKey: 'ServiceTypeId',
            targetKey: 'ReferenceValueCodeId'

        });
        ServiceRequest.belongsTo(models.ReferenceValue, { as: 'AssetTicketStatus', targetKey: 'ReferenceValueCodeId' });
        ServiceRequest.belongsTo(models.ReferenceValue, {
            as: 'TicketCategory', foreignKey: 'CategoryId', targetKey: 'ReferenceValueCodeId'
        });
        ServiceRequest.belongsTo(models.ReferenceValue, { as: 'Seviority', targetKey: 'ReferenceValueCodeId' });
        ServiceRequest.belongsTo(models.User, { as: 'Assigned', foreignKey: 'AssignedId' });
        ServiceRequest.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        ServiceRequest.belongsTo(models.ReferenceValue, { as: 'AssignType', targetKey: 'ReferenceValueCodeId' });
        ServiceRequest.belongsTo(models.ReferenceValue, { as: 'Priority', targetKey: 'ReferenceValueCodeId' });
        ServiceRequest.belongsTo(models.User, { as: 'CreatedById', foreignKey: 'CreatedBy' });
        ServiceRequest.belongsTo(models.User, { as: 'CompletedBy', foreignKey: 'CompletedById' });
        ServiceRequest.belongsTo(models.Asset, { as: 'Asset', foreignKey: 'AssetId' });
        ServiceRequest.belongsTo(models.VendorMaster, { as: 'AssignedVendor', foreignKey: 'AssignedVendorId' });
        ServiceRequest.belongsTo(models.Facility, { as: 'AssignedFacility', foreignKey: 'AssignedFacilityId' });
    };
    return ServiceRequest;
}
