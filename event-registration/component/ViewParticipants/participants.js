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
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editParticipant, setEditParticipant] = useState(null);
  const [editForm, setEditForm] = useState({ Name: '', Email: '', Phone: '', RollNo: '', FoodCuponNumber: 0, sendEmail: false });

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

  const openEdit = (p) => {
    setEditParticipant(p);
    setEditForm({
      Name: p.Name || '',
      Email: p.Email || '',
      Phone: p.Phone || '',
      RollNo: p.RollNo || '',
      FoodCuponNumber: p.FoodCuponNumber || 0,
      sendEmail: false,
    });
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditParticipant(null);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'FoodCuponNumber' ? Number(value) : value),
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editParticipant) return;

    setEditLoading(true);
    try {
      const res = await fetch(`/api/participants/${editParticipant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const result = await res.json();
      if (result.success) {
        closeEdit();
        fetchParticipants(selectedEvent);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (err) {
      alert('Error updating participant: ' + err.message);
    } finally {
      setEditLoading(false);
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
                          <div className={styles.actionGroup}>
                            <button
                              onClick={() => openEdit(participant)}
                              className={styles.editButton}
                              disabled={participantsLoading}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(participant.id, participant.Name)}
                              disabled={deleteLoading === participant.id}
                              className={styles.deleteButton}
                            >
                              {deleteLoading === participant.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
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

      {editOpen && (
        <div className={styles.modalOverlay} onClick={closeEdit}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Edit Registration</h3>
            </div>
            <form onSubmit={handleEditSubmit} className={styles.modalBody}>
              <div className={styles.grid2}>
                <div className={styles.formGroupInline}>
                  <label className={styles.label}>Name</label>
                  <input
                    name="Name"
                    value={editForm.Name}
                    onChange={handleEditChange}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.formGroupInline}>
                  <label className={styles.label}>Email</label>
                  <input
                    name="Email"
                    type="email"
                    value={editForm.Email}
                    onChange={handleEditChange}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.formGroupInline}>
                  <label className={styles.label}>Phone</label>
                  <input
                    name="Phone"
                    value={editForm.Phone}
                    onChange={handleEditChange}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroupInline}>
                  <label className={styles.label}>Roll No</label>
                  <input
                    name="RollNo"
                    value={editForm.RollNo}
                    onChange={handleEditChange}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.formGroupInline}>
                  <label className={styles.label}>Food Coupons Allocated</label>
                  <input
                    name="FoodCuponNumber"
                    type="number"
                    min="0"
                    value={editForm.FoodCuponNumber}
                    onChange={handleEditChange}
                    className={styles.input}
                  />
                </div>
              </div>

              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  name="sendEmail"
                  checked={editForm.sendEmail}
                  onChange={handleEditChange}
                />
                <span>Send email notification to participant</span>
              </label>

              <div className={styles.modalActions}>
                <button type="button" onClick={closeEdit} className={styles.cancelButton}>Cancel</button>
                <button type="submit" className={styles.saveButton} disabled={editLoading}>
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
