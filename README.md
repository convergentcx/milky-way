[![Build Status](https://travis-ci.org/convergentcx/Arc.svg?branch=master)](https://travis-ci.org/convergentcx/Arc)

# Arc

[Bonding Curves](https://medium.com/@simondlr/tokens-2-0-curved-token-bonding-in-curation-markets-1764a2e0bee5) are a method of token issuance which allow for continuous liquidity of the token through
the maintenance of a reserve. External users are free to purchase or sell tokens _into_ the curve by
submitting transactions to the bonding curve smart contract. The bonding curve will mint or burn new 
tokens depending on the action external users wish to make. The name bonding curve comes from the fact
that the price of the token will move on a determined path that can be plotted as a curve.

## Testing

Clone this repository and install dependencies:

```
$ git clone git@github.com:convergentcx/Arc.git
$ yarn
```

Then compile the smart contracts and generate the TypeScript bindings:

```
$ yarn generate
```

Now in one window start the development chain:

```
$ yarn ganache
```

In other window run the tests:

```
$ yarn test
```

## Running the Demo

Start by installing dependencies and running ganache in one console:

```
$ yarn
$ yarn ganache
```

In other console run:

```
$ yarn compile:dapp
```

Remaining in the new console, move to the `dapp/` directory and run the following:

```
$ yarn
$ yarn start
```

Navigate to `http://localhost:3000` in a web browser.
