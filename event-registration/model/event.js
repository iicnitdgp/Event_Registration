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

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
export default Event;