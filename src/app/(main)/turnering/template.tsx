import { SignupPage, getSignupData } from '@/app/api/signup/getSignupInfo'

import TournamentNavbar from './components/TournamentNavbar'

export default async function Template({ children }: { children: React.ReactNode }) {
  const signupData = (await getSignupData()) as SignupPage

  return <TournamentNavbar signupData={signupData}>{children}</TournamentNavbar>
}
