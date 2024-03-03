import { Icons } from '@/components/loading'
import React from 'react'

function Loading() {
  return (
    <div className="w-full grid place-content-center items-center h-screen">
      <div className="flex">
        Autentiserer bruker <Icons.spinner className="h-4 w-4 animate-spin mt-1 ml-2" />
      </div>
    </div>
  )
}

export default Loading
