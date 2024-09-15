import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { Heart, UserRound } from 'lucide-react'

export const loader = async ({ context }: LoaderFunctionArgs) => {
	const prisma = new PrismaClient({
		datasourceUrl: context.cloudflare.env.DATABASE_URL,
	}).$extends(withAccelerate())

	const baristas = await prisma.barista.findMany({
		include: {
			profile: {},
			store: {},
		},
		cacheStrategy: { ttl: 60 },
	})

	return json({ baristas })
}

export default function Baristas() {
	const { baristas } = useLoaderData<typeof loader>()

	return (
		<div className='flex flex-col gap-4 max-w-[430px] mx-6'>
			{baristas.map((barista) => (
				<div key={barista.id} className='border p-4 space-y-4'>
					<div className='grid grid-cols-5 gap-6 items-center'>
						<div className='size-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 col-span-1'>
							<UserRound />
						</div>
						<div className='col-span-3'>
							<p>{barista.profile?.name}</p>
							<div className='flex gap-2 items-baseline'>
								<p className='text-sm'>バリスタ歴</p>
								<p>{barista.profile?.yearsExperience}年</p>
							</div>
						</div>
						<div className='col-span-1 flex flex-col justify-center items-center'>
							<Heart />
							<span className='text-gray-400 text-sm'>256</span>
						</div>
					</div>
					<div>
						<p>{barista.store?.name}</p>
					</div>
				</div>
			))}
		</div>
	)
}
