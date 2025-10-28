"use client"
import { useState, useEffect } from 'react';
import styles from './styles/participants.module.scss';

export default function ViewParticipants() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [participants, setParticipants] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);

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

  const handleDelete = async (participantId, participantName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${participantName}'s registration?`
    );

    if (!confirmDelete) return;

    setDeleteLoading(participantId);
    try {
      const response = await fetch(`/api/participants/${participantId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        // Refresh participants list
        fetchParticipants(selectedEvent);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Error deleting participant: ' + error.message);
    } finally {
      setDeleteLoading(null);
    }
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
                      <th>Food Coupons</th>
                      <th>QR Code</th>
                      <th>Coupon Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant) => (
                      <tr key={participant.id}>
                        <td>{participant.Name}</td>
                        <td>{participant.Email}</td>
                        <td>{participant.Phone || 'N/A'}</td>
                        <td>{participant.RollNo}</td>
                        <td>{participant.FoodCuponNumber || 0}</td>
                        <td>
                          {participant.QRCodeUrl ? (
                            <a 
                              href={participant.QRCodeUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={styles.qrLink}
                            >
                              View QR
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td>
                          {participant.FoodCuponNumber > 0 ? (
                            <div className={styles.couponStatus}>
                              <span className={styles.couponIssued}>
                                Issued: {participant.FoodCuponIssued || 0} / {participant.FoodCuponNumber}
                              </span>
                              <span className={styles.couponRemaining}>
                                Remaining: {participant.FoodCuponNumber - (participant.FoodCuponIssued || 0)}
                              </span>
                            </div>
                          ) : (
                            <span className={styles.couponNotAllocated}>Not Allocated</span>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => handleDelete(participant.id, participant.Name)}
                            disabled={deleteLoading === participant.id}
                            className={styles.deleteButton}
                          >
                            {deleteLoading === participant.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
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
