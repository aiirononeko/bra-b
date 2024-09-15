import { Link } from '@remix-run/react'

export const Header = () => {
	return (
		<header className='px-6 md:px-8 flex justify-between items-center h-16 border-b bg-white bg-opacity-50 fixed w-full'>
			<h1>
				<Link to='/' className='text-lg'>
					braB
				</Link>
			</h1>
		</header>
	)
}
