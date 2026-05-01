import * as express from 'express';
import {ServiceFactory} from '../../Base/Index';
import {Router, Request, Response, NextFunction } from '../../../Core/Index';
import { TeamService} from '../Service/Index';

let router: Router = express.Router();

router.post('/AddTeam', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TeamService, req);
    service.AddTeam(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/UpdateTeam', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TeamService, req);
    service.UpdateTeam(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTeamById', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TeamService, req);
    service.GetTeamById(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/GetTeams', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TeamService, req);
    service.GetTeams(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});
router.post('/DeleteTeam', (req: Request, res: Response, next: NextFunction): any => {
    const service = ServiceFactory.CreateService(TeamService, req);
    service.DeleteTeam(req.body)
        .then((response) => { res.send(response); })
        .catch(next);
});

export default router;
