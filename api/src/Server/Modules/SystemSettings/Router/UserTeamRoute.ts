import * as express from 'express';
import { ServiceFactory } from '../../Base/Index';
import { Router, Request, Response, NextFunction } from '../../../Core/Index';
import { UserTeamService } from '../Service/Index';

let router: Router = express.Router();

router.post('/AddUserTeam', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserTeamService, req);
    service.AddUserTeam(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateUserTeam', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserTeamService, req);
    service.UpdateUserTeam(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetUserTeamById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserTeamService, req);
    service.GetUserTeamById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/ManageUserTeams',
    (req: Request, res: Response, next: NextFunction): any => {
        const service = ServiceFactory.CreateService(UserTeamService, req);
        service.ManageUserTeams(req.body)
            .then((response) => { res.send(response); })
            .catch(next);
    });
router.post('/GetUserTeams', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserTeamService, req);
    service.GetUserTeams(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteUserTeam', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(UserTeamService, req);
    service.DeleteUserTeam(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
