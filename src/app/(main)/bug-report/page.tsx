import BugReportForm from "@/components/bug-report-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const page = () =>
{
  return (
    <>
      <Link className="flex gap-2 underline p-2" href='/'><ArrowLeft /> Gå tilbake</Link>
      <BugReportForm />

    </>
  )
}

export default page