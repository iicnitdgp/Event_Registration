import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    EventName: {
        type: String,
        required: true
    },
    EventDetails: {
        type: String,
    },
    EventDate: {
        type: Date,
        required: true
    }
}, { timestamps: true });

const Event = mongoose.models.IIC_Event || mongoose.model('IIC_Event', eventSchema);
export default Event;