import '../styles/globals.css'
import type { AppProps } from 'next/app'
import AuthContext from '../lib/AuthContext'
import authReducer from '../lib/authReducer'
import { listenAuthState } from '../lib/firebase'
import { useEffect, useReducer } from 'react'
import { useFortressWithFirebase } from 'next-fortress/build/client'
import firebase from 'firebase/app'
import 'prismjs/themes/prism-tomorrow.css'
import '../styles/globals.css'
import Amplify from 'aws-amplify'

Amplify.configure({
  aws_cognito_identity_pool_id:
    process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID,
  aws_cognito_region: process.env.NEXT_PUBLIC_COGNITO_REGION,
  aws_user_pools_id: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
  aws_user_pools_web_client_id:
    process.env.NEXT_PUBLIC_COGNITO_USER_POOL_WEB_CLIENT_ID,
  oauth: {
    domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
    scope: ['openid', 'profile', 'email'],
    redirectSignIn: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_IN,
    redirectSignOut: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_OUT,
    responseType: 'code'
  },
  ssr: true
})

function MyApp({ Component, pageProps }: AppProps) {
  useFortressWithFirebase(firebase)
  const [state, dispatch] = useReducer(
    authReducer.reducer,
    authReducer.initialState
  )
  useEffect(() => {
    listenAuthState(dispatch)
  }, [])

  return (
    <AuthContext.Provider value={state}>
      <Component {...pageProps} />
    </AuthContext.Provider>
  )
}
export default MyApp
