import connectDB from '@/lib/db';
import Event from '@/model/event';
import EventRegister from '@/model/event_register';

const createEvent = async (eventData) => {
    try {
        await connectDB();
        const newEvent = new Event({
            EventName: eventData.EventName,
            EventDetails: eventData.EventDetails,
            EventDate: eventData.EventDate
        });
        const savedEvent = await newEvent.save();
        return {
            id: savedEvent._id.toString(),
            EventName: savedEvent.EventName,
            EventDetails: savedEvent.EventDetails,
            EventDate: savedEvent.EventDate
        };
    } catch (err) {
        throw new Error('Error creating event: ' + err.message);
    }
};

const getAllEvents = async () => {
    try {
        await connectDB();
        const events = await Event.find({}).sort({ createdAt: -1 });
        return events.map(event => ({
            id: event._id.toString(),
            EventName: event.EventName,
            EventDetails: event.EventDetails,
            EventDate: event.EventDate
        }));
    } catch (err) {
        throw new Error('Error fetching events: ' + err.message);
    }
};

const registerForEvent = async (registrationData) => {
    try {
        await connectDB();
        const newRegistration = new EventRegister(registrationData);
        const savedRegistration = await newRegistration.save();
        return {
            id: savedRegistration._id.toString(),
            EventID: savedRegistration.EventID.toString(),
            Name: savedRegistration.Name,
            Email: savedRegistration.Email,
            Phone: savedRegistration.Phone,
            RollNo: savedRegistration.RollNo
        };
    } catch (err) {
        throw new Error('Error registering for event: ' + err.message);
    }
};

const getRegisteredParticipants = async (eventId) => {
    try {
        await connectDB();
        const participants = await EventRegister.find({ EventID: eventId }).populate('EventID');
        return participants.map(p => ({
            id: p._id.toString(),
            EventID: p.EventID._id.toString(),
            Name: p.Name,
            Email: p.Email,
            Phone: p.Phone,
            RollNo: p.RollNo
        }));
    } catch (err) {
        throw new Error('Error fetching registered participants: ' + err.message);
    }
};

export const EVENT_DBOperation = {
    createEvent,
    getAllEvents,
    registerForEvent,
    getRegisteredParticipants
};
