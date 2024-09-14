import { PrismaClient } from "@prisma/client"
import { json } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"

export const loader = async () => {
  const prisma = new PrismaClient()
  const baristas = await prisma.barista.findMany()

  return json({ baristas })
}

export default function Baristas() {
  const { baristas } = useLoaderData<typeof loader>()
  return (
    <div>
      {baristas.map((barista) => (
        <p key={barista.id}>{barista.id}</p>
      ))}
    </div>
  )
}
