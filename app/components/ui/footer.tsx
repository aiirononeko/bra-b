import { Link } from '@remix-run/react'

export const Footer = () => {
	return (
		<footer className='border-t sticky top-full p-6 mt-10'>
			<div className='max-w-[430px] space-y-8'>
				<div className='grid grid-cols-2 gap-5 justify-center md:grid-cols-4'>
					<Link to='/' className='text-xs hover:underline'>
						ホーム
					</Link>
					<Link to='/columns' className='text-xs hover:underline'>
						コラム
					</Link>
					<Link to='/how-to' className='text-xs hover:underline'>
						使い方
					</Link>
					<Link to='/terms' className='text-xs hover:underline'>
						規約とポリシー
					</Link>
					<p className='text-xs col-span-2'>
						&copy; 2024 braB. All rights reserved.
					</p>
				</div>
			</div>
		</footer>
	)
}
