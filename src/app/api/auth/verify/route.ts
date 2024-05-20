import { auth, signIn } from "@/server/auth"
import { readFile } from "fs/promises";
import { METHODS } from "http";
import { NextRequest, userAgent, userAgentFromString } from "next/server"
import yaml from 'yaml'
export const dynamic = 'force-dynamic'
// TODO: websocket support
export const GET = async (req: NextRequest) => {
    console.log('reading')
    const users = await readFile('./prisma/users.yaml', 'utf8').then(yaml.parse)
    console.log('authing')
    const session = await auth()
    console.log(session, req.nextUrl, req.headers);
    const obj = Object.fromEntries([...req.headers.entries()].flatMap(([h, value]) => {
        const key = h.match("x-forwarded-(.*)")?.[1];
        if (key) return [[key, value]];
        return [];
    })) as Record<'for' | 'host' | 'method' | 'port' | 'proto' | 'uri', string>;
    const { host, port, proto, uri, method } = obj
    // const rd = new URL(uri, { host, port, protocol: proto })
    // ``
    // todo: restore session
    console.log(obj)
    const redirectTo = host ? proto + '://' + host + uri : req.nextUrl.searchParams.get('rd') ?? undefined
    console.log(Object.fromEntries(req.headers.entries()))

    if (!session?.user.email) return await signIn('', {
        // redirectTo: 'https://calibre-snoauth.snomiao.dev/'
        // redirectTo: proto + '://' + host + uri,
        redirect: true,
        redirectTo
    }) // TODO: ?rm=

    console.log(req.nextUrl)

    // whitelist

    if (
        users.sites?.[host]?.[session.user.email] === 'allow' ||
        users.users?.[session.user.email]?.[host] === 'allow' ||
        users.sites?.[host] === '*' ||
        users.users?.[session.user.email] === '*'
    ) {
        return new Response('OK', {
            headers: {
                'SSO-Email': session.user.email ?? '',
                'SSO-Id': session.user.id ?? '',
                'SSO-Image': session.user.image ?? '',
                'SSO-Name': session.user.name ?? '',
            }
        })
        // https://calibre-sno.snomiao.dev/
    }
    return new Response('plz Ask snomiao for access', { status: 403 })
}