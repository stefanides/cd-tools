# Česko.Digital Glue Scripts™

Sbírka serverových skriptů pro různé menší úkoly. Nasazuje se jako [serverless funkce v Now](https://vercel.com/docs/v2/serverless-functions/introduction).

## Seznam uživatelů ve Slacku

Občas se nám hodí uložit seznam uživatelů v nějakém slackovém kanálu. Je na to funkce přímo ve Slacku (`/who` nebo Details → Members), ale výstupy z ní nejdou snadno uložit. Skript [list-users](https://tools.cesko.dev/list-users) tedy zobrazí seznam uživatelů ve vybraném kanálu ve formátu CSV, který lze pak snadno importovat třeba do Google Sheets nebo Excelu.
