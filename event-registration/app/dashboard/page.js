"use client"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import styles from "./styles/page.module.scss"
import CreateEvent from "@/component/CreateEvent.js/event"
import EventRegistration from "@/component/EventRegistration/events"
import ViewParticipants from "@/component/ViewParticipants/participants"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('create')

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  if (status === "loading") {
    return <div className={styles.loading}>Loading...</div>
  }

  if (!session) {
    return null
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Event Management Dashboard</h1>
            <div className={styles.userInfo}>
              <span className={styles.email}>{session.user.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className={styles.signOutButton}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'create' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('create')}
          >
            Create Event
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'register' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Register for Event
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'view' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('view')}
          >
            View Participants
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'create' && <CreateEvent />}
          {activeTab === 'register' && <EventRegistration />}
          {activeTab === 'view' && <ViewParticipants />}
        </div>
      </div>
    </div>
  )
}
