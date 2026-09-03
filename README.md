# Shopping Cart — Unit Testing Playground

A small TypeScript shopping-cart domain built to practice unit testing with Jest and `ts-jest`.
It mixes **pure functions** (easy to assert), **injected collaborators** (easy to mock), and a couple of
**deliberately impure functions** (global `fetch`, `Date.now()`, `Math.random()`, `console`) so you can
practice spies, stubs and fake timers.

## Requirements

- Node.js 18+ (the payment gateway function uses the global `fetch`)
- npm

## Getting started

```bash
npm install
npm test
```

## Scripts

| Script                  | Description                                |
| ----------------------- | ------------------------------------------ |
| `npm test`              | Runs the Jest suite                        |
| `npm run test:watch`    | Re-runs tests on file changes              |
| `npm run test:coverage` | Generates a coverage report in `coverage/` |
| `npm run build`         | Type-checks and compiles to `dist/`        |

## Project structure

```
src/
  types.ts             Domain models and collaborator interfaces
  pricing.ts           Pure money/pricing calculations
  cartService.ts       Immutable cart operations + CartTracker (side effects)
  userService.ts       Email validation + UserService (async, repository-backed)
  checkoutService.ts   CheckoutService + submitOrderToGateway (global side effects)
  mocks/fixtures.ts    Test doubles: fixtures, fake logger/clock/ids, in-memory repos
  index.ts             Barrel export
tests/
  pricing.test.ts
  cartService.test.ts
  userService.test.ts
  checkoutService.test.ts
  fixtures.test.ts
```

## Domain overview

### `types.ts`

Defines `Product`, `CartItem`, `Cart`, `User`, `Coupon` and `Order`, plus the interfaces that make the
services testable: `UserRepository`, `ProductRepository`, `Logger`, `Clock` and `IdGenerator`.
Services depend on these interfaces, never on concrete implementations.

### `pricing.ts` — pure functions

`roundMoney`, `lineTotal`, `calculateSubtotal`, `calculateShipping`, `isCouponValid`, `applyCoupon`
and `calculateTotal`. No I/O, no dates read from the system clock (`now` is always a parameter).

Rules worth testing:

- Shipping is free for premium users, free at or above `FREE_SHIPPING_THRESHOLD` (50), otherwise `FLAT_SHIPPING_COST` (4.99).
- A coupon is valid only if `percentOff` is in `(0, 100]`, the subtotal reaches `minTotal`, and it has not expired.
- The total is clamped at 0.

### `cartService.ts` — immutable operations + one stateful class

`createEmptyCart`, `addItem`, `removeItem`, `updateQuantity`, `countItems`, `isEmpty` and `summarize`
always return **new** objects, so tests can assert the original cart was not mutated.

`addItem` throws on non-positive quantities, insufficient stock, and when a line would exceed
`MAX_QUANTITY_PER_ITEM` (10).

`CartTracker` is the **side-effect class**: it writes to an injected `Logger`, reads an injected `Clock`,
keeps an internal event history, and empties the cart on the `clear` action.

### `userService.ts` — async service with a mocked repository

Pure helpers: `isValidEmail`, `normalizeEmail`, `isPremium`, `canCheckout`.

`UserService` covers `register` (normalizes the email, rejects invalid and duplicated ones),
`getById`, `upgrade` (idempotent for premium users), `deactivate` and `remove` — logging along the way.

### `checkoutService.ts` — orchestration and global side effects

`CheckoutService.placeOrder` validates the user and cart, checks stock for **every** item before
decreasing any, then builds an `Order` using the injected clock and id generator.

`submitOrderToGateway` is intentionally impure: it calls global `fetch`, builds a reference from
`Date.now()` and `Math.random()`, and writes to `console`. Tests must stub those globals.

### `mocks/fixtures.ts` — reusable test doubles

- `products`: in stock, low stock (`laptop`) and out of stock (`coffee`).
- `users`: `member`, `premium`, `guest`, `inactive`.
- `coupons`: `valid`, `expired`, `highMin`.
- `createFakeLogger()`, `createFixedClock(iso)`, `createSequentialIds(prefix)`.
- `InMemoryUserRepository` and `InMemoryProductRepository` for integration-flavored tests.

## Testing notes

Jest is configured in `jest.config.cjs`:

- `preset: 'ts-jest'` compiles TypeScript on the fly.
- Tests live in `tests/` and match `*.test.ts` / `*.spec.ts`.
- `clearMocks: true` resets mocks between tests, so mock setup belongs in `beforeEach`.
- Coverage is collected from `src/**/*.ts`, excluding `src/index.ts`.

Techniques exercised by the existing suites:

- `it.each` for table-driven validation and rounding cases.
- `jest.fn()` doubles for `Logger`, `UserRepository` and `ProductRepository`, asserted with
  `toHaveBeenCalledWith` / `not.toHaveBeenCalled`.
- `jest.spyOn` for `console.log`, `console.error` and `Clock.now`.
- `jest.useFakeTimers().setSystemTime(...)` plus a stubbed `Math.random` to make
  `submitOrderToGateway` deterministic.
- `global.fetch` replaced by a mock returning `{ ok, status }` to cover success, failure and rejection.
- `rejects.toThrow` for async error paths, verifying no stock is decreased when validation fails.
