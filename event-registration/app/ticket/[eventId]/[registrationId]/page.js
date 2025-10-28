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

    useEffect(() => {
        fetchRegistrationDetails();
    }, [eventId, registrationId]);

    const fetchRegistrationDetails = async () => {
        try {
            const response = await fetch(`/api/ticket/${registrationId}`);
            const data = await response.json();
            
            if (data.success) {
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
                                <p><span className={styles.label}>Total Allocated:</span> {registration.FoodCuponNumber}</p>
                                <p><span className={styles.label}>Issued:</span> {registration.FoodCuponIssued || 0}</p>
                                <p><span className={styles.label}>Remaining:</span> {registration.FoodCuponNumber - (registration.FoodCuponIssued || 0)}</p>
                            </div>
                        </div>
                    )}

                    {session && registration.FoodCuponNumber > 0 && registration.FoodCuponIssued < registration.FoodCuponNumber && (
                        <div className={styles.adminSection}>
                            <h2>Admin Actions</h2>
                            <div className={styles.couponSection}>
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
