import { CacheConfig } from '../config/CacheConfig';

const Arena = require('bull-arena');

const express = require('express');
const router = express.Router();

const arena = Arena({
    queues: [
        {
            name: 'OPCheckOut',
            port: CacheConfig.port,
            host: CacheConfig.host,
            hostId: 'Jobs'
        },
        {
            name: 'IPBillModification',
            port: CacheConfig.port,
            host: CacheConfig.host,
            hostId: 'Jobs'
        },
        {
            name: 'SMSFollowUpAppointment',
            port: CacheConfig.port,
            host: CacheConfig.host,
            hostId: 'Jobs'
        },
        {
            name: 'RedistosqlSeqbackupJob',
            port: CacheConfig.port,
            host: CacheConfig.host,
            hostId: 'Jobs'
        },
        {
            name: 'SMSFollowUpPrescriptionJob',
            port: CacheConfig.port,
            host: CacheConfig.host,
            hostId: 'Jobs'
        }
    ]
});
router.use('/', arena);
export { router as arena };
