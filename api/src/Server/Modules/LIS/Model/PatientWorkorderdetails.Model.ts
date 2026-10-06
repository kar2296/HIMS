import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientWorkorderdetailsInstance, i.PatientWorkorderdetailsAttributes> {
    let PatientWorkorderdetails
        = sequelize.define<i.PatientWorkorderdetailsInstance, i.PatientWorkorderdetailsAttributes>('PatientWorkorderdetails', {
            Id: { type: DataTypes.BIGINT, field: 'Workorderdetailid', primaryKey: true, autoIncrement: true },
            Workorderid: { type: DataTypes.BIGINT, field: 'Workorderid' },
            Orderid: { type: DataTypes.BIGINT, field: 'Orderid' },
            Encounterorderid: { type: DataTypes.BIGINT, field: 'Encounterorderid' },
            Patientid: { type: DataTypes.BIGINT, field: 'Patientid' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            Orderdetailid: { type: DataTypes.BIGINT, field: 'Orderdetailid' },
            Testid: { type: DataTypes.BIGINT, field: 'Testid' },
            Testname: { type: DataTypes.STRING, field: 'Testname' },
            Analyteid: { type: DataTypes.BIGINT, field: 'Analyteid' },
            Analytename: { type: DataTypes.STRING, field: 'Analytename' },
            AnalyteCode: { type: DataTypes.STRING, field: 'AnalyteCode' },
            Analyterange: { type: DataTypes.STRING, field: 'Analyterange' },
            Qualifier: { type: DataTypes.STRING, field: 'Qualifier' },
            QualifierId: { type: DataTypes.BIGINT, field: 'QualifierId' },
            Resultvalue: { type: DataTypes.STRING, field: 'Resultvalue' },
            AnalyteUOM: { type: DataTypes.BIGINT, field: 'AnalyteUOM' },
            Methodology: { type: DataTypes.STRING, field: 'Methodology' },
            TestValueType: { type: DataTypes.STRING, field: 'TestValueType' },
            AcceptedDate: { type: DataTypes.DATE, field: 'AcceptedDate' },
            WorkOrderDetailStatusId: { type: DataTypes.BIGINT, field: 'WorkOrderDetailStatusId' },
            Departmentid: { type: DataTypes.BIGINT, field: 'Departmentid' },
            Subdepartmentid: { type: DataTypes.BIGINT, field: 'Subdepartmentid' },
            SubdeptDisplayOrder: { type: DataTypes.INTEGER, field: 'SubdeptDisplayOrder' },
            Sampleid: { type: DataTypes.BIGINT, field: 'Sampleid' },
            Samplecollectiondate: { type: DataTypes.DATE, field: 'Samplecollectiondate' },
            SpecReceiveddate: { type: DataTypes.DATE, field: 'SpecReceiveddate' },
            Performedondate: { type: DataTypes.DATE, field: 'Performedondate' },
            Comments: { type: DataTypes.STRING, field: 'Comments' },
            TechValidationId: { type: DataTypes.BIGINT, field: 'TechValidationId' },
            TechValidationName: { type: DataTypes.STRING, field: 'TechValidationName' },
            TechValidationdate: { type: DataTypes.DATE, field: 'TechValidationdate' },
            MedValidationById: { type: DataTypes.BIGINT, field: 'MedValidationById' },
            MedValidationByName: { type: DataTypes.STRING, field: 'MedValidationByName' },
            MedValidationdate: { type: DataTypes.DATE, field: 'MedValidationdate' },
            ReleasedBy: { type: DataTypes.BIGINT, field: 'ReleasedBy' },
            ReleasedDate: { type: DataTypes.DATE, field: 'ReleasedDate' },
            IsReleased: { type: DataTypes.BOOLEAN, field: 'IsReleased' },
            IsReleasedToPatient: { type: DataTypes.BOOLEAN, field: 'IsReleasedToPatient' },
            SampleTypeId: { type: DataTypes.BIGINT, field: 'SampleTypeId' },
            SampleType: { type: DataTypes.STRING, field: 'SampleType' },
            ProfileName: { type: DataTypes.STRING, field: 'ProfileName' },
            ProfileDisplayOrder: { type: DataTypes.INTEGER, field: 'ProfileDisplayOrder' },
            TestDisplayOrder: { type: DataTypes.INTEGER, field: 'TestDisplayOrder' },
            TestPrintOrder: { type: DataTypes.INTEGER, field: 'TestPrintOrder' },
            AnalyteDisplayOrder: { type: DataTypes.INTEGER, field: 'AnalyteDisplayOrder' },
            AnalytePrintOrder: { type: DataTypes.INTEGER, field: 'AnalytePrintOrder' },
            RootProfileDisplayOrder: { type: DataTypes.INTEGER, field: 'RootProfileDisplayOrder' },
            RootProfileId: { type: DataTypes.INTEGER, field: 'RootProfileId' },
            RootProfileName: { type: DataTypes.INTEGER, field: 'RootProfileName' },
            Status: { type: DataTypes.INTEGER, field: 'Status' },
            Rev: { type: DataTypes.INTEGER, field: 'Rev' },
            CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
            CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
            UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
            UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
            Reason: { type: DataTypes.STRING, field: 'Reason' },
            IsLISResult: { type: DataTypes.BOOLEAN, field: 'IsLISResult' },
            IsLISRequest: { type: DataTypes.BOOLEAN, field: 'IsLISRequest' },
            IsSeparateSampleId: { type: DataTypes.INTEGER, field: 'IsSeparateSampleId' },
            ImpressionId: { type: DataTypes.BIGINT, field: 'ImpressionId' },
            ClinicalFindingId: { type: DataTypes.BIGINT, field: 'ClinicalFindingId' },
            ConsultationId: { type: DataTypes.BIGINT, field: 'ConsultationId' },
            IsIncludeDischargeSheet: { type: DataTypes.BOOLEAN, field: 'IsIncludeDischargeSheet' },
            IsExternalLab: { type: DataTypes.BOOLEAN, field: 'IsExternalLab' },
            IsCriticalValue: { type: DataTypes.BOOLEAN, field: 'IsCriticalValue' },
            IsPrinted: { type: DataTypes.BOOLEAN, field: 'IsPrinted' },
            ExternalPrice: { type: DataTypes.DECIMAL, field: 'ExternalPrice' },
        },
            {
                indexes: [],
                timestamps: true,
                tableName: 'patientworkorderdetails',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    },
                    order: [
                        ['Subdepartmentid', 'ASC'],
                        ['RootProfileDisplayOrder', 'ASC'],
                        ['ProfileDisplayOrder', 'ASC'],
                        ['TestDisplayOrder', 'ASC'],
                        ['AnalyteDisplayOrder', 'ASC']
                    ]
                }
            });

    (PatientWorkorderdetails as any).associate = function (models: Models) {
        PatientWorkorderdetails.belongsTo(models.Analytemaster, { as: 'Analyte', foreignKey: 'Analyteid' });
        PatientWorkorderdetails.belongsTo(models.Sampletype, { foreignKey: 'SampleTypeId' });
        PatientWorkorderdetails.belongsTo(models.PatientOrder, { foreignKey: 'Orderid' });
        PatientWorkorderdetails.belongsTo(models.PatientOrderDetail, { foreignKey: 'Orderdetailid' });
        PatientWorkorderdetails.belongsTo(models.Patient, { foreignKey: 'Patientid' });
        PatientWorkorderdetails.belongsTo(models.Analyterefmaster, {
            as: 'Analyteref', foreignKey: 'Analyteid',
            targetKey: 'AnalyteId'
        });
        PatientWorkorderdetails.belongsTo(models.Testmaster, { foreignKey: 'Testid' });
        PatientWorkorderdetails.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        PatientWorkorderdetails.belongsTo(models.WorkOrderStatus,
            { as: 'WorkOrderDetailStatus', foreignKey: 'WorkOrderDetailStatusId' });
        PatientWorkorderdetails.belongsTo(models.PatientWorkorder, { foreignKey: 'Workorderid' });
        PatientWorkorderdetails.belongsTo(models.Department, { foreignKey: 'Subdepartmentid', as: 'SubDepartment' });
        PatientWorkorderdetails.belongsTo(models.Department, { foreignKey: 'Departmentid', as: 'Department' });
        PatientWorkorderdetails.belongsTo(models.ClinicalFinding, { foreignKey: 'ClinicalFindingId' });
        PatientWorkorderdetails.belongsTo(models.ImpressionMaster, { foreignKey: 'ImpressionId' });
        PatientWorkorderdetails.hasMany(models.WorkOrderObservation, { foreignKey: 'WorkOrderDetailId' });
        PatientWorkorderdetails.belongsTo(models.User, { as: 'MedUser', foreignKey: 'MedValidationById' });
    };

    return PatientWorkorderdetails;
}
