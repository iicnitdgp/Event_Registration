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
        
        // Check if student is already registered for this event using RollNo or Email
        const existingRegistration = await EventRegister.findOne({
            EventID: registrationData.EventID,
            $or: [
                { RollNo: registrationData.RollNo },
                { Email: registrationData.Email }
            ]
        });

        if (existingRegistration) {
            throw new Error('Student is already registered for this event');
        }

        const newRegistration = new EventRegister(registrationData);
        const savedRegistration = await newRegistration.save();
        return {
            _id: savedRegistration._id,
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
            RollNo: p.RollNo,
            QRCodeUrl: p.QRCodeUrl,
            FoodCuponIssue: p.FoodCuponIssue || false
        }));
    } catch (err) {
        throw new Error('Error fetching registered participants: ' + err.message);
    }
};

const deleteParticipant = async (participantId) => {
    try {
        await connectDB();
        const result = await EventRegister.findByIdAndDelete(participantId);
        if (!result) {
            throw new Error('Participant not found');
        }
        return { success: true };
    } catch (err) {
        throw new Error('Error deleting participant: ' + err.message);
    }
};

const updateRegistrationQRCode = async (registrationId, qrCodeUrl) => {
    try {
        await connectDB();
        const result = await EventRegister.findByIdAndUpdate(
            registrationId,
            { QRCodeUrl: qrCodeUrl },
            { new: true }
        );
        if (!result) {
            throw new Error('Registration not found');
        }
        return { success: true };
    } catch (err) {
        throw new Error('Error updating QR code: ' + err.message);
    }
};

const getEventById = async (eventId) => {
    try {
        await connectDB();
        const event = await Event.findById(eventId);
        if (!event) {
            throw new Error('Event not found');
        }
        return {
            id: event._id.toString(),
            EventName: event.EventName,
            EventDetails: event.EventDetails,
            EventDate: event.EventDate
        };
    } catch (err) {
        throw new Error('Error fetching event: ' + err.message);
    }
};

const getRegistrationById = async (registrationId) => {
    try {
        await connectDB();
        const registration = await EventRegister.findById(registrationId).populate('EventID');
        if (!registration) {
            throw new Error('Registration not found');
        }
        return {
            id: registration._id.toString(),
            EventID: registration.EventID._id.toString(),
            EventName: registration.EventID.EventName,
            EventDetails: registration.EventID.EventDetails,
            EventDate: registration.EventID.EventDate,
            Name: registration.Name,
            Email: registration.Email,
            Phone: registration.Phone,
            RollNo: registration.RollNo,
            QRCodeUrl: registration.QRCodeUrl,
            FoodCuponIssue: registration.FoodCuponIssue || false
        };
    } catch (err) {
        throw new Error('Error fetching registration: ' + err.message);
    }
};

const updateFoodCouponStatus = async (registrationId, foodCouponIssued) => {
    try {
        await connectDB();
        const result = await EventRegister.findByIdAndUpdate(
            registrationId,
            { FoodCuponIssue: foodCouponIssued },
            { new: true }
        );
        if (!result) {
            throw new Error('Registration not found');
        }
        return { success: true };
    } catch (err) {
        throw new Error('Error updating food coupon status: ' + err.message);
    }
};

export const EVENT_DBOperation = {
    createEvent,
    getAllEvents,
    registerForEvent,
    getRegisteredParticipants,
    deleteParticipant,
    updateRegistrationQRCode,
    getEventById,
    getRegistrationById,
    updateFoodCouponStatus
};
