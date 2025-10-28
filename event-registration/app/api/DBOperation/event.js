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

        const now = new Date();
        const newRegistration = new EventRegister({
            ...registrationData,
            EntryTimestamp: now,
            ExitTimestamp: now,
            TotalTimeInside: 0
        });
        const savedRegistration = await newRegistration.save();
        return {
            _id: savedRegistration._id,
            id: savedRegistration._id.toString(),
            EventID: savedRegistration.EventID.toString(),
            Name: savedRegistration.Name,
            Email: savedRegistration.Email,
            Phone: savedRegistration.Phone,
            RollNo: savedRegistration.RollNo,
            FoodCuponNumber: savedRegistration.FoodCuponNumber
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
            FoodCuponNumber: p.FoodCuponNumber || 0,
            FoodCuponIssued: p.FoodCuponIssued || 0
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
        
        console.log('Raw registration from DB:', {
            EntryTimestamp: registration.EntryTimestamp,
            ExitTimestamp: registration.ExitTimestamp,
            TotalTimeInside: registration.TotalTimeInside
        });
        
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
            FoodCuponNumber: registration.FoodCuponNumber || 0,
            FoodCuponIssued: registration.FoodCuponIssued || 0,
            EntryTimestamp: registration.EntryTimestamp,
            ExitTimestamp: registration.ExitTimestamp,
            TotalTimeInside: registration.TotalTimeInside || 0
        };
    } catch (err) {
        throw new Error('Error fetching registration: ' + err.message);
    }
};

const issueFoodCoupons = async (registrationId, issuingCount) => {
    try {
        await connectDB();
        const registration = await EventRegister.findById(registrationId);
        if (!registration) {
            throw new Error('Registration not found');
        }

        const newIssued = (registration.FoodCuponIssued || 0) + issuingCount;
        if (newIssued > registration.FoodCuponNumber) {
            throw new Error('Cannot issue more coupons than allocated');
        }

        const result = await EventRegister.findByIdAndUpdate(
            registrationId,
            { FoodCuponIssued: newIssued },
            { new: true }
        );
        
        return { success: true };
    } catch (err) {
        throw new Error('Error issuing food coupons: ' + err.message);
    }
};

const markEntry = async (registrationId) => {
    try {
        await connectDB();
        const registration = await EventRegister.findById(registrationId);
        if (!registration) {
            throw new Error('Registration not found');
        }

        console.log('Before Entry - Registration:', {
            id: registration._id,
            EntryTimestamp: registration.EntryTimestamp,
            ExitTimestamp: registration.ExitTimestamp,
            TotalTimeInside: registration.TotalTimeInside
        });

        // Check if user is already inside (entry > exit)
        const entryTime = new Date(registration.EntryTimestamp);
        const exitTime = new Date(registration.ExitTimestamp);
        
        console.log('Entry time:', entryTime, 'Exit time:', exitTime);
        console.log('Entry > Exit?', entryTime > exitTime);
        
        if (entryTime > exitTime) {
            throw new Error('User is already inside the auditorium');
        }

        const now = new Date();
        const result = await EventRegister.findByIdAndUpdate(
            registrationId,
            { EntryTimestamp: now },
            { new: true }
        );
        
        console.log('After Entry - Updated to:', {
            EntryTimestamp: result.EntryTimestamp,
            ExitTimestamp: result.ExitTimestamp
        });
        
        return { success: true };
    } catch (err) {
        console.error('Error in markEntry:', err);
        throw new Error('Error marking entry: ' + err.message);
    }
};

const markExit = async (registrationId) => {
    try {
        await connectDB();
        const registration = await EventRegister.findById(registrationId);
        if (!registration) {
            throw new Error('Registration not found');
        }

        const entryTime = new Date(registration.EntryTimestamp);
        const exitTime = new Date(registration.ExitTimestamp);
        
        // Check if user is inside (entry > exit)
        if (entryTime <= exitTime) {
            throw new Error('User is not inside the auditorium');
        }

        const now = new Date();
        const sessionDuration = now.getTime() - entryTime.getTime();
        const newTotal = (registration.TotalTimeInside || 0) + sessionDuration;

        const result = await EventRegister.findByIdAndUpdate(
            registrationId,
            { 
                ExitTimestamp: now,
                TotalTimeInside: newTotal
            },
            { new: true }
        );
        
        return { success: true };
    } catch (err) {
        throw new Error('Error marking exit: ' + err.message);
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
    issueFoodCoupons,
    markEntry,
    markExit
};
