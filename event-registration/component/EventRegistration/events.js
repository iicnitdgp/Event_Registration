"use client"
import { useState, useEffect } from 'react';
import styles from './styles/events.module.scss';

export default function EventRegistration() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [formData, setFormData] = useState({
    Name: '',
    Email: '',
    Phone: '',
    RollNo: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent) {
      setMessage('Please select an event');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          EventID: selectedEvent,
          ...formData
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage('Registration successful!');
        setFormData({ Name: '', Email: '', Phone: '', RollNo: '' });
        // Keep the selectedEvent so user doesn't need to select again
      } else {
        setMessage('Error: ' + result.error);
      }
    } catch (error) {
      setMessage('Error: ' + error.message);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (eventsLoading) return <div className={styles.loading}>Loading events...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Register for Event</h2>
        
        {message && (
          <div className={message.includes('Error') ? styles.error : styles.success}>
            {message}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="event" className={styles.label}>
              Select Event *
            </label>
            <select
              id="event"
              required
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
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

          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Name *
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.Name}
              onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
              className={styles.input}
              placeholder="Enter your name"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email *
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.Email}
              onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
              className={styles.input}
              placeholder="Enter your email"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone" className={styles.label}>
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.Phone}
              onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
              className={styles.input}
              placeholder="Enter your phone number"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="rollNo" className={styles.label}>
              Roll Number *
            </label>
            <input
              id="rollNo"
              type="text"
              required
              value={formData.RollNo}
              onChange={(e) => setFormData({ ...formData, RollNo: e.target.value })}
              className={styles.input}
              placeholder="Enter your roll number"
            />
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}
