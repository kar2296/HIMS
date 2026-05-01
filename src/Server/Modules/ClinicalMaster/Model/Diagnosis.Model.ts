import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.DiagnosisInstance, i.DiagnosisAttributes> {
    let Diagnosis = sequelize.define<i.DiagnosisInstance, i.DiagnosisAttributes>('Diagnosis', {
        Id: { type: DataTypes.BIGINT, field: 'DiagnosisId', primaryKey: true, autoIncrement: true },
        DiagnosisCodeSchemeId: { type: DataTypes.BIGINT, field: 'DiagnosisCodeSchemeId' },
        Code: { type: DataTypes.STRING, field: 'Code' },
        DiagnosisName: { type: DataTypes.STRING, field: 'DiagnosisName' },
        Description: { type: DataTypes.STRING, field: 'Description' },
        DiagnosisVersionId: { type: DataTypes.BIGINT, field: 'DiagnosisVersionId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        CodeRegionId: { type: DataTypes.BIGINT, field: 'CodeRegionId' },
        SideId: { type: DataTypes.BIGINT, field: 'SideId' },
        TestMasterPositionId: { type: DataTypes.BIGINT, field: 'TestMasterPositionId' },
        Speciality: { type: DataTypes.STRING, field: 'Speciality' },
        Synonym: { type: DataTypes.STRING, field: 'Synonym' },
        ReferrenceLink: { type: DataTypes.STRING, field: 'ReferrenceLink' },
        LengthOfStay: { type: DataTypes.STRING, field: 'LengthOfStay' },
        BodySite: { type: DataTypes.STRING, field: 'BodySite' },
        IsActive: { type: DataTypes.BOOLEAN, field: 'IsActive' },
        IsNotifibale: { type: DataTypes.BOOLEAN, field: 'IsNotifibale' },
        IsSensitive: { type: DataTypes.BOOLEAN, field: 'IsSensitive' },
        IsBillable: { type: DataTypes.BOOLEAN, field: 'IsBillable' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        ActiveStatusId: { type: DataTypes.INTEGER, field: 'ActiveStatusId' },
        CategoryId: { type: DataTypes.BIGINT, field: 'CategoryId' },
        TypeId: { type: DataTypes.BIGINT, field: 'TypeId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        GradeId: { type: DataTypes.BIGINT, field: 'GradeId' },
        AgeFrom: { type: DataTypes.INTEGER, field: 'AgeFrom' },
        AgeTo: { type: DataTypes.INTEGER, field: 'AgeTo' },
        GenderId: { type: DataTypes.BIGINT, field: 'GenderId' },
        EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
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
            tableName: 'diagnosis',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (Diagnosis as any).associate = function (models: Models) {
                    Diagnosis.belongsTo(models.ReferenceValue, { as: 'DiagnosisVersion', targetKey: 'ReferenceValueCodeId' });
                    Diagnosis.belongsTo(models.ReferenceValue, { as: 'ActiveStatus', targetKey: 'ReferenceValueCodeId' });
        Diagnosis.belongsTo(models.ReferenceValue, {
            as: 'DiagnosisCategory', foreignKey: 'CategoryId',
            targetKey: 'ReferenceValueCodeId'
        });
        Diagnosis.belongsTo(models.ReferenceValue, {
            as: 'DiagnosisType', foreignKey: 'TypeId',
            targetKey: 'ReferenceValueCodeId'
        });
        Diagnosis.belongsTo(models.ReferenceValue, { as: 'Side', targetKey: 'ReferenceValueCodeId' });
        Diagnosis.belongsTo(models.ReferenceValue, { as: 'Grade', targetKey: 'ReferenceValueCodeId' });
        Diagnosis.belongsTo(models.ReferenceValue, { as: 'TestMasterPosition', targetKey: 'ReferenceValueCodeId' });
                };
 return Diagnosis;
}
