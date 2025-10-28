'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './ticket.module.scss';

export default function TicketPage() {
    const params = useParams();
    const { eventId, registrationId } = params;
    const { data: session } = useSession();
    const [registration, setRegistration] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingCoupon, setUpdatingCoupon] = useState(false);
    const [issuingCount, setIssuingCount] = useState(1);
    const [currentStay, setCurrentStay] = useState(0);
    const [updatingAttendance, setUpdatingAttendance] = useState(false);

    useEffect(() => {
        fetchRegistrationDetails();
    }, [eventId, registrationId]);

    // Update current stay time every second
    useEffect(() => {
        if (!registration) return;

        const updateCurrentStay = () => {
            const entryTime = new Date(registration.EntryTimestamp).getTime();
            const exitTime = new Date(registration.ExitTimestamp).getTime();
            const total = registration.TotalTimeInside || 0;

            console.log('Entry Time:', new Date(registration.EntryTimestamp).toISOString());
            console.log('Exit Time:', new Date(registration.ExitTimestamp).toISOString());
            console.log('Entry > Exit?', entryTime > exitTime);
            console.log('Total Time:', total);

            if (entryTime > exitTime) {
                // User is currently inside
                const now = Date.now();
                const currentStayTime = total + (now - entryTime);
                console.log('User is INSIDE, current stay:', currentStayTime);
                setCurrentStay(currentStayTime);
            } else {
                // User is outside
                console.log('User is OUTSIDE, showing total:', total);
                setCurrentStay(total);
            }
        };

        // Update immediately
        updateCurrentStay();

        // Then update every second
        const interval = setInterval(updateCurrentStay, 1000);

        return () => clearInterval(interval);
    }, [registration]);

    const fetchRegistrationDetails = async () => {
        try {
            const response = await fetch(`/api/ticket/${registrationId}`);
            const data = await response.json();
            
            if (data.success) {
                console.log('Fetched registration data:', data.data);
                setRegistration(data.data);
            } else {
                setError(data.error || 'Failed to fetch registration details');
            }
        } catch (err) {
            setError('Error fetching registration details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFoodCouponIssue = async () => {
        if (!session) {
            alert('You must be logged in to issue food coupons');
            return;
        }

        const remaining = registration.FoodCuponNumber - registration.FoodCuponIssued;
        if (issuingCount > remaining) {
            alert(`Cannot issue ${issuingCount} coupons. Only ${remaining} remaining.`);
            return;
        }

        const confirmIssue = window.confirm(
            `Issue ${issuingCount} food coupon(s) to ${registration.Name}?`
        );

        if (!confirmIssue) return;

        setUpdatingCoupon(true);
        try {
            const response = await fetch(`/api/ticket/${registrationId}/food-coupon`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    issuingCount: issuingCount
                }),
            });

            const data = await response.json();

            if (data.success) {
                setRegistration({ 
                    ...registration, 
                    FoodCuponIssued: registration.FoodCuponIssued + issuingCount 
                });
                setIssuingCount(1);
            } else {
                alert('Error: ' + data.error);
            }
        } catch (err) {
            alert('Error issuing food coupon: ' + err.message);
        } finally {
            setUpdatingCoupon(false);
        }
    };

    const handleAttendance = async (action) => {
        if (!session) {
            alert('You must be logged in to mark attendance');
            return;
        }

        const confirmAction = window.confirm(
            `Mark ${action === 'entry' ? 'entry' : 'exit'} for ${registration.Name}?`
        );

        if (!confirmAction) return;

        setUpdatingAttendance(true);
        try {
            const response = await fetch(`/api/ticket/${registrationId}/attendance`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action }),
            });

            const data = await response.json();

            if (data.success) {
                // Refresh registration details to get updated timestamps
                setLoading(true);
                await fetchRegistrationDetails();
                setLoading(false);
            } else {
                alert('Error: ' + data.error);
            }
        } catch (err) {
            alert('Error marking attendance: ' + err.message);
        } finally {
            setUpdatingAttendance(false);
        }
    };

    const formatDuration = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    };

    const isUserInside = () => {
        if (!registration) return false;
        const entryTime = new Date(registration.EntryTimestamp).getTime();
        const exitTime = new Date(registration.ExitTimestamp).getTime();
        return entryTime > exitTime;
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading ticket...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>{error}</div>
            </div>
        );
    }

    if (!registration) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>Registration not found</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.ticket}>
                <div className={styles.header}>
                    <h1>Event Ticket</h1>
                </div>

                <div className={styles.content}>
                    <div className={styles.section}>
                        <h2>Event Details</h2>
                        <div className={styles.details}>
                            <p><span className={styles.label}>Event Name:</span> {registration.EventName}</p>
                            <p><span className={styles.label}>Event Date:</span> {new Date(registration.EventDate).toLocaleDateString()}</p>
                            {registration.EventDetails && (
                                <p><span className={styles.label}>Details:</span> {registration.EventDetails}</p>
                            )}
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2>Participant Details</h2>
                        <div className={styles.details}>
                            <p><span className={styles.label}>Name:</span> {registration.Name}</p>
                            <p><span className={styles.label}>Roll Number:</span> {registration.RollNo}</p>
                            <p><span className={styles.label}>Email:</span> {registration.Email}</p>
                            <p><span className={styles.label}>Phone:</span> {registration.Phone}</p>
                        </div>
                    </div>

                    {registration.QRCodeUrl && (
                        <div className={styles.qrSection}>
                            <h2>QR Code</h2>
                            <img 
                                src={registration.QRCodeUrl} 
                                alt="Event Ticket QR Code" 
                                className={styles.qrCode}
                            />
                            <p className={styles.qrNote}>
                                Present this QR code at the event venue
                            </p>
                        </div>
                    )}

                    {registration.FoodCuponNumber > 0 && (
                        <div className={styles.foodCouponStatusSection}>
                            <h2>Food Coupon Information</h2>
                            <div className={styles.couponInfo}>
                                <p><strong>Total Allocated:</strong> {registration.FoodCuponNumber}</p>
                                <p><strong>Issued:</strong> {registration.FoodCuponIssued || 0}</p>
                                <p><strong>Remaining:</strong> {registration.FoodCuponNumber - (registration.FoodCuponIssued || 0)}</p>
                            </div>
                        </div>
                    )}

                    {/* Attendance Tracking Section */}
                    <div className={styles.attendanceSection}>
                        <h2>Attendance Tracking</h2>
                        <div className={styles.attendanceInfo}>
                            <div className={styles.statusBadge}>
                                <span className={isUserInside() ? styles.insideBadge : styles.outsideBadge}>
                                    {isUserInside() ? '🟢 Currently Inside' : '🔴 Currently Outside'}
                                </span>
                            </div>
                            <div className={styles.timeInfo}>
                                <p><strong>Current Stay Time:</strong> {formatDuration(currentStay)}</p>
                                <p><strong>Last Entry:</strong> {new Date(registration.EntryTimestamp).toLocaleString()}</p>
                                <p><strong>Last Exit:</strong> {new Date(registration.ExitTimestamp).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {session && (
                        <div className={styles.adminSection}>
                            <h2>Admin Actions</h2>
                            
                            {/* Attendance Controls */}
                            <div className={styles.attendanceControls}>
                                <h3>Auditorium Entry/Exit</h3>
                                {isUserInside() ? (
                                    <button
                                        onClick={() => handleAttendance('exit')}
                                        disabled={updatingAttendance}
                                        className={styles.exitButton}
                                    >
                                        {updatingAttendance ? 'Processing...' : '🚪 Mark Exit'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleAttendance('entry')}
                                        disabled={updatingAttendance}
                                        className={styles.entryButton}
                                    >
                                        {updatingAttendance ? 'Processing...' : '🚪 Mark Entry'}
                                    </button>
                                )}
                            </div>

                            {/* Food Coupon Controls */}
                            {registration.FoodCuponNumber > 0 && registration.FoodCuponIssued < registration.FoodCuponNumber && (
                                <div className={styles.couponSection}>
                                    <h3>Food Coupon Issuance</h3>
                                    <label htmlFor="issuingCount" className={styles.selectLabel}>
                                        Number of coupons to issue:
                                    </label>
                                    <select
                                        id="issuingCount"
                                        value={issuingCount}
                                        onChange={(e) => setIssuingCount(parseInt(e.target.value))}
                                        className={styles.couponSelect}
                                        disabled={updatingCoupon}
                                    >
                                        {Array.from(
                                            { length: registration.FoodCuponNumber - registration.FoodCuponIssued },
                                            (_, i) => i + 1
                                        ).map(num => (
                                            <option key={num} value={num}>{num}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleFoodCouponIssue}
                                        disabled={updatingCoupon}
                                        className={styles.couponButton}
                                    >
                                        {updatingCoupon ? 'Issuing...' : 'Issue Food Coupon(s)'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <p>Thank you for registering!</p>
                </div>
            </div>
        </div>
    );
}
