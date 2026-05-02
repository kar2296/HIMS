import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.BloodRequestInstance, i.BloodRequestAttributes> {
    let BloodRequest = sequelize.define<i.BloodRequestInstance, i.
        BloodRequestAttributes>('BloodRequest', {
            Id: { type: DataTypes.BIGINT, field: 'BloodRequestId', primaryKey: true, autoIncrement: true },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            EncounterTypeId: { type: DataTypes.BIGINT, field: 'EncounterTypeId' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
            BloodRequestNo: { type: DataTypes.STRING, field: 'BloodRequestNo' },
            IsWhiteBlood: { type: DataTypes.BOOLEAN, field: 'IsWhiteBlood' },
            WhiteBloodComments: { type: DataTypes.STRING, field: 'WhiteBloodComments' },
            IsPackedCell: { type: DataTypes.BOOLEAN, field: 'IsPackedCell' },
            PackedCellComments: { type: DataTypes.STRING, field: 'PackedCellComments' },
            IsPlatelet: { type: DataTypes.BOOLEAN, field: 'IsPlatelet' },
            PlateletComments: { type: DataTypes.STRING, field: 'PlateletComments' },
            IsFFP: { type: DataTypes.BOOLEAN, field: 'IsFFP' },
            FFPComments: { type: DataTypes.STRING, field: 'FFPComments' },
            IsOthers: { type: DataTypes.BOOLEAN, field: 'IsOthers' },
            OthersComments: { type: DataTypes.STRING, field: 'OthersComments' },
            BloodPriorityId: { type: DataTypes.BIGINT, field: 'BloodPriorityId' },
            RequestedVolume: { type: DataTypes.STRING, field: 'RequestedVolume' },
            BloodRequestDate: { type: DataTypes.DATE, field: 'BloodRequestDate' },
            BloodBankName: { type: DataTypes.STRING, field: 'BloodBankName' },
            RequirementRemarks: { type: DataTypes.STRING, field: 'RequirementRemarks' },
            BloodBankStatusId: { type: DataTypes.BIGINT, field: 'BloodBankStatusId' },
            UnitNo: { type: DataTypes.STRING, field: 'UnitNo' },
            TransfusionNo: { type: DataTypes.STRING, field: 'TransfusionNo' },
            PatientNo: { type: DataTypes.STRING, field: 'PatientNo' },
            AntibodyScreenId: { type: DataTypes.BIGINT, field: 'AntibodyScreenId' },
            CrossMatchId: { type: DataTypes.BIGINT, field: 'CrossMatchId' },
            DonorABOId: { type: DataTypes.BIGINT, field: 'DonorABOId' },
            DonorRhId: { type: DataTypes.BIGINT, field: 'DonorRhId' },
            ReceipientABOId: { type: DataTypes.BIGINT, field: 'ReceipientABOId' },
            ReceipientRhId: { type: DataTypes.STRING, field: 'ReceipientRhId' },
            IsRecord: { type: DataTypes.BOOLEAN, field: 'IsRecord' },
            IsNoRecord: { type: DataTypes.BOOLEAN, field: 'IsNoRecord' },
            PerformedBy: { type: DataTypes.INTEGER, field: 'PerformedBy' },
            VerifiedBy: { type: DataTypes.INTEGER, field: 'VerifiedBy' },
            TransfusionRemarks: { type: DataTypes.STRING, field: 'TransfusionRemarks' },
            TransfusionDate: { type: DataTypes.DATE, field: 'TransfusionDate' },
            Donor1BloodGroupId: { type: DataTypes.BIGINT, field: 'Donor1BloodGroupId' },
            Donor1BlNo: { type: DataTypes.STRING, field: 'Donor1BlNo' },
            Donor2BloodGroupId: { type: DataTypes.BIGINT, field: 'Donor2BloodGroupId' },
            Donor2BlNo: { type: DataTypes.STRING, field: 'Donor2BlNo' },
            Donor3BloodGroupId: { type: DataTypes.BIGINT, field: 'Donor3BloodGroupId' },
            Donor3BlNo: { type: DataTypes.STRING, field: 'Donor3BlNo' },
            Donor4BloodGroupId: { type: DataTypes.BIGINT, field: 'Donor4BloodGroupId' },
            Donor4BlNo: { type: DataTypes.STRING, field: 'Donor4BlNo' },
            Donor5BloodGroupId: { type: DataTypes.BIGINT, field: 'Donor5BloodGroupId' },
            Donor5BlNo: { type: DataTypes.STRING, field: 'Donor5BlNo' },
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
            tableName: 'bloodrequest',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (BloodRequest as any).associate = function (models: Models) {
        BloodRequest.belongsTo(models.Patient, { foreignKey: 'PatientId' });
        BloodRequest.belongsTo(models.Encounter);
        BloodRequest.belongsTo(models.ReferenceValue, { as: 'BloodPriority', targetKey: 'ReferenceValueCodeId' });
        BloodRequest.belongsTo(models.ReferenceValue, { as: 'BloodBankStatus', targetKey: 'ReferenceValueCodeId' });
        BloodRequest.belongsTo(models.User, { as: 'CreatedUser', foreignKey: 'CreatedBy' });
    };
    return BloodRequest;
}
