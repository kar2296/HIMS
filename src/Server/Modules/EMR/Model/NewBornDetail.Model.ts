import * as SequelizeStatic from 'sequelize';
import { DataTypes, Sequelize } from 'sequelize';
import * as i from './Interface/Index';

export default function (sequelize: Sequelize, DataTypes: DataTypes):
    SequelizeStatic.Model<i.NewBornDetailInstance, i.NewBornDetailAttributes> {
    let NewBornDetail = sequelize.define<i.NewBornDetailInstance, i.NewBornDetailAttributes>('NewBornDetail', {
        Id: { type: DataTypes.BIGINT, field: 'NewBornId', primaryKey: true, autoIncrement: true },
        PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
        EncounterId: { type: DataTypes.BIGINT, field: 'EncounterId' },
        DoctorId: { type: DataTypes.BIGINT, field: 'DoctorId' },
        GenderId: { type: DataTypes.BIGINT, field: 'GenderId' },
        DeliveryDate: { type: DataTypes.DATE, field: 'DeliveryDate' },
        Weight: { type: DataTypes.DECIMAL, field: 'Weight' },
        Length: { type: DataTypes.DECIMAL, field: 'Length' },
        FacilityId: { type: DataTypes.BIGINT, field: 'Length' },
        BtLr: { type: DataTypes.DECIMAL, field: 'BtLr' },
        BtNsy: { type: DataTypes.DECIMAL, field: 'BtNsy' },
        CordBloodForId: { type: DataTypes.BIGINT, field: 'CordBloodForId' },
        CordBlood: { type: DataTypes.STRING, field: 'CordBlood' },
        HeadCircumference: { type: DataTypes.DECIMAL, field: 'HeadCircumference' },
        ChestCircumference: { type: DataTypes.DECIMAL, field: 'ChestCircumference' },
        Comments: { type: DataTypes.STRING, field: 'Comments' },
        ModeOfDeliveryId: { type: DataTypes.BIGINT, field: 'ModeOfDeliveryId' },
        BirthOutComeId: { type: DataTypes.BIGINT, field: 'BirthOutComeId' },
        UrineId: { type: DataTypes.BIGINT, field: 'UrineId' },
        BloodGroupId: { type: DataTypes.BIGINT, field: 'BloodGroupId' },
        RhFactorId: { type: DataTypes.BIGINT, field: 'RhFactorId' },
        StoolsId: { type: DataTypes.BIGINT, field: 'StoolsId' },
        PatencyOfAnusId: { type: DataTypes.BIGINT, field: 'PatencyOfAnusId' },
        PediatricianId: { type: DataTypes.BIGINT, field: 'PediatricianId' },
        JellyCordTypeId: { type: DataTypes.BIGINT, field: 'JellyCordTypeId' },
        JellyCordCutById: { type: DataTypes.BIGINT, field: 'JellyCordCutById' },
        CongentialAnomaliesId: { type: DataTypes.BIGINT, field: 'CongentialAnomaliesId' },
        DeliveryComplicationsId: { type: DataTypes.BIGINT, field: 'DeliveryComplicationsId' },
        Resuscitation: { type: DataTypes.STRING, field: 'Resuscitation' },
        TribandNumber: { type: DataTypes.STRING, field: 'TribandNumber' },
        ColourId1min: { type: DataTypes.BIGINT, field: 'ColourId1min' },
        ColourId5min: { type: DataTypes.BIGINT, field: 'ColourId5min' },
        ColourId10min: { type: DataTypes.BIGINT, field: 'ColourId10min' },
        ReflexesId: { type: DataTypes.BIGINT, field: 'ReflexesId' },
        ReflexesId1min: { type: DataTypes.BIGINT, field: 'ReflexesId1min' },
        ReflexesId5min: { type: DataTypes.BIGINT, field: 'ReflexesId5min' },
        ReflexesId10min: { type: DataTypes.BIGINT, field: 'ReflexesId10min' },
        HeartRateId1min: { type: DataTypes.BIGINT, field: 'HeartRateId1min' },
        HeartRateId5min: { type: DataTypes.BIGINT, field: 'HeartRateId5min' },
        HeartRateId10min: { type: DataTypes.BIGINT, field: 'HeartRateId10min' },
        MuscleToneId1min: { type: DataTypes.BIGINT, field: 'MuscleToneId1min' },
        MuscleToneId5min: { type: DataTypes.BIGINT, field: 'MuscleToneId5min' },
        MuscleToneId10min: { type: DataTypes.BIGINT, field: 'MuscleToneId10min' },
        RespirationId1min: { type: DataTypes.BIGINT, field: 'RespirationId1min' },
        RespirationId5min: { type: DataTypes.BIGINT, field: 'RespirationId5min' },
        RespirationId10min: { type: DataTypes.BIGINT, field: 'RespirationId10min' },
        NewBornStatusId: { type: DataTypes.BIGINT, field: 'NewBornStatusId' },
        HEIGHTUNITSId: { type: DataTypes.BIGINT, field: 'HEIGHTUNITSId' },
        WeightUnitsId: { type: DataTypes.BIGINT, field: 'WeightUnitsId' },
        APGARScore1min: { type: DataTypes.DECIMAL, field: 'APGARScore1min' },
        APGARScore5min: { type: DataTypes.DECIMAL, field: 'APGARScore5min' },
        APGARScore10min: { type: DataTypes.DECIMAL, field: 'APGARScore10min' },
        Min1min: { type: DataTypes.DECIMAL, field: 'Min1min' },
        Min5min: { type: DataTypes.DECIMAL, field: 'Min5min' },
        Min10min: { type: DataTypes.DECIMAL, field: 'Min10min' },
        Oxygen1min: { type: DataTypes.DECIMAL, field: 'Oxygen1min' },
        Oxygen5min: { type: DataTypes.DECIMAL, field: 'Oxygen5min' },
        Oxygen10min: { type: DataTypes.DECIMAL, field: 'Oxygen10min' },
        PPV1min: { type: DataTypes.DECIMAL, field: 'PPV1min' },
        PPV5min: { type: DataTypes.DECIMAL, field: 'PPV5min' },
        PPV10min: { type: DataTypes.DECIMAL, field: 'PPV10min' },
        ETT1min: { type: DataTypes.DECIMAL, field: 'ETT1min' },
        ETT5min: { type: DataTypes.DECIMAL, field: 'ETT5min' },
        ETT10min: { type: DataTypes.DECIMAL, field: 'ETT10min' },
        ChestCompression1min: { type: DataTypes.DECIMAL, field: 'ChestCompression1min' },
        ChestCompression5min: { type: DataTypes.DECIMAL, field: 'ChestCompression5min' },
        ChestCompression10min: { type: DataTypes.DECIMAL, field: 'ChestCompression10min' },
        Epinephrine1min: { type: DataTypes.DECIMAL, field: 'Epinephrine1min' },
        Epinephrine5min: { type: DataTypes.DECIMAL, field: 'Epinephrine5min' },
        Epinephrine10min: { type: DataTypes.DECIMAL, field: 'Epinephrine10min' },
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
            tableName: 'newborndetails',
            createdAt: 'CreatedAt',
            updatedAt: 'UpdatedAt',
            freezeTableName: true,
            defaultScope: {
                where: {
                    Status: 1
                }
            }
        });

     (NewBornDetail as any).associate = function(models: Models) {
                    NewBornDetail.belongsTo(models.ReferenceValue, {
                        as: 'Gender',
                        targetKey: 'ReferenceValueCodeId'
                    });
                    NewBornDetail.belongsTo(models.ReferenceValue, {
                        as: 'ModeOfDelivery',
                        targetKey: 'ReferenceValueCodeId'
                    });
                    NewBornDetail.belongsTo(models.ReferenceValue, {
                        as: 'NewBornStatus',
                        targetKey: 'ReferenceValueCodeId'
                    });
                    NewBornDetail.belongsTo(models.ReferenceValue, {
                        as: 'CongentialAnomalies',
                        targetKey: 'ReferenceValueCodeId'
                    });
                    NewBornDetail.belongsTo(models.ReferenceValue, {
                        as: 'CordBloodFor',
                        targetKey: 'ReferenceValueCodeId'
                    });
                    NewBornDetail.belongsTo(models.ReferenceValue, {
                        as: 'DeliveryComplications',
                        targetKey: 'ReferenceValueCodeId'
                    });
                    NewBornDetail.belongsTo(models.ReferenceValue, {
                        as: 'BirthOutCome',
                        targetKey: 'ReferenceValueCodeId'
                    });
                    NewBornDetail.belongsTo(models.ReferenceValue, {
                        as: 'Urine',
                        targetKey: 'ReferenceValueCodeId'
                    });
                    NewBornDetail.belongsTo(models.ReferenceValue, {
                        as: 'BloodGroup',
                        targetKey: 'ReferenceValueCodeId'
                    });
                    NewBornDetail.belongsTo(models.ReferenceValue, {
                        as: 'RhFactor',
                        targetKey: 'ReferenceValueCodeId'
                    });
                    NewBornDetail.belongsTo(models.ReferenceValue, {
                        as: 'PatencyOfAnus',
                        targetKey: 'ReferenceValueCodeId'
                    });
                    NewBornDetail.belongsTo(models.ReferenceValue, {
                        as: 'JellyCordType',
                        targetKey: 'ReferenceValueCodeId'
                    });
                    NewBornDetail.belongsTo(models.ReferenceValue, {
                        as: 'JellyCordCutBy',
                        targetKey: 'ReferenceValueCodeId'
                    });
                    NewBornDetail.belongsTo(models.ReferenceValue, {
                        as: 'WeightUnits',
                        targetKey: 'ReferenceValueCodeId'
                    });
                    NewBornDetail.belongsTo(models.ReferenceValue, {
                        as: 'HEIGHTUNITS',
                        targetKey: 'ReferenceValueCodeId'
                    });
                    NewBornDetail.belongsTo(models.ReferenceValue, {
                        as: 'Colour',
                        foreignKey: 'ColourId1min',
                        targetKey: 'ReferenceValueCodeId'
                    });
                    NewBornDetail.belongsTo(models.ReferenceValue, {
                        as: 'Reflexes',
                        foreignKey: 'ReflexesId1min',
                        targetKey: 'ReferenceValueCodeId'
                    });
                    NewBornDetail.belongsTo(models.ReferenceValue, {
                        as: 'ReflexesBase',
                        foreignKey: 'ReflexesId',
                        targetKey: 'ReferenceValueCodeId'
                    });
                    NewBornDetail.belongsTo(models.ReferenceValue, {
                        as: 'HeartRate',
                        foreignKey: 'HeartRateId1min',
                        targetKey: 'ReferenceValueCodeId'
                    });
                    NewBornDetail.belongsTo(models.ReferenceValue, {
                        as: 'MuscleTone',
                        foreignKey: 'MuscleToneId1min',
                        targetKey: 'ReferenceValueCodeId'
                    });
                    NewBornDetail.belongsTo(models.ReferenceValue, {
                        as: 'Respiration',
                        foreignKey: 'RespirationId1min',
                        targetKey: 'ReferenceValueCodeId'
                    });
                    NewBornDetail.belongsTo(models.User, {
                        as: 'Createdby',
                        foreignKey: 'CreatedBy'
                    });
                    NewBornDetail.belongsTo(models.User, {
                        as: 'Doctor',
                        foreignKey: 'DoctorId'
                    });
                    NewBornDetail.belongsTo(models.User, {
                        as: 'Pediatrician',
                        foreignKey: 'PediatricianId'
                    });
                };
 return NewBornDetail;
}
