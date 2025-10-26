import NextAuth from 'next-auth'
import CredentialsProvider from "next-auth/providers/credentials"

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const valid_email_id=process.env.EMAIL_ID;
        const valid_password=process.env.EMAIL_PASSWORD;

        if (credentials?.email === valid_email_id && credentials?.password === valid_password) {
          const user = {
            id: '1',
            email: credentials.email,
            name: credentials.email.split('@')[0]
          }
          return user
        }
        return null
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, 
    updateAge: 24 * 60 * 60, 
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, 
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production' 
      }
    }
  },
  pages: {
    signIn: '/',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.email = token.email
      }
      return session
    }
  }
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }