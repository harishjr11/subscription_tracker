import aj from '../config/arcjet.js';

const arcjetMiddleware = async (req, res, next) => {
    try {
        const decision = await aj.protect(req, { requested: 1});
        
        if(decision.isDenied()){
            if(decision.reason.isRateLimit()){
                return res.status(429).send("Too many requests which caused the rate limit to be exceeded. Please try again later.");
            }
            if(decision.reason.isBot()){
                return res.status(403).send("Bot detected.");
            }
        }

        next();

    } catch (error) {
        console.error(`Arcjet middlware error: ${error}`);
        next(error);

    }
}


export default arcjetMiddleware;