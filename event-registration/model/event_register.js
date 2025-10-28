import mongoose from 'mongoose';

const eventRegisterSchema = new mongoose.Schema({
    EventID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Events',
        required: true
    },
    Name: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true
    },
    Phone: {
        type: String
    },
    RollNo: {
        type: String,
        required: true
    },
    QRCodeUrl: {
        type: String
    },
    FoodCuponNumber:{
        type: Number,
        default: 0,
        required: false
    },
    FoodCuponIssued:{
        type: Number,
        default: 0,
        required: false
    },
    EntryTimestamp: {
        type: Date,
        default: () => new Date()
    },
    ExitTimestamp: {
        type: Date,
        default: () => new Date()
    },
    TotalTimeInside: {
        type: Number,
        default: 0  // in milliseconds
    }
}, { timestamps: true });

const EventRegister = mongoose.models.IIC_EventRegisters || mongoose.model('IIC_EventRegisters', eventRegisterSchema);
export default EventRegister;