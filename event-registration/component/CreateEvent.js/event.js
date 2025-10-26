"use client"
import { useState } from 'react';
import styles from './styles/event.module.scss';

export default function CreateEvent() {
  const [formData, setFormData] = useState({
    EventName: '',
    EventDetails: '',
    EventDate: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setMessage('Event created successfully!');
        setFormData({ EventName: '', EventDetails: '', EventDate: '' });
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

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Create New Event</h2>
        
        {message && (
          <div className={message.includes('Error') ? styles.error : styles.success}>
            {message}
          </div>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="eventName" className={styles.label}>
              Event Name *
            </label>
            <input
              id="eventName"
              name="EventName"
              type="text"
              required
              value={formData.EventName}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Enter event name"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="eventDetails" className={styles.label}>
              Event Details
            </label>
            <textarea
              id="eventDetails"
              name="EventDetails"
              value={formData.EventDetails}
              onChange={handleInputChange}
              className={styles.textarea}
              placeholder="Enter event details"
              rows={4}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="eventDate" className={styles.label}>
              Event Date *
            </label>
            <input
              id="eventDate"
              name="EventDate"
              type="date"
              required
              value={formData.EventDate}
              onChange={handleInputChange}
              className={styles.input}
            />
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
}
