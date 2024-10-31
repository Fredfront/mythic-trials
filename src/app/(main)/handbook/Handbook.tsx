import * as React from "react"
import Image from "next/image"
import
{
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function TournamentHandbook()
{
  const sections = [
    {
      title: "Opprett lag",
      ingress: "For å kunne delta i turneringen må du først logge inn, deretter opprette et lag ved å trykke på påmeldings knappen.",
      content: "Du må logge inn med din discord-konto for å kunne delta i turneringen. Deretter kan du opprette et lag ved å trykke på påmeldingsknappen.",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      title: "Endre lag",
      content: "For å endre på laget ditt, kan gå til Min side og trykke på Endre lag-knappen.",
      ingress: "Du kan endre på laget ditt ved å legge til eller fjerne spillere.",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      title: "Pick ban",
      content: "Understand the pick and ban phase of the tournament matches.",
      ingress: "Learn how to pick and ban champions in the tournament matches.",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      title: "Legg til resultater",
      content: "Learn how to submit match results after your games.",
      ingress: "Submit match results after your games.",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      title: "Endre kampplan (Reschedule)",
      content: "View tournament standings, match history, and statistics.",
      ingress: "View tournament standings, match history, and statistics.",
      image: "/placeholder.svg?height=200&width=300",
    },

    {
      title: "Discord",
      content: "Join our Discord community for real-time updates and support.",
      image: "/placeholder.svg?height=200&width=300",
      ingress: "Join our Discord community for real-time updates and support.",
    },
    {
      title: "Regler for turneringen",
      ingress: "Turneringsregler for deltakelse i turneringen.",
      content: "Reglene for turneringen finner du her. Les nøye gjennom reglene før du deltar i turneringen.",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      title: "Rapportering av problemer",
      content: "How to report technical issues or rule violations.",
      image: "/placeholder.svg?height=200&width=300",
      ingress: "How to report technical issues or rule violations.",
    },
    {
      title: "Trenger du ekstra hjelp med noe?",
      content: (
        <div>Ikke nøl med å ta kontakt om du lurer på noe.</div>
      ),
      image: "/placeholder.svg?height=200&width=300",
      ingress: "Om du trenger ekstra hjelp til noe, kontakt en av våre administratorer.",
    },
  ]

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Tournament Handbook</h1>
      <Accordion type="single" collapsible className="w-full">
        {sections.map((section, index) => (
          <AccordionItem value={`item-${index}`} key={index} >
            <AccordionTrigger className="hover:no-underline hover:opacity-70 hover:bg-gray-800 rounded-lg p-4">
              <div className="flex flex-col justify-start">
                <div className="mr-auto text-lg font-bold">{section.title}</div>
                <div className="text-sm"> {section.ingress}</div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-4">
              <div className="mt-4 space-y-4">
                {section.content}
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                  <Image
                    src={section.image}
                    alt={`${section.title} illustration`}
                    layout="fill"
                    objectFit="cover"
                    className="transition-all duration-300 hover:scale-105"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}