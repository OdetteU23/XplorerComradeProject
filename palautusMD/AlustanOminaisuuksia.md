Toteutetut toiminnallisuudet

1. Käyttäjähallinta & autentikointi
Rekisteröityminen, kirjautuminen ja profiilien hallinta JWT-tokeneilla. Salasanat hashataan bcryptillä. (auth-server: authController, userController | hybrid-types: loginInfo, registeringInfo, userProfile)

2. Syöte & julkaisut
Seurattujen käyttäjien syöte, satunnaiset/explore-julkaisut, haku ja trendaavat postaukset. Vierailijat näkevät rajatun sisällön. (mediaContent-server: mediaContentController, randomFeedsController | hybrid-types: julkaisuWithRelations)

3. Tykkäysjärjestelmä
Tykkää/poista tykkäys optimistisilla UI-päivityksillä (Zustand + useReducer). Tila synkronoituu reaaliajassa komponenttien välillä. (mediaContent-server: like-endpointit | frontend: useLikeStore, useLikeReducer)

4. Kommentointi
Kommenttien lisäys, näyttö ja poisto julkaisuissa. Säikemäinen keskusteluformaatti. (mediaContent-server: comment-endpointit | hybrid-types: kommentti)

5. Seuraaminen
Käyttäjien seuraaminen/seuraamisen lopetus, seuraajien ja seurattujen listaus, seurantatilan tarkistus. (auth-server: userController follow-endpointit | hybrid-types: seuranta)

6. Reaaliaikaiset viestit
Kahdenvälinen keskustelu WebSocketilla, kirjoitusindikaattorit, viestihistoria ja luetuksi merkitseminen. (mediaContent-server: websocket.ts, message-endpointit | hybrid-types: chatMessages)

7. Ilmoitusjärjestelmä
Ilmoitukset tykkäyksistä, kommenteista, seuraamisista, viesteistä ja kaveri­pyynnöistä. Toast-ilmoitukset reaaliajassa. (mediaContent-server: notification-endpointit | hybrid-types: notifications)

8. Matkasuunnitelmat
Matkasuunnitelmien luonti (kohde, ajankohta, aktiviteetit, budjetti), haku, suodatus ja hallinta. (mediaContent-server: travel-plan-endpointit | hybrid-types: matkaAikeet)

9. Matkakaverijärjestelmä
Kaveri­pyyntöjen lähettäminen matkasuunnitelmiin, hyväksyminen/hylkääminen, osallistujien seuranta. (mediaContent-server: buddy-request-endpointit | hybrid-types: friendRequest, tripParticipants)

10. Mediatiedostojen hallinta
Kuvien/videoiden lataus multerilla, tiedostojen tallennus SQLite-tietokantaan (BLOB) pysyvyyttä varten, ja käyttäjäkohtainen poisto-oikeus. (upload-server: uploadController | hybrid-types: media_images)

11. Käyttöliittymä
Responsiivinen SPA (React + Vite + Tailwind), suojatut reitit, mobiili- ja työpöytänavigaatio, lomakevalidointi, lataus­tilat ja virheenkäsittely. (frontend: Layout, NavBar, ProtectedRoute/PublicRoute)

12. Jaettu tyyppikirjasto
Yhteinen TypeScript-tyyppimoduuli (@xcomrade/types-server) frontendille ja backendeille – varmistaa tyyppiturvallisen tiedonsiirron arkkitehtuurin läpi. (XComrade-hybrid-types: DBTypes, contentTypes, messageTypes)