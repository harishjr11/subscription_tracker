import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    name: {
        type:String,
        required: [true, 'Subscription Name is required'],
        trim: true,
        minLength: 2,
        maxLength: 50,
    },
    
    price: {
        type: Number,
        required: [true, 'Subscription Price is required'],
        min: [0, 'Price must be greater than 0'],
    },

    frequency: {
        type: String,
        required: [true, 'Subscription Frequency is required'],
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
    },

    category: {
        type: String,
        required: [true, 'Subscription Category is required'],
        enum: ['food', 'clothing', 'entertainment', 'other'],
    },

    paymentMethod: {
        type: String,
        required: [true, 'Payment Method is required'],
        trim: true,
        enum: ['credit card', 'debit card', 'paypal','upi', 'other'],
    },

    status: {
        type: String,
        enum: ['active', 'paused','pending','cancelled','expired'],
        default: 'active',
    },

    startDate: {
        type: Date,
        required: [true, 'Subscription Start Date is required'],
        validate: {
            validator: (v) => v <= new Date(),
            message: 'Subscription Start Date must be a date in the past',
        }
    },

    renewalDate: {
        type: Date,
        validate: {
            validator: function (v) {
                if (!v) return true; // Allow undefined values (auto-calculated)
                return this.startDate ? v > this.startDate : true;
            },
            message: "renewalDate must be after startDate",
        },
    },
        
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
        index: true,
    }
    
}, { timestamps: true });


subscriptionSchema.pre('save', function (next) {
    if (!this.startDate) {
        return next(new Error('Start Date is required before setting Renewal Date'));
    }

    // Auto-calculate renewalDate if missing
    if (!this.renewalDate) {
        const renewalPeriods = {
            daily: 1,
            weekly: 7,
            monthly: 30,
            yearly: 365,
        };

        this.renewalDate = new Date(this.startDate);
        this.renewalDate.setDate(this.renewalDate.getDate() + renewalPeriods[this.frequency]);
    }

    // Update status
    if (this.renewalDate < new Date()) {
        this.status = 'expired';
    }

    next();
});


const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;