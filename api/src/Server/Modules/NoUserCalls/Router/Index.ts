import { Router, GetRouter } from '../../../Core/Index';
import * as passport from 'passport';
import * as headerKey from 'passport-headerapikey';
// import VirtualCategory from './VirtualCategory';
// import VirtualSubCategory from './VirtualSubCategory';
import PatientEMR from '../../EMR/Router/Index';
import User from './userRoute';
// import Appointment from './appointmentRoute';
// import VirtualOrder from './VirtualOrderRoute';
import OtpProcess from './OtpVerifyRoute';
import Options from './options';
import Patient from './patientRoute';
// import Service from './ServiceItemRoute';
import Facilities from './FacilityRoute';
import PosLogCallback from './PosLogCallbackRoute';
// import HomeContents from './Ads';

const secretKey = '$2a$14$n1/WBtezgy2BQVsyNYdm9ekcxkcPTQp4tfqS0dOssToM9sgiFIesK';

passport.use(new headerKey.HeaderAPIKeyStrategy(
    { header: 'x-api-key', prefix: 'Api-Key ' },
    false,
    function (apikey, done) {
        if (apikey === secretKey) {
            return done(null, true);
        } else {
            return done(null, false);
        }
    }
));

let router: Router = GetRouter();
router.use((req, res, next) => {
    if (!req.headers['x-api-key'] && req.query.api_key) {
        req.headers['x-api-key'] = req.query.api_key as string;
    }
    next();
});

router.use(passport.authenticate(['headerapikey']));
// router.use('/VirtualCategory', VirtualCategory);
// router.use('/VirtualSubCategory', VirtualSubCategory);
router.use('/user', User);
// router.use('/appointment', Appointment);
// router.use('/VirtualOrder', VirtualOrder);
router.use('/OtpManager', OtpProcess);
router.use('/Options', Options);
router.use('/registration', Patient);
// router.use('/diagnosis', Service);
router.use('/facilities', Facilities);
// router.use('/blogs', HomeContents);
router.use('/patientEMR', PatientEMR);
router.use('/PosManager', PosLogCallback);
router.use('/PosMomentManager', PosLogCallback);

export default router;
