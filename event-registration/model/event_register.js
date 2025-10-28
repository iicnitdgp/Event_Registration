import mongoose from 'mongoose';

const eventRegisterSchema = new mongoose.Schema({
    EventID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
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
    }
}, { timestamps: true });

const EventRegister = mongoose.models.IIC_EventRegister || mongoose.model('IIC_EventRegister', eventRegisterSchema);
export default EventRegister;