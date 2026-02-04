# GoldAPI (XAU/USD)

Endpoint:
`GET https://www.goldapi.io/api/XAU/USD`

Headers:
- `x-access-token: <GOLDAPI_TOKEN>`

Relevant response fields (JSON):
- `price` (number)
- `timestamp` (unix seconds, optional)

Server route should map to:
```
{
  symbol: "XAU",
  price: <price>,
  currency: "USD/oz",
  updatedAt: <ISO string>
}
```
