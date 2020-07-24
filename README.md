# Česko.Digital Glue Scripts™

Sbírka serverových skriptů pro různé menší úkoly. Nasazuje se jako [serverless funkce v Now](https://vercel.com/docs/v2/serverless-functions/introduction).

## AirTable Unsubscribe

Pro rozesílání některých e-mailů používáme kombinaci AirTable + SendGrid. Abychom příjemcům dali možnost se odhlásit, potřebujeme jim poslat odkaz, který v dotyčné tabulce zaškrtne checkbox _Unsubscribed_, což dělá tahle služba. Volání:

```
https://tools.cesko.digital/unsubscribe?appId=id_databáze&tableName=název_tabulky&userId={ID}
```

Pro zápis do AirTable potřebuje služba API klíč AirTable, který je uložený jako tajemství v Now (klíč `airtable-api-key`), služba si ho přebírá v proměnné prostředí `AIRTABLE_API_KEY`.