import { PrismaClient } from "@prisma/client/edge"
import { withAccelerate } from "@prisma/extension-accelerate"
import { json, LoaderFunctionArgs } from "@remix-run/cloudflare"
import { useLoaderData } from "@remix-run/react"
import { Calendar, Coffee, Heart, MapPin, UserRound } from "lucide-react"
import invariant from "tiny-invariant"
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Breadcrumbs,
} from "~/components/ui/breadcrumbs"

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
  invariant(params.id, 'IDが指定されていません')

  const prisma = new PrismaClient({
    datasourceUrl: context.cloudflare.env.DATABASE_URL,
  }).$extends(withAccelerate())

  const barista = await prisma.barista.findFirst({
    where: {
      id: params.id
    },
    include: {
      profile: {},
      store: {},
    },
    cacheStrategy: { ttl: 60 },
  })

  return json({ barista })
}

export default function BaristaDetail() {
  const { barista } = useLoaderData<typeof loader>()

  return (
    <div>
      <Breadcrumbs className='mx-6 my-4'>
        <BreadcrumbItem>
          <BreadcrumbLink href="/baristas">すべてのバリスタ</BreadcrumbLink>
          <BreadcrumbSeparator />
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>{barista?.profile?.name}のプロフィール</BreadcrumbPage>
        </BreadcrumbItem>
      </Breadcrumbs>
      <div className='h-52 bg-gray-100 flex items-center justify-center text-gray-300'>
        <Coffee className='size-10' />
      </div>
      <div className='m-6 space-y-6'>
        <div className='space-y-4'>
          <div className='grid grid-cols-5 gap-6 items-center'>
            <div className='size-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 col-span-1'>
              <UserRound />
            </div>
            <div className='col-span-3'>
              <p className='text-xl'>{barista?.profile?.name}</p>
              <div className='flex gap-2 items-baseline'>
                <p className='text-sm'>バリスタ歴</p>
                <p>{barista?.profile?.yearsExperience}年</p>
              </div>
            </div>
            <div className='col-span-1 flex flex-col justify-center items-center'>
              <Heart />
              <span className='text-gray-400 text-sm'>256</span>
            </div>
          </div>
        </div>
        <div className='space-y-2'>
          <h2 className='text-lg'>自己紹介</h2>
          <p>{barista?.profile?.bio}</p>
        </div>
        <div className='space-y-2'>
          <h2 className='text-lg'>勤務場所</h2>
          <p>{barista?.store?.name}</p>
          <p>{barista?.store?.address}</p>
          <div className='h-60 bg-gray-100 flex items-center justify-center text-gray-300'>
            <MapPin />
          </div>
        </div>
        <div className='space-y-2'>
          <h2 className='text-lg'>出勤表</h2>
          <div className='h-60 bg-gray-100 flex items-center justify-center text-gray-300'>
            <Calendar />
          </div>
        </div>
      </div>
    </div>
  )
}
