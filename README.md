# 📸 Reflections - Automated Scrapbooking

A progressive web app that helps parents capture and reflect on daily moments with their children. Upload photos, respond to thoughtful prompts, and automatically receive AI-generated summaries via email, culminating in a professionally printed scrapbook on a date you choose.

## ✨ Features

- 🔐 **Secure Authentication** - InstantDB magic link authentication
- 💳 **One-Time Payment** - Stripe checkout before accessing features
- 📱 **Progressive Web App** - Works offline, installable on mobile
- 🔒 **End-to-End Encryption** - Client-side AES-256-GCM encryption
- 🤖 **AI-Powered Prompts** - Thoughtful daily reflection prompts (admin curated)
- 📧 **Email Summaries** - Configurable AI-generated reflection summaries via Resend
- 📖 **Physical Scrapbook** - Automatic compilation and printing on your chosen date
- 🎨 **Warm, Characterful Design** - Earth tones and friendly UI

## 🛠️ Tech Stack

- **Frontend**: TanStack Start + React + TailwindCSS v4
- **Database**: InstantDB (real-time, offline-first)
- **Workflows**: Inngest (scheduled tasks, email automation)
- **Payments**: Stripe
- **Email**: Resend
- **AI**: AI SDK with OpenAI
- **Encryption**: Web Crypto API

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Accounts on: InstantDB, Stripe, Resend, Inngest, OpenAI

### Installation

1. **Clone and install dependencies:**

```bash
pnpm install
```

2. **Set up environment variables:**

Copy `env.example` to `.env` and fill in your API keys:

```bash
cp env.example .env
```

