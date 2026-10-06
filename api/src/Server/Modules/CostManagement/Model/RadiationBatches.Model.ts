import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.RadiationBatchesInstance, i.RadiationBatchesAttributes> {
    let RadiationBatches = sequelize.define<i.RadiationBatchesInstance, i.RadiationBatchesAttributes>('RadiationBatches', {
        Id: { type: DataTypes.BIGINT, field: 'RadiationBatchesId', primaryKey: true, autoIncrement: true },
        RadiationBatchesId: { type: DataTypes.BIGINT, field: 'RadiationBatchesId' },
        EventDate: { type: DataTypes.DATE, field: 'EventDate' },
        EventDescription: { type: DataTypes.STRING, field: 'EventDescription' },
        TicketNumberIdentifier: { type: DataTypes.BIGINT, field: 'TicketNumberIdentifier' },
        RequestTypeId: { type: DataTypes.BIGINT, field: 'RequestTypeId' },
        WorkOrderId: { type: DataTypes.BIGINT, field: 'WorkOrderId' },
        AssetName: { type: DataTypes.STRING, field: 'AssetName' },
        RequesterId: { type: DataTypes.BIGINT, field: 'RequesterId' },
        RequesterName: { type: DataTypes.STRING, field: 'RequesterName' },
        Name: { type: DataTypes.STRING, field: 'Name' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        FromDepartmentId: { type: DataTypes.BIGINT, field: 'FromDepartmentId' },
        ToDepartmentId: { type: DataTypes.BIGINT, field: 'ToDepartmentId' },
        PriorityId: { type: DataTypes.BIGINT, field: 'PriorityId' },
        SeviorityId: { type: DataTypes.BIGINT, field: 'SeviorityId' },
        ExpectedDate: { type: DataTypes.DATE, field: 'ExpectedDate' },
        CompletedOn: { type: DataTypes.DATE, field: 'CompletedOn' },
        ServiceDescription: { type: DataTypes.BIGINT, field: 'ServiceDescription' },
        OtherInformation: { type: DataTypes.STRING, field: 'OtherInformation' },
        RadiationBatchesStatusId: { type: DataTypes.BIGINT, field: 'RadiationBatchesStatusId' },
        AssignTypeId: { type: DataTypes.STRING, field: 'AssignTypeId' },
        AssignedId: { type: DataTypes.BIGINT, field: 'AssignedId' },
        Impact: { type: DataTypes.BIGINT, field: 'Impact' },
        Attachment: { type: DataTypes.STRING, field: 'Attachment' },
        FilePath: { type: DataTypes.STRING, field: 'FilePath' },
        Remarks: { type: DataTypes.BIGINT, field: 'Remarks' },
        AssignedBy: { type: DataTypes.STRING, field: 'AssignedBy' },
        AssignedOn: { type: DataTypes.DATE, field: 'AssignedOn' },
        ClosedOn: { type: DataTypes.DATE, field: 'ClosedOn' },
        CompletedById: { type: DataTypes.BIGINT, field: 'CompletedById' },
        AdditionalCost: { type: DataTypes.DECIMAL, field: 'AdditionalCost' },
        ServiceCharge: { type: DataTypes.DECIMAL, field: 'ServiceCharge' },
        TechnicalDescription: { type: DataTypes.STRING, field: 'TechnicalDescription' },
        Parts: { type: DataTypes.STRING, field: 'Parts' },
        WorkImpact: { type: DataTypes.STRING, field: 'WorkImpact' },
        WorkComments: { type: DataTypes.STRING, field: 'WorkComments' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        WorkCompletedOn: { type: DataTypes.DATE, field: 'WorkCompletedOn' },
        WorkClosureComments: { type: DataTypes.STRING, field: 'WorkClosureComments' },
        MaintananceDate: { type: DataTypes.DATE, field: 'MaintananceDate' },
        PerformedBy: { type: DataTypes.STRING, field: 'PerformedBy' },
        MaintananceDescription: { type: DataTypes.STRING, field: 'MaintananceDescription' },
        Cost: { type: DataTypes.DECIMAL, field: 'Cost' },
        TotalMaintananceId: { type: DataTypes.BIGINT, field: 'TotalMaintananceId' },
        AssetId: { type: DataTypes.BIGINT, field: 'AssetId' },
        CompleteId: { type: DataTypes.BIGINT, field: 'CompleteId' },
        PendingId: { type: DataTypes.BIGINT, field: 'PendingId' },
        NextSchedule: { type: DataTypes.DATE, field: 'NextSchedule' },
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
            tableName: 'radiationbatches',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (RadiationBatches as any).associate = function (models: any) {
        // RadiationBatches.belongsTo(models.ReferenceValue, { as: 'Status', targetKey: 'ReferenceValueCodeId' });
    };

    return RadiationBatches as SequelizeStatic.Model<i.RadiationBatchesInstance, i.RadiationBatchesAttributes>;
}
