import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientFollowupInstance, i.PatientFollowupAttributes> {
    let PatientFollowup = sequelize.define<i.PatientFollowupInstance, i.PatientFollowupAttributes>('PatientFollowup', {
        Id: { type: DataTypes.BIGINT, field: 'FollowupId', primaryKey: true, autoIncrement: true },
        FollowupCode: { type: DataTypes.STRING, field: 'FollowupCode' },
        FollowupName: { type: DataTypes.STRING, field: 'FollowupName' },
        FollowupTypeId: { type: DataTypes.BIGINT, field: 'FollowupTypeId' },
        FollowupStatusId: { type: DataTypes.BIGINT, field: 'FollowupStatusId' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        DepartmentId: { type: DataTypes.BIGINT, field: 'DepartmentId' },
        UnitId: { type: DataTypes.BIGINT, field: 'UnitId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
        FirstFollowupDate: { type: DataTypes.DATE, field: 'FirstFollowupDate' },
        FirstComments: { type: DataTypes.STRING, field: 'FirstComments' },
        FirstAdmitedDate: { type: DataTypes.DATE, field: 'FirstAdmitedDate' },
        SecondFollowupDate: { type: DataTypes.DATE, field: 'SecondFollowupDate' },
        SecondComments: { type: DataTypes.STRING, field: 'SecondComments' },
        SecondAdmitedDate: { type: DataTypes.DATE, field: 'SecondAdmitedDate' },
        ThirdFollowupDate: { type: DataTypes.DATE, field: 'ThirdFollowupDate' },
        ThirdComments: { type: DataTypes.STRING, field: 'ThirdComments' },
        ThirdAdmitedDate: { type: DataTypes.DATE, field: 'ThirdAdmitedDate' },
        DoctorName: { type: DataTypes.STRING, field: 'DoctorName' },
        RecomendedProcedure: { type: DataTypes.STRING, field: 'RecomendedProcedure' },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
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
            tableName: 'patientfollowup',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientFollowup as any).associate = function (models: Models) {
        PatientFollowup.belongsTo(models.Encounter);
        PatientFollowup.belongsTo(models.Patient);
        PatientFollowup.belongsTo(models.Department);
        PatientFollowup.belongsTo(models.ReferenceValue,
            { as: 'Team', foreignKey: 'UnitId', targetKey: 'ReferenceValueCodeId' });
        PatientFollowup.belongsTo(models.ReferenceValue,
            { as: 'FollowupType', foreignKey: 'FollowupTypeId', targetKey: 'ReferenceValueCodeId' });
        PatientFollowup.belongsTo(models.ReferenceValue,
            { as: 'FollowupStatus', foreignKey: 'FollowupStatusId', targetKey: 'ReferenceValueCodeId' });
    };
    return PatientFollowup;
}
