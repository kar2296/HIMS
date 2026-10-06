import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientStockRequestsInstance, i.PatientStockRequestsAttributes> {
    let PatientStockRequests = sequelize.define<i.PatientStockRequestsInstance,
        i.PatientStockRequestsAttributes>('PatientStockRequests', {
            Id: { type: DataTypes.BIGINT, field: 'PatientStockRequestId', primaryKey: true, autoIncrement: true },
            PatientRequestNumber: { type: DataTypes.STRING, field: 'PatientRequestNumber' },
            PatientRequestDateTime: { type: DataTypes.DATE, field: 'PatientRequestDateTime' },
            PatientRequestTypeId: { type: DataTypes.BIGINT, field: 'PatientRequestTypeId' },
            PatientRequestSubTypeId: { type: DataTypes.BIGINT, field: 'PatientRequestSubTypeId' },
            PatientRequestStatusId: { type: DataTypes.BIGINT, field: 'PatientRequestStatusId' },
            PatientRequestPriorityId: { type: DataTypes.BIGINT, field: 'PatientRequestPriorityId' },
            PrescriptionId: { type: DataTypes.BIGINT, field: 'PrescriptionId' },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            PatientTypeId: { type: DataTypes.BIGINT, field: 'PatientTypeId' },
            PatientMRN: { type: DataTypes.STRING, field: 'PatientMRN' },
            PatientName: { type: DataTypes.STRING, field: 'PatientName' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
            DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
            ReferralId: { type: DataTypes.BIGINT, field: 'ReferralId' },
            ReferralName: { type: DataTypes.STRING, field: 'ReferralName' },
            DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
            GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
            GuarantorTypeId: { type: DataTypes.BIGINT, field: 'GuarantorTypeId' },
            GuarantorName: { type: DataTypes.STRING, field: 'GuarantorName' },
            LocationId: { type: DataTypes.BIGINT, field: 'LocationId' },
            WardId: { type: DataTypes.BIGINT, field: 'WardId' },
            RoomId: { type: DataTypes.BIGINT, field: 'RoomId' },
            BedId: { type: DataTypes.BIGINT, field: 'BedId' },
            OTRoomId: { type: DataTypes.BIGINT, field: 'OTRoomId' },
            OTRegisterId: { type: DataTypes.BIGINT, field: 'OTRegisterId' },
            OTIdentifier: { type: DataTypes.STRING, field: 'OTIdentifier' },
            ToStoreId: { type: DataTypes.BIGINT, field: 'ToStoreId' },
            ToStoreName: { type: DataTypes.STRING, field: 'ToStoreName' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            OrganisationId: { type: DataTypes.BIGINT, field: 'OrganisationId' },
            TotalGrossAmount: { type: DataTypes.DECIMAL, field: 'TotalGrossAmount' },
            TotalGstAmount: { type: DataTypes.DECIMAL, field: 'TotalGstAmount' },
            TotalNetAmount: { type: DataTypes.DECIMAL, field: 'TotalNetAmount' },
            CancelledBy: { type: DataTypes.INTEGER, field: 'CancelledBy' },
            CancelledDate: { type: DataTypes.DATE, field: 'CancelledDate' },
            CancelledComments: { type: DataTypes.STRING, field: 'CancelledComments' },
            CancelReasonId: { type: DataTypes.BIGINT, field: 'CancelReasonId' },
            RequestedBy: { type: DataTypes.INTEGER, field: 'RequestedBy' },
            RequestedDate: { type: DataTypes.DATE, field: 'RequestedDate' },
            RequesterComments: { type: DataTypes.STRING, field: 'RequesterComments' },
            AuthorizedBy: { type: DataTypes.INTEGER, field: 'AuthorizedBy' },
            AuthorizedDate: { type: DataTypes.DATE, field: 'AuthorizedDate' },
            AuthorizerComments: { type: DataTypes.STRING, field: 'AuthorizerComments' },
            ApprovedBy: { type: DataTypes.INTEGER, field: 'ApprovedBy' },
            ApprovedDate: { type: DataTypes.DATE, field: 'ApprovedDate' },
            ApproverComments: { type: DataTypes.STRING, field: 'ApproverComments' },
            RemarkId: { type: DataTypes.BIGINT, field: 'RemarkId' },
            IsSurgery: { type: DataTypes.BOOLEAN, field: 'IsSurgery' },
            IsCash: { type: DataTypes.BOOLEAN, field: 'IsCash' },
            DispenseDateTime: { type: DataTypes.DATE, field: 'DispenseDateTime' },
            DispensedBy: { type: DataTypes.INTEGER, field: 'DispensedBy' },
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
            tableName: 'patientstockrequests',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientStockRequests as any).associate = function (models: Models) {
        PatientStockRequests.belongsTo(models.Facility, { foreignKey: 'FacilityId' });
        PatientStockRequests.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        PatientStockRequests.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        PatientStockRequests.belongsTo(models.ReferenceValue, {
            as: 'PatientRequestPriority',
            targetKey: 'ReferenceValueCodeId'
        });
        PatientStockRequests.belongsTo(models.StoreMaster, { as: 'ToStore', foreignKey: 'ToStoreId' });
        PatientStockRequests.belongsTo(models.WardMaster, { foreignKey: 'WardId' });
        PatientStockRequests.belongsTo(models.WardRoomMaster, { foreignKey: 'RoomId' });
        PatientStockRequests.belongsTo(models.WardRoomBedMaster, { foreignKey: 'BedId' });
        PatientStockRequests.belongsTo(models.ReferenceValue,
            { as: 'PatientRequestStatus', targetKey: 'ReferenceValueCodeId' });
        PatientStockRequests.belongsTo(models.ReferenceValue,
            { as: 'PatientRequestType', targetKey: 'ReferenceValueCodeId' });
        PatientStockRequests.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        PatientStockRequests.belongsTo(models.User, { as: 'RequestedUser', foreignKey: 'RequestedBy' });
        PatientStockRequests.belongsTo(models.User, { as: 'ApprovedUser', foreignKey: 'ApprovedBy' });
        PatientStockRequests.belongsTo(models.User, { as: 'AuthorizedUser', foreignKey: 'AuthorizedBy' });
        PatientStockRequests.belongsTo(models.User, { as: 'CancelledUser', foreignKey: 'CancelledBy' });
        PatientStockRequests.belongsTo(models.User, { as: 'Doctor', foreignKey: 'DoctorId' });
        PatientStockRequests.belongsTo(models.User, { as: 'DispensedUser', foreignKey: 'DispensedBy' });
        PatientStockRequests.hasMany(models.PatientStockRequestDetails);
    };

    return PatientStockRequests;
}
