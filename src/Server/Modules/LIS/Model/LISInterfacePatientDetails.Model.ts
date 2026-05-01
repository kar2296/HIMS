import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.LISInterfaceResultInstance, i.LISInterfaceResultAttributes> {
    let LISInterfacePatientDetails =
        sequelize.define<i.LISInterfaceResultInstance, i.LISInterfaceResultAttributes>
            ('LISInterfacePatientDetails', {
                Id: {
                    type: DataTypes.BIGINT, field: 'LISId',
                    primaryKey: true, autoIncrement: true
                },
                OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
                FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
                AssetId: { type: DataTypes.BIGINT, field: 'AssetId' },
                Sampleid: { type: DataTypes.STRING, field: 'Sampleid' },
                PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
                EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
                Approved: { type: DataTypes.BOOLEAN, field: 'Approved' },
                ApprovedById: { type: DataTypes.INTEGER, field: 'ApprovedById' },
                ApproveDt: { type: DataTypes.DATE, field: 'ApproveDt' },
                Rejected: { type: DataTypes.BOOLEAN, field: 'Rejected' },
                RejectedById: { type: DataTypes.INTEGER, field: 'RejectedById' },
                RejectedDt: { type: DataTypes.DATE, field: 'RejectedDt' },
                FullResult: { type: DataTypes.STRING, field: 'FullResult' },
                Status: { type: DataTypes.INTEGER, field: 'Status' },
                Rev: { type: DataTypes.INTEGER, field: 'Rev' },
                CreatedBy: { type: DataTypes.INTEGER, field: 'CreatedBy' },
                CreatedAt: { type: DataTypes.DATE, field: 'CreatedAt' },
                UpdatedBy: { type: DataTypes.INTEGER, field: 'UpdatedBy' },
                UpdatedAt: { type: DataTypes.DATE, field: 'UpdatedAt' },
            } as any, // ← TEMPORARY TYPE BYPASS - This will fix the immediate error
            {
                indexes: [],
                timestamps: true,
                tableName: 'lisinterfacepatientdetails',
                createdAt: 'CreatedAt',
                updatedAt: 'UpdatedAt',
                freezeTableName: true,
                defaultScope: {
                    where: {
                        Status: 1
                    }
                }
            });

    (LISInterfacePatientDetails as any).associate = function (models: any) {
        LISInterfacePatientDetails.belongsTo(models.Patient, {foreignKey: 'PatientId'});
        LISInterfacePatientDetails.belongsTo(models.Encounter, { foreignKey: 'EncounterId' });
        LISInterfacePatientDetails.belongsTo(models.Asset, { foreignKey: 'AssetId' });
    };

    return LISInterfacePatientDetails as SequelizeStatic.Model<i.LISInterfaceResultInstance, i.LISInterfaceResultAttributes>;
}
