import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientWorkorderInstance, i.PatientWorkorderAttributes> {
    let PatientWorkorder = sequelize.define<i.PatientWorkorderInstance, i.PatientWorkorderAttributes>('PatientWorkorder', {
        Id: { type: DataTypes.BIGINT, field: 'Workorderid', primaryKey: true, autoIncrement: true },
        WorkOrderId: { type: DataTypes.STRING, field: 'WorkOrderdid' },
        Orderdetailid: { type: DataTypes.BIGINT, field: 'Orderdetailid' },
        Orderid: { type: DataTypes.BIGINT, field: 'Orderid' },
        Encounterorderid: { type: DataTypes.BIGINT, field: 'Encounterorderid' },
        Patientid: { type: DataTypes.BIGINT, field: 'Patientid' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
        Orderedbyid: { type: DataTypes.BIGINT, field: 'Orderedbyid' },
        Orderedbyname: { type: DataTypes.STRING, field: 'Orderedbyname' },
        WorkOrderStatusId: { type: DataTypes.BIGINT, field: 'WorkOrderStatusId' },
        Ordereddate: { type: DataTypes.DATE, field: 'Ordereddate' },
        Departmentid: { type: DataTypes.BIGINT, field: 'Departmentid' },
        Subdepartmentid: { type: DataTypes.BIGINT, field: 'Subdepartmentid' },
        DepartmentrefNo: { type: DataTypes.STRING, field: 'DepartmentrefNo' },
        ReceivedDate: { type: DataTypes.DATE, field: 'Receiveddate' },
        Reporteddate: { type: DataTypes.DATE, field: 'Reporteddate' },
        Approvedbyid: { type: DataTypes.BIGINT, field: 'Approvedbyid' },
        Approvedbyname: { type: DataTypes.STRING, field: 'Approvedbyname' },
        ExternalProviderId: { type: DataTypes.BIGINT, field: 'ExternalProviderId' },
        TechValidationById: { type: DataTypes.INTEGER, field: 'TechValidationById' },
        TechValidationByName: { type: DataTypes.STRING, field: 'TechValidationByName' },
        TechValidationdate: { type: DataTypes.DATE, field: 'TechValidationdate' },
        MedValidationById: { type: DataTypes.INTEGER, field: 'MedValidationById' },
        MedValidationByName: { type: DataTypes.STRING, field: 'MedValidationByName' },
        MedValidationdate: { type: DataTypes.DATE, field: 'MedValidationdate' },
        OrderPriorityId: { type: DataTypes.BIGINT, field: 'OrderPriorityId' },
        UserId: { type: DataTypes.INTEGER, field: 'UserId' },
        ApprovalSubmisdate: { type: DataTypes.DATE, field: 'ApprovalSubmisdate' },
        Assigndate: { type: DataTypes.DATE, field: 'Assigndate' },
        LabAssignTypeId: { type: DataTypes.BIGINT, field: 'LabAssignTypeId' },
        TestTypeId: { type: DataTypes.INTEGER, field: 'TestTypeId' },
        ReleasedBy: { type: DataTypes.BIGINT, field: 'ReleasedBy' },
        ReleasedDate: { type: DataTypes.DATE, field: 'ReleasedDate' },
        ReferenceNo: { type: DataTypes.STRING, field: 'ReferenceNo' },
        IsReleased: { type: DataTypes.BOOLEAN, field: 'IsReleased' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
        Reason: { type: DataTypes.STRING, field: 'Reason' },
        OtherFacilityId: { type: DataTypes.INTEGER, field: 'OtherFacilityId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        PatientName: { type: DataTypes.STRING, field: 'PatientName' },
        PatientMrn: { type: DataTypes.STRING, field: 'PatientMrn' },
        PatientMobile: { type: DataTypes.STRING, field: 'PatientMobile' },
        SampleIdentifier: { type: DataTypes.STRING, field: 'SampleIdentifier' },
        IsRejected: { type: DataTypes.BOOLEAN, field: 'IsRejected' },
        IsExternalLab: { type: DataTypes.BOOLEAN, field: 'IsExternalLab' },
        IsPrinted: { type: DataTypes.BOOLEAN, field: 'IsPrinted' },
        IsCulture: { type: DataTypes.BOOLEAN, field: 'IsCulture' },
        ExternalOrderStatusId: { type: DataTypes.BIGINT, field: 'ExternalOrderStatusId' },
        ParentWorkOrderId: { type: DataTypes.BIGINT, field: 'ParentWorkOrderId' },
        ResultEnteredBy: { type: DataTypes.BIGINT, field: 'ResultEnteredBy' },
        ApprovedUserBy: { type: DataTypes.BIGINT, field: 'ApprovedUserBy' },
        SpecimenId: { type: DataTypes.BIGINT, field: 'SpecimenId' },
        BlockId: { type: DataTypes.BIGINT, field: 'BlockId' },
        ResultTypeId: { type: DataTypes.BIGINT, field: 'ResultTypeId' },
        PrintableComments: { type: DataTypes.STRING, field: 'PrintableComments' },
        NonPrintableComments: { type: DataTypes.STRING, field: 'NonPrintableComments' },
        IsCriticalOrder: { type: DataTypes.BOOLEAN, field: 'IsCriticalOrder' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'patientworkorder',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientWorkorder as any).associate = function (models: Models) {
        PatientWorkorder.belongsTo(models.Patient);
        PatientWorkorder.belongsTo(models.PatientOrder, { foreignKey: 'Orderid' });
        PatientWorkorder.belongsTo(models.WorkOrderStatus);
        PatientWorkorder.belongsTo(models.Department);
        PatientWorkorder.belongsTo(models.Department, { foreignKey: 'Subdepartmentid', as: 'SubDepartment' });
        PatientWorkorder.belongsTo(models.ReferenceValue, { as: 'OrderPriority', targetKey: 'ReferenceValueCodeId' });
        PatientWorkorder.belongsTo(models.ReferenceValue, { as: 'LabAssignType', targetKey: 'ReferenceValueCodeId' });
        PatientWorkorder.belongsTo(models.ReferenceValue, { as: 'ExternalOrderStatus', targetKey: 'ReferenceValueCodeId' });
        PatientWorkorder.belongsTo(models.User);
        PatientWorkorder.belongsTo(models.User, { as: 'AssignedUser', foreignKey: 'UserId' });
        PatientWorkorder.belongsTo(models.User, { as: 'ReleasedByUser', foreignKey: 'ReleasedBy' });
        PatientWorkorder.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
        PatientWorkorder.belongsTo(models.User, { as: 'Techuser', foreignKey: 'TechValidationById' });
        PatientWorkorder.belongsTo(models.User, { as: 'MedUser', foreignKey: 'MedValidationById' });
        PatientWorkorder.belongsTo(models.User, { as: 'ApprovedUser', foreignKey: 'Approvedbyid' });
        PatientWorkorder.belongsTo(models.User, { as: 'Orderedby', foreignKey: 'Orderedbyid' });
        PatientWorkorder.belongsTo(models.User, { as: 'ResultEnteredUser', foreignKey: 'ResultEnteredBy' });
        PatientWorkorder.belongsTo(models.User, { as: 'ResultApprovedUser', foreignKey: 'Approvedbyid' });
        PatientWorkorder.belongsTo(models.Encounter, { foreignKey: 'Encounterid' });
        PatientWorkorder.belongsTo(models.ExternalProvider);
        PatientWorkorder.hasMany(models.PatientWorkorderdetails, { foreignKey: 'Workorderid' });
        PatientWorkorder.belongsTo(models.Facility, { as: 'OtherFacility', foreignKey: 'OtherFacilityId' });
        PatientWorkorder.belongsTo(models.Facility, { as: 'Facility', foreignKey: 'FacilityId' });
    };
    return PatientWorkorder;
}