Required environment variables:
- `VITE_INSTANTDB_APP_ID` - Get from [InstantDB Dashboard](https://instantdb.com/dash)
- `INSTANT_APP_ADMIN_TOKEN` - Get from InstantDB Dashboard → App Settings → Admin Token
- `VITE_STRIPE_PUBLISHABLE_KEY` & `STRIPE_SECRET_KEY` - Get from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
- `STRIPE_WEBHOOK_SECRET` - Get from [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
- `RESEND_API_KEY` - Get from [Resend API Keys](https://resend.com/api-keys)
- `INNGEST_SIGNING_KEY` & `INNGEST_EVENT_KEY` - Get from [Inngest App](https://app.inngest.com)
- `OPENAI_API_KEY` - Get from [OpenAI Platform](https://platform.openai.com/api-keys)

3. **Push the schema to InstantDB:**

First, log in to InstantDB CLI:

```bash
npx instant-cli@latest login
```

Then push your schema and permissions:

```bash
npx instant-cli@latest push schema  # Push database schema
npx instant-cli@latest push perms   # Push permissions
```

Or push both at once:

```bash
npx instant-cli@latest push
```

The CLI will show you a preview of changes before applying them.

4. **Run the development server:**

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

### Testing Authentication

1. Navigate to `http://localhost:3000/auth/sign-in`
2. Enter your email address
3. Check your email for the 6-digit magic code
4. Enter the code in the verification form
5. You'll be automatically signed in and redirected to the dashboard

Test the protected route:
- Visit `/dashboard` while signed out → redirects to sign-in
- Sign in with the magic code → `/dashboard` shows protected content

### Testing Payments with Inngest

1. **Start the dev server:**
```bash
pnpm dev
```

2. **Set up Stripe webhook forwarding:**
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

3. **Trigger a test payment:**
```bash
stripe trigger checkout.session.completed
```

4. **Monitor Inngest execution:**
   - View logs in terminal
   - Or use Inngest Dev Server:
   ```bash
   npx inngest-cli@latest dev
   ```
   - Visit `http://localhost:8288` to see function executions

5. **Test payment flow:**
   - Navigate to `/payment`
   - Click "Proceed to Secure Checkout"
   - Use test card: `4242 4242 4242 4242`
   - Complete checkout
   - Webhook triggers → Inngest processes async → User updated

## 🏗️ Project Architecture

### Data Flow
```
User → InstantDB (encrypted data) → Inngest (scheduled workflows) → Resend (emails)
                                   ↓
                            AI SDK (summaries, prompts)
                                   ↓
                            Scrapbook Service (Chatbooks/Adobe)
```

### Key Directories

```
src/
├── components/       # React components
│   ├── auth/        # Authentication components
│   ├── payment/     # Payment UI components
│   └── ui/          # Shadcn UI components
├── routes/          # TanStack Router file-based routes
│   ├── api/         # API endpoints
│   └── payment/     # Payment flow routes
├── lib/             # Utilities and helpers
│   ├── auth/        # Authentication provider & hooks
│   ├── encryption/  # Client-side encryption (AES-256-GCM)
│   ├── db/          # InstantDB client and schema
│   ├── stripe/      # Stripe payment handling
│   ├── inngest/     # Inngest workflow orchestration
│   └── utils.ts     # Shared utilities
└── styles.css       # TailwindCSS with warm color palette
```

### Environment Variables

See `env.example` for all required variables. The app uses [@t3-oss/env-core](https://env.t3.gg/) for type-safe environment validation with Zod.

## 🏃 Development

### Running the App

```bash
pnpm dev          # Start development server at http://localhost:3000
pnpm build        # Build for production
pnpm serve        # Preview production build
pnpm test         # Run Vitest tests
```

### Storybook (Component Development)

View and test components in isolation with Storybook:

```bash
pnpm storybook         # Start Storybook at http://localhost:6006
pnpm build-storybook   # Build static Storybook
```

### Inngest Development

Monitor and debug background workflows:

```bash
npx inngest-cli@latest dev  # Start Inngest Dev Server at http://localhost:8288
```

The Inngest serve endpoint is available at `/api/inngest` and handles:
- Stripe payment processing
- Scheduled email summaries (future)
- Background tasks and workflows

Storybook includes:
- 🎨 **Design System** - Colors, typography, and brand guidelines
- 🧩 **UI Components** - Buttons, inputs, and all shadcn components
- 📝 **Use Cases** - Real-world component examples

### Testing

```bash
pnpm test         # Run tests with Vitest
```

### Code Quality

```bash
pnpm lint         # Lint with Biome
pnpm format       # Format code with Biome
pnpm check        # Run all Biome checks
```

## 📦 Building For Production

To build this application for production:

```bash
pnpm build
```

## Testing

This project uses [Vitest](https://vitest.dev/) for testing. You can run the tests with:

```bash
pnpm test
```

## Styling

This project uses [Tailwind CSS](https://tailwindcss.com/) for styling.


## Linting & Formatting

This project uses [Biome](https://biomejs.dev/) for linting and formatting. The following scripts are available:


```bash
pnpm lint
pnpm format
pnpm check
```


## 🧩 Shadcn UI Components

This project uses [Shadcn UI](https://ui.shadcn.com/) with our custom warm color palette. All components automatically use the design system colors.

### Add New Components

```bash
npx shadcn@latest add <component-name>
```

**Examples:**
```bash
npx shadcn@latest add button input dialog
npx shadcn@latest add card badge avatar
npx shadcn@latest add calendar date-picker
```

All added components will be in `src/components/ui/` and automatically styled with our earth-tone palette.

### View Components in Storybook

After adding components, view them in Storybook at **http://localhost:6006** with `pnpm storybook`.


## T3Env

- You can use T3Env to add type safety to your environment variables.
- Add Environment variables to the `src/env.mjs` file.
- Use the environment variables in your code.

### Usage

```ts
import { env } from "@/env";

console.log(env.VITE_APP_TITLE);
```






## Routing
This project uses [TanStack Router](https://tanstack.com/router). The initial setup is a file based router. Which means that the routes are managed as files in `src/routes`.

### Adding A Route

To add a new route to your application just add another a new file in the `./src/routes` directory.

TanStack will automatically generate the content of the route file for you.

Now that you have two routes you can use a `Link` component to navigate between them.

### Adding Links

To use SPA (Single Page Application) navigation you will need to import the `Link` component from `@tanstack/react-router`.

```tsx
import { Link } from "@tanstack/react-router";
```

Then anywhere in your JSX you can use it like so:

```tsx
<Link to="/about">About</Link>
```

This will create a link that will navigate to the `/about` route.

More information on the `Link` component can be found in the [Link documentation](https://tanstack.com/router/v1/docs/framework/react/api/router/linkComponent).

### Using A Layout

In the File Based Routing setup the layout is located in `src/routes/__root.tsx`. Anything you add to the root route will appear in all the routes. The route content will appear in the JSX where you use the `<Outlet />` component.

Here is an example layout that includes a header:

```tsx
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { Link } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <header>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>
      </header>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
```

The `<TanStackRouterDevtools />` component is not required so you can remove it if you don't want it in your layout.

More information on layouts can be found in the [Layouts documentation](https://tanstack.com/router/latest/docs/framework/react/guide/routing-concepts#layouts).


## Data Fetching

There are multiple ways to fetch data in your application. You can use TanStack Query to fetch data from a server. But you can also use the `loader` functionality built into TanStack Router to load the data for a route before it's rendered.

For example:

```tsx
const peopleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/people",
  loader: async () => {
    const response = await fetch("https://swapi.dev/api/people");
    return response.json() as Promise<{
      results: {
        name: string;
      }[];
    }>;
  },
  component: () => {
    const data = peopleRoute.useLoaderData();
    return (
      <ul>
        {data.results.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    );
  },
});
```

Loaders simplify your data fetching logic dramatically. Check out more information in the [Loader documentation](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading#loader-parameters).

### React-Query

React-Query is an excellent addition or alternative to route loading and integrating it into you application is a breeze.

First add your dependencies:

```bash
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

Next we'll need to create a query client and provider. We recommend putting those in `main.tsx`.

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ...

const queryClient = new QueryClient();

// ...

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
```

You can also add TanStack Query Devtools to the root route (optional).

```tsx
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <ReactQueryDevtools buttonPosition="top-right" />
      <TanStackRouterDevtools />
    </>
  ),
});
```

Now you can use `useQuery` to fetch your data.

```tsx
import { useQuery } from "@tanstack/react-query";

import "./App.css";

function App() {
  const { data } = useQuery({
    queryKey: ["people"],
    queryFn: () =>
      fetch("https://swapi.dev/api/people")
        .then((res) => res.json())
        .then((data) => data.results as { name: string }[]),
    initialData: [],
  });

  return (
    <div>
      <ul>
        {data.map((person) => (
          <li key={person.name}>{person.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

You can find out everything you need to know on how to use React-Query in the [React-Query documentation](https://tanstack.com/query/latest/docs/framework/react/overview).

## State Management

Another common requirement for React applications is state management. There are many options for state management in React. TanStack Store provides a great starting point for your project.

First you need to add TanStack Store as a dependency:

```bash
pnpm add @tanstack/store
```

Now let's create a simple counter in the `src/App.tsx` file as a demonstration.

```tsx
import { useStore } from "@tanstack/react-store";
import { Store } from "@tanstack/store";
import "./App.css";

const countStore = new Store(0);

function App() {
  const count = useStore(countStore);
  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
    </div>
  );
}

export default App;
```

One of the many nice features of TanStack Store is the ability to derive state from other state. That derived state will update when the base state updates.

Let's check this out by doubling the count using derived state.

```tsx
import { useStore } from "@tanstack/react-store";
import { Store, Derived } from "@tanstack/store";
import "./App.css";

const countStore = new Store(0);

const doubledStore = new Derived({
  fn: () => countStore.state * 2,
  deps: [countStore],
});
doubledStore.mount();

function App() {
  const count = useStore(countStore);
  const doubledCount = useStore(doubledStore);

  return (
    <div>
      <button onClick={() => countStore.setState((n) => n + 1)}>
        Increment - {count}
      </button>
      <div>Doubled - {doubledCount}</div>
    </div>
  );
}

export default App;
```

We use the `Derived` class to create a new store that is derived from another store. The `Derived` class has a `mount` method that will start the derived store updating.

Once we've created the derived store we can use it in the `App` component just like we would any other store using the `useStore` hook.

You can find out everything you need to know on how to use TanStack Store in the [TanStack Store documentation](https://tanstack.com/store/latest).

# Demo files

Files prefixed with `demo` can be safely deleted. They are there to provide a starting point for you to play around with the features you've installed.

# Learn More

You can learn more about all of the offerings from TanStack in the [TanStack documentation](https://tanstack.com).
# ReflectionsApp
