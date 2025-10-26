"use client"
import { useState, useEffect } from 'react';
import styles from './styles/participants.module.scss';

export default function ViewParticipants() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [participants, setParticipants] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [participantsLoading, setParticipantsLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchParticipants(selectedEvent);
    } else {
      setParticipants([]);
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const result = await response.json();
      if (result.success) {
        setEvents(result.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchParticipants = async (eventId) => {
    setParticipantsLoading(true);
    try {
      const response = await fetch(`/api/participants?eventId=${eventId}`);
      const result = await response.json();
      if (result.success) {
        setParticipants(result.data);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setParticipantsLoading(false);
    }
  };

  const handleEventChange = (e) => {
    setSelectedEvent(e.target.value);
  };

  if (eventsLoading) return <div className={styles.loading}>Loading events...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>View Registered Participants</h2>
        
        <div className={styles.formGroup}>
          <label htmlFor="event" className={styles.label}>
            Select Event
          </label>
          <select
            id="event"
            value={selectedEvent}
            onChange={handleEventChange}
            className={styles.select}
          >
            <option value="">-- Select an Event --</option>
            {events?.map((event) => (
              <option key={event.id} value={event.id}>
                {event.EventName} - {new Date(event.EventDate).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {participantsLoading && (
          <div className={styles.loading}>Loading participants...</div>
        )}

        {selectedEvent && !participantsLoading && (
          <div className={styles.tableContainer}>
            {participants?.length > 0 ? (
              <>
                <h3 className={styles.subtitle}>
                  Total Participants: {participants.length}
                </h3>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Roll No</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant) => (
                      <tr key={participant._id}>
                        <td>{participant.Name}</td>
                        <td>{participant.Email}</td>
                        <td>{participant.Phone || 'N/A'}</td>
                        <td>{participant.RollNo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <div className={styles.noData}>
                No participants registered for this event yet.
              </div>
            )}
          </div>
        )}

        {!selectedEvent && (
          <div className={styles.noData}>
            Please select an event to view participants.
          </div>
        )}
      </div>
    </div>
  );
}
