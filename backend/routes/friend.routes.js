import { Router } from 'express';
import authorize from '../middlewares/auth.middleware.js';
import { acceptFrndRequest, blockUser, cancelFrndRequest, deleteFrnd, getFriends, getRelationshipStatus, placeholder, rejectFrndRequest, sendFrndRequest, unblockUser } from '../controllers/friend.controller.js';


const friendRouter = Router();


friendRouter.get('/', placeholder);
friendRouter.get('/me', authorize, getFriends);
friendRouter.post('/request/:id',authorize, sendFrndRequest);
friendRouter.post('/accept/:id', authorize, acceptFrndRequest);
friendRouter.post('/reject/:id', authorize, rejectFrndRequest);
friendRouter.delete('/request/:id', authorize, cancelFrndRequest);
friendRouter.delete('/:id', authorize, deleteFrnd);

friendRouter.get('/status/:id', authorize, getRelationshipStatus);

friendRouter.post('/block/:id', authorize, blockUser);
friendRouter.delete('/block/:id', authorize, unblockUser);




export default friendRouter;