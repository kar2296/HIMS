import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PastLabResultDetailInstance, i.PastLabResultDetailAttributes> {
    let PastLabResultDetail = sequelize.define<i.PastLabResultDetailInstance, i.PastLabResultDetailAttributes>('PastLabResultDetail', {
        Id: { type: DataTypes.BIGINT, field: 'ClinicalResultDetailId', primaryKey: true, autoIncrement: true },
        ClinicalResultId: { type: DataTypes.BIGINT, field: 'ClinicalResultId' },
        Orderdetailid: { type: DataTypes.BIGINT, field: 'Orderdetailid' },
        Orderid: { type: DataTypes.BIGINT, field: 'Orderid' },
        Encounterorderid: { type: DataTypes.BIGINT, field: 'Encounterorderid' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        TestId: { type: DataTypes.BIGINT, field: 'TestId' },
        TestName: { type: DataTypes.STRING, field: 'TestName' },
        TestCode: { type: DataTypes.STRING, field: 'TestCode' },
        Name: { type: DataTypes.STRING, field: 'Name' },
        Analyteid: { type: DataTypes.BIGINT, field: 'Analyteid' },
        Analytename: { type: DataTypes.STRING, field: 'Analytename' },
        Analyterange: { type: DataTypes.STRING, field: 'Analyterange' },
        Qualifier: { type: DataTypes.STRING, field: 'Qualifier' },
        Resultvalue: { type: DataTypes.STRING, field: 'Resultvalue' },
        AnalyteUOM: { type: DataTypes.STRING, field: 'AnalyteUOM' },
        Methodology: { type: DataTypes.STRING, field: 'Methodology' },
        TestValueType: { type: DataTypes.STRING, field: 'TestValueType' },
        WorkOrderDetailStatusId: { type: DataTypes.BIGINT, field: 'WorkOrderDetailStatusId' },
        AcceptedDate: { type: DataTypes.DATE, field: 'AcceptedDate' },
        Departmentid: { type: DataTypes.BIGINT, field: 'Departmentid' },
        Subdepartmentid: { type: DataTypes.BIGINT, field: 'Subdepartmentid' },
        Sampleid: { type: DataTypes.BIGINT, field: 'Sampleid' },
        Samplecollectiondate: { type: DataTypes.DATE, field: 'Samplecollectiondate' },
        SpecReceiveddate: { type: DataTypes.DATE, field: 'SpecReceiveddate' },
        Performedondate: { type: DataTypes.DATE, field: 'Performedondate' },
        Uom: { type: DataTypes.STRING, field: 'Uom' },
        TechValidationId: { type: DataTypes.BIGINT, field: 'TechValidationId' },
        TechValidationName: { type: DataTypes.STRING, field: 'TechValidationName' },
        TechValidationdate: { type: DataTypes.DATE, field: 'TechValidationdate' },
        MedValidationById: { type: DataTypes.BIGINT, field: 'MedValidationById' },
        MedValidationByName: { type: DataTypes.STRING, field: 'MedValidationByName' },
        MedValidationdate: { type: DataTypes.DATE, field: 'MedValidationdate' },
        Reference: { type: DataTypes.STRING, field: 'Reference' },
        SampleTypeId: { type: DataTypes.BIGINT, field: 'SampleTypeId' },
        QualifierId: { type: DataTypes.BIGINT, field: 'QualifierId' },
        AnalyteDisplayOrder: { type: DataTypes.BIGINT, field: 'AnalyteDisplayOrder' },
        TestDisplayOrder: { type: DataTypes.BIGINT, field: 'TestDisplayOrder' },
        ProfileName: { type: DataTypes.STRING, field: 'ProfileName' },
        TESTMASTERTYPId: { type: DataTypes.BIGINT, field: 'TESTMASTERTYPId' },
        AnalyteCode: { type: DataTypes.STRING, field: 'AnalyteCode' },
        RootProfileName: { type: DataTypes.STRING, field: 'RootProfileName' },
        ReleasedBy: { type: DataTypes.STRING, field: 'ReleasedBy' },
        ReleasedDate: { type: DataTypes.DATE, field: 'ReleasedDate' },
        ReleaseToPatientId: { type: DataTypes.BIGINT, field: 'ReleaseToPatientId' },
        Status: { type: DataTypes.INTEGER, field: 'Status' },
        ProfileDisplayOrder: { type: DataTypes.INTEGER, field: 'ProfileDisplayOrder' },
        RootProfileDisplayOrder: { type: DataTypes.INTEGER, field: 'RootProfileDisplayOrder' },
        Rev: { type: DataTypes.INTEGER, field: 'Rev' },
        CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
        CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
        UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
        UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
    },
        {
            indexes: [],
            timestamps: true,
            tableName: 'pastlabresultdetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (PastLabResultDetail as any).associate = function(models: Models) {
                    // AllergyMaster.belongsTo(models.ReferenceValue, { as: 'AllergyType', targetKey: 'ReferenceValueCodeId' });
                    // AllergyMaster.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
                };
 return PastLabResultDetail;
}
