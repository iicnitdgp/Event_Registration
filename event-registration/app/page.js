"use client"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import styles from "./page.module.scss"

export default function Component() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (session) {
      router.push("/dashboard")
    }
  }, [session, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid credentials")
    } else if (result?.ok) {
      router.push("/dashboard")
    }
  }

  if (status === "loading") {
    return <div className={styles.loading}>Loading...</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Sign in</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
            />
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <button type="submit" className={styles.button}>
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}