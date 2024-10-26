'use server'


import { serverClient } from "@/utils/supabase/newServer"
import { Button } from "./ui/button"
import { User } from "lucide-react"

const LoginButton = async () =>
{

  return (
    <Button
      variant="outline"
      className="hidden lg:flex bg-[#011624] text-white"
      onClick={async () =>
      {
        (await serverClient()).auth.signInWithOAuth({
          provider: 'discord',
          options: {
            redirectTo: `${window.location.origin}/`,
          },
        })
      }


      }
    >
      <User className="mr-2 h-4 w-4" /> Logg inn
    </Button>
  )
}

export default LoginButton