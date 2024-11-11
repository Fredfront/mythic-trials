'use client'

import * as React from "react"
import
{
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import ReactPlayer from 'react-player';
import Link from "next/link";
import { Button } from "@/components/ui/button";



export default function TournamentHandbook()
{
  const sections = [
    {
      title: "Opprett lag",
      ingress: "For å kunne delta i turneringen må du først logge inn, deretter opprette et lag ved å trykke på påmeldings knappen.",
      content: "Du må logge inn med din discord-konto for å kunne delta i turneringen. Deretter kan du opprette et lag ved å trykke på påmeldingsknappen.",
    },
    {
      title: "Endre lag",
      content: "For å endre på laget ditt, kan gå til Min side og trykke på Endre lag-knappen.",
      ingress: "Du kan endre på laget ditt ved å legge til eller fjerne spillere.",
    },
    {
      title: "Pick ban",
      content: "Pick/Ban åpner 1 uke før kampstart. Hvert lag må gjennomføre en pick ban-fase før kampen starter. Vi anbefaler å starte pick ban så tidlig som mulig, og kommuniser gjerne med motstander lag i deres kamp discord kanal. Rekkefølge på Pick/Ban kommer an på om det er Bo2 eller Bo3, men bortelaget starter alltid.",
      ingress: "Hvert lag som spiller mot hverandre må gjennomføre en pick ban-fase før kampen starter.",
      videoSrc: "/videos/pick-ban.mp4",

    },
    {
      title: "Legg til resultater",
      content: "Det er viktig at begge lag legger til resultatet av kampen etter kampen er ferdig. Begge lag må godkjenne resultatet. Om et lag ikke legger til resultatet, vil laget som har lagt inn resultat kunne erklære seier 24t etter kampen.",
      ingress: "Etter kampen er ferdig, legg til resultatet av kampen. Begge lag må godkjenne resultatet.",
      videoSrc: "/videos/adding-results.mp4",
    },
    {
      title: "Foreslå å endre kampplan",
      content: "Det er mulig å foreslå en ny tid for kampen om den oppsatte tiden ikke passer. Foreslå en ny tid for kampen og vent på svar fra motstander.",
      ingress: "Passer kampen dårlig? Foreslå en ny tid for kampen.",
      videoSrc: "/videos/propose-reschedule.mp4",
    },
    {
      title: "Motta forespørsler om å endre kampplan",
      content: "Har du mottatt en forespørsel om å endre kampplan? Godta eller avslå forespørselen. Motstander vil bli varslet om du godtar eller avslår forespørselen.",
      ingress: "Har motstanderen foreslått en ny tid for kampen? Godta eller avslå forespørselen.",
      videoSrc: "/videos/receive-reschedule-accept.mp4",
    },
    {
      title: "Erklære seier om motstander ikke møter opp",
      content: "Om motstander ikke møter opp til kampen, kan du erklære seier 24t etter kampen og vinne på walkover.",
      ingress: "Har ikke mostanderen møtt opp til kampen? Erklær seier 24t etter kamp og vin på walkover.",
      videoSrc: "/videos/receive-reschedule-accept.mp4",
    },

    {
      title: "Turneringsplatform",
      content: "Her finner du oversikt over kommende kamper, resultater, lag og spillere.",
      ingress: "Turneringsplattformen gir en oversikt over kommende kamper, resultater, lag og spillere.",
      videoSrc: "/videos/tournament-overview.mp4",
    },

    {
      title: "Discord",
      content: "Meste parten av kommunikasjonen vil foregå på Discord. Her kan du kommunisere med motstandere og arrangører, og få notifaksjoner om motstander har foreslått en ny tid for kampen.",
      ingress: "Turneringen har en egen Discord server for påmeldte lag. Her kan du kommunisere med motstandere og arrangører, og få notifaksjoner om motstander har foreslått en ny tid for kampen.",
    },
    {
      title: "Regler for turneringen",
      ingress: "Turneringsregler for deltakelse i turneringen.",
      content: "Reglene for turneringen finner du her. Les nøye gjennom reglene før du deltar i turneringen.",
      link: "/rules",
      buttonLabel: "Les reglene",
    },
    {
      title: "Rapportering av problemer",
      content: "Har du oppdaget et problem med turneringen eller andre ting på nettsiden? Rapporter det her.",
      ingress: "Har du problemer med turneringen? Rapporter det her.",
      link: "/bug-report",
      buttonLabel: "Rapporter problem",
    },

  ]

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Tournament Handbook</h1>
      <Accordion type="single" collapsible className="w-full">
        {sections.map((section, index) => (
          <AccordionItem value={`item-${index}`} key={index} >
            <AccordionTrigger className="hover:no-underline hover:opacity-70 hover:bg-gray-800 rounded-lg p-4 ">
              <div className="flex flex-col justify-start">
                <div className="mr-auto text-lg font-bold">{section.title}</div>
                <div className="text-sm  text-left"> {section.ingress}</div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-4  rounded-lg">
              <div >
                <div className="flex">{section.content}</div>
                {section.videoSrc && (<div className="relative w-auto h-48 mt-4 rounded-lg overflow-hidden">
                  <div className="absolute top-0 left-0 w-auto h-full">
                    <ReactPlayer
                      url={section.videoSrc}
                      controls
                      width="100%"
                      height="100%"
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>

                </div>)}
                {section.link && (<Link href={section.link}><Button className="bg-white mt-4 text-black">{section.buttonLabel}</Button></Link>)}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}