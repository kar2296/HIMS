import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PastLabResultInstance, i.PastLabResultAttributes> {
    let PastLabResult = sequelize.define<i.PastLabResultInstance, i.PastLabResultAttributes>('PastLabResult', {
        Id: { type: DataTypes.BIGINT, field: 'ClinicalResultId', primaryKey: true, autoIncrement: true },
        WorkOrderdid: { type: DataTypes.STRING, field: 'WorkOrderdid' },
        Orderdetailid: { type: DataTypes.BIGINT, field: 'Orderdetailid' },
        Orderid: { type: DataTypes.BIGINT, field: 'Orderid' },
        Encounterorderid: { type: DataTypes.BIGINT, field: 'Encounterorderid' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        Encounterid: { type: DataTypes.BIGINT, field: 'Encounterid' },
        Orderedbyid: { type: DataTypes.BIGINT, field: 'Orderedbyid' },
        Orderedbyname: { type: DataTypes.STRING, field: 'Orderedbyname' },
        WorkOrderStatusId: { type: DataTypes.BIGINT, field: 'WorkOrderStatusId' },
        Ordereddate: { type: DataTypes.DATE, field: 'Ordereddate' },
        Departmentid: { type: DataTypes.BIGINT, field: 'Departmentid' },
        Subdepartmentid: { type: DataTypes.BIGINT, field: 'Subdepartmentid' },
        DepartmentrefNo: { type: DataTypes.STRING, field: 'DepartmentrefNo' },
        Receiveddate: { type: DataTypes.DATE, field: 'Receiveddate' },
        Reporteddate: { type: DataTypes.DATE, field: 'Reporteddate' },
        Approvedbyid: { type: DataTypes.BIGINT, field: 'Approvedbyid' },
        Approvedbyname: { type: DataTypes.STRING, field: 'Approvedbyname' },
        ExternallabId: { type: DataTypes.BIGINT, field: 'ExternallabId' },
        TechValidationById: { type: DataTypes.BIGINT, field: 'TechValidationById' },
        TechValidationByName: { type: DataTypes.STRING, field: 'TechValidationByName' },
        TechValidationdate: { type: DataTypes.DATE, field: 'TechValidationdate' },
        MedValidationById: { type: DataTypes.BIGINT, field: 'MedValidationById' },
        MedValidationByName: { type: DataTypes.STRING, field: 'MedValidationByName' },
        MedValidationdate: { type: DataTypes.DATE, field: 'MedValidationdate' },
        OrderPriorityId: { type: DataTypes.BIGINT, field: 'OrderPriorityId' },
        UserId: { type: DataTypes.BIGINT, field: 'UserId' },
        ApprovalSubmisdate: { type: DataTypes.DATE, field: 'ApprovalSubmisdate' },
        Assigndate: { type: DataTypes.DATE, field: 'Assigndate' },
        Reason: { type: DataTypes.STRING, field: 'Reason' },
        TESTMASTERTYPId: { type: DataTypes.BIGINT, field: 'TESTMASTERTYPId' },
        LabAssignTypeId: { type: DataTypes.BIGINT, field: 'LabAssignTypeId' },
        Orderedby: { type: DataTypes.STRING, field: 'Orderedby' },
        ReleasedBy: { type: DataTypes.STRING, field: 'ReleasedBy' },
        ReleasedDate: { type: DataTypes.DATE, field: 'ReleasedDate' },
        LabName: { type: DataTypes.STRING, field: 'LabName' },
        ReleaseToPatientId: { type: DataTypes.BIGINT, field: 'ReleaseToPatientId' },
        YesNoId: { type: DataTypes.BIGINT, field: 'YesNoId' },
        FilePath: { type: DataTypes.STRING, field: 'FilePath' },
        Name: { type: DataTypes.STRING, field: 'Name' },
        // Attachments: { type: DataTypes.STRING, field: 'Attachments' },
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
            tableName: 'patientpastresults',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (PastLabResult as any).associate = function(models: Models) {
                    PastLabResult.belongsTo(models.ReferenceValue, { as: 'YesNo', targetKey: 'ReferenceValueCodeId' });
                    //  PastLabResult.hasMany(models.PastLabResultDetail);
                };
 return PastLabResult;
}
