import dayjs from 'dayjs';
import { createRequire } from 'module';
import Subscription from '../models/subscription.model.js';
const require = createRequire(import.meta.url);

//since we mentioned type:module in package.json, we have to allow the use of require for this file
//by doing the above code


const { serve } = require('@upstash/workflow/express');
//since upstash most likely to be wriiten in common js, better use require instead of import

const REMINDERS = [7, 5, 2 , 1];

export const sendReminders = serve( async (context) => {

    if (!context.requestPayload) {
        console.log('Request payload is undefined');
        return;
    }

    const { subscriptionId } = context.requestPayload;
    const subscription = await getSubscription(context, subscriptionId);

    if(!subscription || subscription.status !== 'active') return;

    const renewalDate = dayjs(subscription.renewalDate);
    if(renewalDate.isBefore(dayjs())){
        console.log(`Renewal date has been passed for ${subscriptionId}.... Stopping workfolw`);
        return;
    }

    for(const daysBefore of REMINDERS){
        const reminderDate = renewalDate.subtract(daysBefore, 'day');
        //renewal date = 22nd feb , remainder date = 15th feb, 17, 20, 21

        if(reminderDate.isAfter(dayjs())){
            await sleepUntilReminder(context, `Reminder ${daysBefore} days before`, reminderDate);
        }

        await triggerReminder(context, `Reminder ${daysBefore} days before`)
    }

});

const getSubscription = async (context, subscriptionId) => {
    return await context.run('get subscription', async () => {
        return Subscription.findById(subscriptionId).populate('user', 'name email');
    });
}

const sleepUntilReminder = async (context, label, date) => {
    console.log(`Sleeping until ${label} reminder at ${date}`);
    await context.sleepUntil(label, date.toDate());
}

const triggerReminder = async (context, label) => {
    return await context.run(label , () => {
        console.log(`Triggering ${label} reminder`);
        //send email, sms , push notification, any custom logic, periodically...
    });
}