import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.EncounterGuarantorGLInstance, i.EncounterGuarantorGLAttributes> {
    let EncounterGuarantorGL = sequelize.define<i.EncounterGuarantorGLInstance, i.EncounterGuarantorGLAttributes>('EncounterGuarantorGL', {
        Id: { type: DataTypes.BIGINT, field: 'EncounterGuarantorGLId', primaryKey: true, autoIncrement: true },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
        OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EncounterGuarantorId: { type: DataTypes.BIGINT, field: 'EncounterGuarantorId' },
        GuarantorName: { type: DataTypes.STRING, field: 'GuarantorName' },
        GuarantorTypeId: { type: DataTypes.BIGINT, field: 'GuarantorTypeId' },
        GuarantorLetterNo: { type: DataTypes.STRING, field: 'GuarantorLetterNo' },
        GuarantorLetterDate: { type: DataTypes.DATE, field: 'GuarantorLetterDate' },
        GLReferenceNumber: { type: DataTypes.STRING, field: 'GLReferenceNumber' },
        GLDate: { type: DataTypes.DATE, field: 'GLDate' },
        MaxNoOfdays: { type: DataTypes.STRING, field: 'MaxNoOfdays' },
        CurrentVisitNumber: { type: DataTypes.STRING, field: 'CurrentVisitNumber' },
        MaximumVisitNumber: { type: DataTypes.STRING, field: 'MaximumVisitNumber' },
        DurationMedicine: { type: DataTypes.STRING, field: 'DurationMedicine' },
        GLLimit: { type: DataTypes.DECIMAL, field: 'GLLimit' },
        ConsumedLimit: { type: DataTypes.DECIMAL, field: 'ConsumedLimit' },
        BalanceLimit: { type: DataTypes.DECIMAL, field: 'BalanceLimit' },
        RandB: { type: DataTypes.STRING, field: 'RandB' },
        ActiveFrom: { type: DataTypes.DATE, field: 'ActiveFrom' },
        ActiveTo: { type: DataTypes.DATE, field: 'ActiveTo' },
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
            tableName: 'encounterguarantorgl',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });



    return EncounterGuarantorGL;
}
