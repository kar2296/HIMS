import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.PatientLabourDetailInstance, i.PatientLabourDetailAttributes> {
    let PatientLabourDetail = sequelize.define<i.PatientLabourDetailInstance, i.PatientLabourDetailAttributes>(
        'PatientLabourDetail', {
            Id: {
                type: DataTypes.BIGINT,
                field: 'PatientLabourId',
                primaryKey: true,
                autoIncrement: true
            },
            PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
            GenderId: { type: DataTypes.BIGINT, field: 'GenderId' },
            FacilityId: { type: DataTypes.BIGINT, field: 'FacilityId' },
            // UserId: { type: DataTypes.BIGINT, field: 'UserId' },
            OrganizationId: { type: DataTypes.BIGINT, field: 'OrganizationId' },
            LMPDate: { type: DataTypes.DATE, field: 'LMPDate' },
            EDD: { type: DataTypes.DATE, field: 'EDD' },
            GAWeeks: { type: DataTypes.DECIMAL, field: 'GAWeeks' },
            GADays: { type: DataTypes.DECIMAL, field: 'GADays' },
            GAById: { type: DataTypes.BIGINT, field: 'GAById' },
            PastDelivery: { type: DataTypes.STRING, field: 'PastDelivery' },
            PastAndPresentHistory: {
                type: DataTypes.STRING,
                field: 'PastAndPresentHistory'
            },
            Gravida: { type: DataTypes.DECIMAL, field: 'Gravida' },
            Para: { type: DataTypes.DECIMAL, field: 'Para' },
            FullTerm: { type: DataTypes.STRING, field: 'FullTerm' },
            Premature: { type: DataTypes.STRING, field: 'Premature' },
            Abortion: { type: DataTypes.STRING, field: 'Abortion' },
            Living: { type: DataTypes.STRING, field: 'Living' },
            StillBirth: { type: DataTypes.STRING, field: 'StillBirth' },
            MembraneRupturedId: {
                type: DataTypes.BIGINT,
                field: 'MembraneRupturedId'
            },
            AmnoticFluidId: { type: DataTypes.BIGINT, field: 'AmnoticFluidId' },
            MembraneRupturedDateTime: {
                type: DataTypes.DATE,
                field: 'MembraneRupturedDateTime'
            },
            OnSetOfLabourDateTime: {
                type: DataTypes.DATE,
                field: 'OnSetOfLabourDateTime'
            },
            DilationDateTime: { type: DataTypes.DATE, field: 'DilationDateTime' },
            BirthOfChildDateTime: {
                type: DataTypes.DATE,
                field: 'BirthOfChildDateTime'
            },
            BirthOfPlacentaDateTIme: {
                type: DataTypes.DATE,
                field: 'BirthOfPlacentaDateTIme'
            },
            StageDilationHrs: { type: DataTypes.STRING, field: 'StageDilationHrs' },
            StageDilationMin: { type: DataTypes.STRING, field: 'StageDilationMin' },
            StageBirthOfChildHrs: {
                type: DataTypes.STRING,
                field: 'StageBirthOfChildHrs'
            },
            StageBirthOfChildMin: {
                type: DataTypes.STRING,
                field: 'StageBirthOfChildMin'
            },
            BirthOfPlacentaHrs: {
                type: DataTypes.STRING,
                field: 'BirthOfPlacentaHrs'
            },
            BirthOfPlacentaMin: {
                type: DataTypes.STRING,
                field: 'BirthOfPlacentaMin'
            },
            DurationOfLabourHrs: {
                type: DataTypes.STRING,
                field: 'DurationOfLabourHrs'
            },
            DurationOfLabourMin: {
                type: DataTypes.STRING,
                field: 'DurationOfLabourMin'
            },
            ModeOfDeliveryId: { type: DataTypes.BIGINT, field: 'ModeOfDeliveryId' },
            Complications: { type: DataTypes.STRING, field: 'Complications' },
            PresentationId: { type: DataTypes.BIGINT, field: 'PresentationId' },
            IndicationId: { type: DataTypes.BIGINT, field: 'IndicationId' },
            Episiotomy: { type: DataTypes.INTEGER, field: 'Episiotomy' },
            Laceration: { type: DataTypes.INTEGER, field: 'Laceration' },
            FoetalHeartRate: { type: DataTypes.STRING, field: 'FoetalHeartRate' },
            Contraction: { type: DataTypes.STRING, field: 'Contraction' },
            AnesthesiaId: { type: DataTypes.BIGINT, field: 'AnesthesiaId' },
            AnesthesiaTime: { type: DataTypes.DATE, field: 'AnesthesiaTime' },
            PlacentaAndMembraneId: {
                type: DataTypes.BIGINT,
                field: 'PlacentaAndMembraneId'
            },
            TribandNumber1: { type: DataTypes.STRING, field: 'TribandNumber1' },
            TribandNumber2: { type: DataTypes.STRING, field: 'TribandNumber2' },
            TribandNumber3: { type: DataTypes.STRING, field: 'TribandNumber3' },
            CordLength: { type: DataTypes.STRING, field: 'CordLength' },
            NumberOfBirthChild: {
                type: DataTypes.STRING,
                field: 'NumberOfBirthChild'
            },
            PlacentaWeight: { type: DataTypes.STRING, field: 'PlacentaWeight' },
            GrossAppearanceId: { type: DataTypes.BIGINT, field: 'GrossAppearanceId' },
            LabourStatusId: { type: DataTypes.BIGINT, field: 'LabourStatusId' },
            PostPartumConditionId: {
                type: DataTypes.BIGINT,
                field: 'PostPartumConditionId'
            },
            EBL: { type: DataTypes.DECIMAL, field: 'EBL' },
            MedicationId: { type: DataTypes.BIGINT, field: 'MedicationId' },
            DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
            GrossId: { type: DataTypes.BIGINT, field: 'GrossId' },
            LabourId: { type: DataTypes.BIGINT, field: 'LabourId' },
            EpisiotomyId: { type: DataTypes.BIGINT, field: 'EpisiotomyId' },
            LacerationId: { type: DataTypes.BIGINT, field: 'LacerationId' },
            AnesthesiologistName: {
                type: DataTypes.STRING,
                field: 'AnesthesiologistName'
            },
            Medication: { type: DataTypes.STRING, field: 'Medication' },
            AssistantId: { type: DataTypes.BIGINT, field: 'AssistantId' },
            AnesthesiologistId: {
                type: DataTypes.BIGINT,
                field: 'AnesthesiologistId'
            },
            ScrubNurseName: { type: DataTypes.STRING, field: 'ScrubNurseName' },
            ScrubNurseId: { type: DataTypes.BIGINT, field: 'ScrubNurseId' },
            SM: { type: DataTypes.STRING, field: 'SM' },
            MidWife: { type: DataTypes.STRING, field: 'MidWife' },
            Remarks: { type: DataTypes.STRING, field: 'Remarks' },
            RespirationId10min: {
                type: DataTypes.BIGINT,
                field: 'RespirationId10min'
            },
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
            tableName: 'patientlabourdetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

    (PatientLabourDetail as any).associate = function(models: Models) {
        PatientLabourDetail.belongsTo(models.User, {
            as: 'Doctor',
            foreignKey: 'DoctorId'
        });
        PatientLabourDetail.belongsTo(models.ReferenceValue, {
            as: 'LabourStatus',
            targetKey: 'ReferenceValueCodeId'
        });
        PatientLabourDetail.belongsTo(models.ReferenceValue, {
            as: 'ModeOfDelivery',
            targetKey: 'ReferenceValueCodeId'
        });
        PatientLabourDetail.belongsTo(models.ReferenceValue, {
            as: 'GABy',
            targetKey: 'ReferenceValueCodeId'
        });
        PatientLabourDetail.belongsTo(models.ReferenceValue, {
            as: 'Presentation',
            targetKey: 'ReferenceValueCodeId'
        });
        PatientLabourDetail.belongsTo(models.ReferenceValue, {
            as: 'Indication',
            targetKey: 'ReferenceValueCodeId'
        });
        PatientLabourDetail.belongsTo(models.ReferenceValue, {
            as: 'Labour',
            targetKey: 'ReferenceValueCodeId'
        });
        PatientLabourDetail.belongsTo(models.ReferenceValue, {
            as: 'MembraneRuptured',
            targetKey: 'ReferenceValueCodeId'
        });
        PatientLabourDetail.belongsTo(models.ReferenceValue, {
            as: 'AmnoticFluid',
            targetKey: 'ReferenceValueCodeId'
        });
        PatientLabourDetail.belongsTo(models.ReferenceValue, {
            as: 'UserType',
            foreignKey: 'AnesthesiaId',
            targetKey: 'ReferenceValueCodeId'
        });
        PatientLabourDetail.belongsTo(models.ReferenceValue, {
            as: 'PlacentaMembranes',
            foreignKey: 'PlacentaAndMembraneId',
            targetKey: 'ReferenceValueCodeId'
        });
        PatientLabourDetail.belongsTo(models.ReferenceValue, {
            as: 'GrossAppearance',
            targetKey: 'ReferenceValueCodeId'
        });
        PatientLabourDetail.belongsTo(models.ReferenceValue, {
            as: 'PostPartumCondition',
            targetKey: 'ReferenceValueCodeId'
        });
        PatientLabourDetail.belongsTo(models.ReferenceValue, {
            as: 'Assistant',
            targetKey: 'ReferenceValueCodeId'
        });
        PatientLabourDetail.belongsTo(models.User, {
            as: 'Anesthesiologist',
            foreignKey: 'AnesthesiologistId'
        });
        PatientLabourDetail.belongsTo(models.User, {
            as: 'ScrubNurse',
            foreignKey: 'ScrubNurseId'
        });
        PatientLabourDetail.belongsTo(models.ReferenceValue, {
            as: 'Respiration10min',
            foreignKey: 'RespirationId10min',
            targetKey: 'ReferenceValueCodeId'
        });
    };
    return PatientLabourDetail;
}
