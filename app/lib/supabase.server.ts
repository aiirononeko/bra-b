import type { AppLoadContext } from '@remix-run/cloudflare'
import { createServerClient } from '@supabase/ssr'

export const createSupabaseClient = (
	request: Request,
	context: AppLoadContext,
) => {
	const headers = new Headers()

	const supabase = createServerClient(
		context.cloudflare.env.SUPABASE_URL!,
		context.cloudflare.env.SUPABASE_ANON_KEY!,
		{
			cookies: {
				get: (key) => {
					return request.headers
						.get('Cookie')
						?.split(';')
						.find((c) => c.trim().startsWith(`${key}=`))
						?.split('=')[1]
				},
				set: (key, value, options) => {
					headers.append(
						'Set-Cookie',
						`${key}=${value}${
							options
								? `; ${Object.entries(options)
										.map(([k, v]) => `${k}=${v}`)
										.join('; ')}`
								: ''
						}`,
					)
				},
				remove: (key, options) => {
					headers.append(
						'Set-Cookie',
						`${key}=; Max-Age=0${
							options
								? `; ${Object.entries(options)
										.map(([k, v]) => `${k}=${v}`)
										.join('; ')}`
								: ''
						}`,
					)
				},
			},
		},
	)
	return { supabase, headers }
}
