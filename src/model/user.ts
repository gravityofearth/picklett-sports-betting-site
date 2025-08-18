import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema({
    // // Basic Information
    // firstName: {
    //     type: String,
    //     required: [true, 'First name is required'],
    //     trim: true,
    //     maxlength: [50, 'First name cannot exceed 50 characters']
    // },
    // lastName: {
    //     type: String,
    //     required: [true, 'Last name is required'],
    //     trim: true,
    //     maxlength: [50, 'Last name cannot exceed 50 characters']
    // },
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
    // email: {
    //     type: String,
    //     required: [true, 'Email is required'],
    //     unique: true,
    //     lowercase: true,
    //     trim: true,
    //     match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    // },
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
    },
    winstreak: {
        type: Number,
        required: true,
        min: [0, 'Winstreak cannot be negative'],
    },
    role: {
        type: String,
        required: true,
    },

    // // Profile Information
    // bio: {
    //     type: String,
    //     maxlength: [500, 'Bio cannot exceed 500 characters'],
    //     trim: true
    // },
    // avatar: {
    //     url: String,
    //     publicId: String // For cloud storage (Cloudinary, etc.)
    // },
    // dateOfBirth: {
    //     type: Date,
    //     validate: {
    //         validator: function (date) {
    //             return date < new Date();
    //         },
    //         message: 'Date of birth must be in the past'
    //     }
    // },
    // gender: {
    //     type: String,
    //     enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    //     lowercase: true
    // },
    // phoneNumber: {
    //     type: String,
    //     match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
    // },

    // // Location
    // address: {
    //     street: String,
    //     city: String,
    //     state: String,
    //     country: String,
    //     zipCode: String,
    //     coordinates: {
    //         latitude: Number,
    //         longitude: Number
    //     }
    // },

    // // Social Links
    // socialLinks: {
    //     website: {
    //         type: String,
    //         match: [/^https?:\/\/.+/, 'Please enter a valid URL']
    //     },
    //     linkedin: String,
    //     twitter: String,
    //     github: String,
    //     instagram: String
    // },

    // // Preferences
    // preferences: {
    //     theme: {
    //         type: String,
    //         enum: ['light', 'dark', 'auto'],
    //         default: 'light'
    //     },
    //     language: {
    //         type: String,
    //         default: 'en'
    //     },
    //     timezone: {
    //         type: String,
    //         default: 'UTC'
    //     },
    //     emailNotifications: {
    //         type: Boolean,
    //         default: true
    //     },
    //     pushNotifications: {
    //         type: Boolean,
    //         default: true
    //     }
    // },

    // // Account Status
    // isEmailVerified: {
    //     type: Boolean,
    //     default: false
    // },
    // isPhoneVerified: {
    //     type: Boolean,
    //     default: false
    // },
    // isActive: {
    //     type: Boolean,
    //     default: true
    // },
    // role: {
    //     type: String,
    //     enum: ['user', 'admin', 'moderator'],
    //     default: 'user'
    // },

    // Timestamps
    lastLogin: Date,
    passwordChangedAt: Date,

    // Account Recovery
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerificationToken: String,
    emailVerificationExpires: Date

}, {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// // Virtual for full name
// userSchema.virtual('fullName').get(function () {
//     return `${this.firstName} ${this.lastName}`;
// });

// // Virtual for age calculation
// userSchema.virtual('age').get(function () {
//     if (!this.dateOfBirth) return null;
//     const today = new Date();
//     const birthDate = new Date(this.dateOfBirth);
//     let age = today.getFullYear() - birthDate.getFullYear();
//     const monthDiff = today.getMonth() - birthDate.getMonth();
//     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
//         age--;
//     }
//     return age;
// });

// // Indexes for better query performance
// userSchema.index({ email: 1 });
// userSchema.index({ username: 1 });
// userSchema.index({ 'address.city': 1, 'address.country': 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ refField: 1 }, { unique: true });

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

// // Instance method to check if password was changed after JWT was issued
// userSchema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
//     if (this.passwordChangedAt) {
//         const changedTimestamp = this.passwordChangedAt.getTime() / 1000;
//         return JWTTimestamp < changedTimestamp;
//     }
//     return false;
// };

// // Static method to find users by location
// userSchema.statics.findByLocation = function (city, country) {
//     return this.find({
//         'address.city': new RegExp(city, 'i'),
//         'address.country': new RegExp(country, 'i')
//     });
// };

const userModel = mongoose.models.User || mongoose.model("User", userSchema);
export default userModel;
