import { Icons } from '@/components/loading'
import React from 'react'

type LoadingProps = {
  creatingTeam?: boolean
  updatingTeam?: boolean
}

const Loading: React.FC<LoadingProps> = ({ creatingTeam, updatingTeam }: LoadingProps) => {
  return (
    <div className="w-full grid place-content-center items-center h-screen">
      <div className="flex">
        {creatingTeam === true ? (
          <div className="flex text-4xl">
            Oppretter lag... <Icons.spinner className="h-10 w-10 animate-spin mt-1 ml-2" />{' '}
          </div>
        ) : updatingTeam === true ? (
          <div className="flex text-4xl">
            Oppdaterer lag... <Icons.spinner className="h-10 w-10 animate-spin mt-1 ml-2" />{' '}
          </div>
        ) : (
          <div className="flex">
            Autentiserer bruker <Icons.spinner className="h-4 w-4 animate-spin mt-1 ml-2" />{' '}
          </div>
        )}
      </div>
    </div>
  )
}

export default Loading
