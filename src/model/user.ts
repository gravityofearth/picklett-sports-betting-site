import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { setSchemaLean } from ".";
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters'],
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
    },
    fullname: {
        type: String,
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    avatar: {
        type: String,
        trim: true,
    },
    oddstype: {
        type: String,
        required: true,
        enum: ['decimal', "american"]
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: function (value: any) {
                return typeof value === 'string' && value.length >= 6 && /[!@#$%^&*(),.?":{}|<>]/.test(value);
            },
            message: 'Password must be at least 6 characters and contain a special symbol'
        },
        select: false
    },
    balance: {
        type: Number,
        required: true,
        min: [0, 'Balance cannot be negative'],
    },
    ref: {
        type: String,
        unique: true,
        required: true,
    },
    refby: {
        type: String,
        required: false,
        index: true,
    },
    winstreak: {
        type: Number,
        required: true,
        min: [0, 'Winstreak cannot be negative'],
    },
    bets: Number,
    wins: Number,
    earns: Number,
    role: {
        type: String,
        required: true,
    },
    clan: {
        clanId: Schema.Types.ObjectId,
        joined: Boolean,
        role: {
            type: String,
            enum: ['owner', 'elder', 'member'],
        },
        contribution: Number,
        timestamp: Number,
    },

    lastLogin: Date,
    passwordChangedAt: Date,

    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerificationToken: String,
    emailVerificationExpires: Date

}, {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
userSchema.index({ "clan.clanId": 1 })

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
    // Only hash password if it's modified
    if (!this.isModified('password')) return next();

    // Hash password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Pre-save middleware to update passwordChangedAt
userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = new Date(Date.now() - 1000); // Subtract 1 second to ensure token is created after password change
    next();
});
// Solution 1: Enhanced Pre-Middleware with better error handling
userSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], async function () {

    const update = this.getUpdate() as any;

    // Check if balance is being incremented/decremented
    if (update?.$inc && update.$inc.balance !== undefined) {

        const docToUpdate = await this.model.findOne(this.getQuery());
        if (!docToUpdate) {
            const error = new Error('User not found');
            console.log('Error: User not found'); // Debug log
            throw error;
        }
        const currentBalance = docToUpdate.balance;
        const increment = update.$inc.balance;
        const newBalance = currentBalance + increment;

        if (newBalance < 0) {
            const error = new Error(`Insufficient balance. Current: ${currentBalance}, Attempted change: ${increment}, Would result in: ${newBalance}`);
            throw error;
        }
    }
});

// Instance method to check password
userSchema.methods.correctPassword = async function (candidatePassword: string, userPassword: string) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

setSchemaLean(userSchema)
const userModel = mongoose.models.User || mongoose.model("User", userSchema);
export default userModel;
