import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import {EVENT_DBOperation} from '../DBOperation/event'

const typeDefs=`#graphql
    type Event {
        id: ID!
        EventName: String!
        EventDetails: String
        EventDate: String!
    }

    input CreateEventInput {
        EventName: String!
        EventDetails: String
        EventDate: String!
    }

    input RegisterEventInput {
        EventID: ID!
        Name: String!
        Email: String!
        Phone: String
        RollNo: String!
    }

    type Registration {
        id: ID!
        EventID: String!
        Name: String!
        Email: String!
        Phone: String
        RollNo: String!
    }
        
    type Query {
        events: [Event!]!
        getRegisteredParticipants(eventId: ID!): [Registration!]!
    }

    type Mutation {
        createEvent(eventData: CreateEventInput!): Event
        registerForEvent(registrationData: RegisterEventInput!): Registration
    }
`;

const resolvers={
    Query : {
        events: async () => {
            return await EVENT_DBOperation.getAllEvents();
        },
        getRegisteredParticipants: async (_, { eventId }) => {
            const participants = await EVENT_DBOperation.getRegisteredParticipants(eventId);
            return participants.map(p => ({
                id: p._id.toString(),
                EventID: p.EventID.toString(),
                Name: p.Name,
                Email: p.Email,
                Phone: p.Phone,
                RollNo: p.RollNo
            }));
        }
    },
    Mutation: {
        createEvent: async (_, { eventData }) => {
            try {
                const createdEvent = await EVENT_DBOperation.createEvent(eventData);
                return {
                    id: createdEvent._id.toString(),
                    EventName: createdEvent.EventName,
                    EventDetails: createdEvent.EventDetails,
                    EventDate: createdEvent.EventDate
                };
            } catch (error) {
                throw new Error('Failed to create event: ' + error.message);
            }
        },
        registerForEvent: async (_, { registrationData }) => {
            try {
                const registration = await EVENT_DBOperation.registerForEvent(registrationData);
                return {
                    id: registration._id.toString(),
                    EventID: registration.EventID.toString(),
                    Name: registration.Name,
                    Email: registration.Email,
                    Phone: registration.Phone,
                    RollNo: registration.RollNo
                };
            } catch (error) {
                throw new Error('Failed to register for event: ' + error.message);
            }
        }
    }
}

const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
});

export const handler = startServerAndCreateNextHandler(apolloServer, {
    context: async (req, res) => ({ req, res }),
});

export { handler as GET, handler as POST };