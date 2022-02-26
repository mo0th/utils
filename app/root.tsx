import {
  Links,
  LinksFunction,
  LiveReload,
  LoaderFunction,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useMatches,
} from 'remix'
import type { MetaFunction } from 'remix'
import appStyles from './app.css'
import { HeartIcon } from './components/icons'
import { Link } from 'react-router-dom'
import { getPrefsFromSession, Prefs } from './lib/prefs.server'
import { getSession } from './lib/session.server'

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: appStyles },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,700;1,400&family=Poppins:wght@400;700;900&display=swap',
    },
    {
      rel: 'canonical',
      href: 'https://sizes.mooth.tech',
    },
  ]
}

export const meta: MetaFunction = () => {
  const image = 'https://og-gen-mooth.vercel.app/api/og?category=sizes'
  const description =
    'See the size of files or text in a few formats. Has a bunch of color schemes because why not.'
  const title = 'Sizes | mooth.tech'

  return {
    title,
    description,
    image,
    'og:url': 'https://sizes.mooth.tech',
    'og:type': 'website',
    'og:image': image,
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:description': description,
    'og:locale': 'en_AU',
    'twitter:card': 'summary_large_image',
    'twitter:creator': '@soorriously',
    'twitter:site': '@soorriously',
    'twitter:title': title,
    'twitter:alt': 'Sizes | mooth.tech',
  }
}

type LoaderData = Prefs

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get('Cookie'))
  const prefs = getPrefsFromSession(session)
  return prefs
}

export const useRootLoaderData = (): LoaderData => {
  const matches = useMatches()
  const rootMatch = matches.find(match => match.id === 'root')

  if (!rootMatch) {
    throw new Error("Can't get root loader data")
  }

  return rootMatch.data as LoaderData
}

const Layout: React.FC<LoaderData> = ({ children, js, theme }) => {
  return (
    <html lang="en" data-theme={theme}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <script
          async
          defer
          data-domain="sizes.mooth.tech"
          data-api="https://mooth.tech/proxy/api/event"
          src="https://mooth.tech/js/potato.js"
        />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen flex flex-col">
        <div className="max-w-screen-lg w-full mx-auto py-8 px-4 space-y-8 flex flex-col h-full flex-1">
          <header>
            <nav className="flex items-center space-x-2">
              <Link
                to="/"
                className="text-4xl text-primary font-bold font-display focus-outline"
              >
                sizes
              </Link>
              <div className="flex-1" />
              <Link
                to="/"
                className="link link-hover link-primary text-xl rounded-btn px-1"
              >
                home
              </Link>
              <Link
                to="/theme"
                className="link link-hover link-primary text-xl rounded-btn px-1"
              >
                theme
              </Link>
            </nav>
          </header>
          <div className="flex-1">{children}</div>
        </div>
        <footer className="py-8 text-center flex flex-col items-center space-y-4">
          <a
            href="https://mooth.tech/?ref=Sizes"
            target="_blank"
            rel="noopener noreferrer"
            className="group link link-hover inline-block focus-outline px-2"
          >
            Made with{' '}
            <span className="relative inline-block h-5 w-5 align-middle">
              <HeartIcon className="absolute inset-0 fill-current text-pink" />
              <HeartIcon className="absolute inset-0 fill-current text-purple group-hover:animate-ping" />
            </span>{' '}
            by{' '}
            <span className="underline group-hover:no-underline">Soorria</span>
          </a>
          <a
            href="https://github.com/mo0th/sizes"
            target="_blank"
            rel="noopener noreferrer"
            className="group link link-hover inline-block focus-outline px-2"
          >
            <span className="underline group-hover:no-underline">Source</span>{' '}
            on GitHub
          </a>
        </footer>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

const App: React.FC = () => {
  const data = useLoaderData<LoaderData>()

  return (
    <Layout {...data}>
      <Outlet />
    </Layout>
  )
}

export default App

export const ErrorBoundary: React.FC = () => {
  return (
    <Layout js theme="dracula">
      <main className="space-y-8">
        <h1 className="text-5xl mt-8">something broke somewhere :(</h1>

        <Link to="." className="btn btn-ghost btn-block btn-outline">
          Try again ?
        </Link>
      </main>
    </Layout>
  )
}
