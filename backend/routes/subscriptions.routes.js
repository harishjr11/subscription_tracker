import { Router } from 'express';
import authorize from '../middlewares/auth.middleware.js';
import { createSubscription, editSubscription, getUserSubscriptions } from '../controllers/subscription.controller.js';

const subscriptionRouter = Router();

subscriptionRouter.get('/', (req, res) => {
    res.send({title : 'GET all subscriptions'});
})

subscriptionRouter.get('/:id', (req, res) => {
    res.send({title : 'GET subscriptions details by id'});
})

subscriptionRouter.get('/users/:id', authorize, getUserSubscriptions)

subscriptionRouter.put('/:id/cancel', (req, res) => {
    res.send({title : 'CANCEL subscription'});
})

subscriptionRouter.post('/', authorize, createSubscription)

subscriptionRouter.patch('/:id', authorize, editSubscription)

subscriptionRouter.delete('/', (req, res) => {
    res.send({title : 'DELETE a subscription'});
})

subscriptionRouter.get('/upcoming-renewals', (req, res) => {
    res.send({title : 'GET upcoming renewals'});
})

export default subscriptionRouter;