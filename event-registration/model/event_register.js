import mongoose from 'mongoose';

const eventRegisterSchema = new mongoose.Schema({
    EventID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IIC_Event',
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
    FoodCuponIssue:{
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const EventRegister = mongoose.models.IIC_EventRegister || mongoose.model('IIC_EventRegister', eventRegisterSchema);
export default EventRegister;