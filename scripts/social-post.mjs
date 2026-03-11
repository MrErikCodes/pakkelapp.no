#!/usr/bin/env node

const posts = [
  {
    text: `Sliter du med Posten/Bring-etiketter? Jeg lagde pakkelapp.no - skann QR-koden fra Posten-appen og generer adresselappen direkte i nettleseren. Gratis, ingen registrering, alt skjer lokalt.`,
    hashtags: "#posten #bring #pakkelapp #shipping #norge #norgespakke",
  },
  {
    text: `Ny gratis tjeneste: pakkelapp.no! Skann QR-koden fra Posten-appen med kamera eller last opp et skjermbilde, og last ned en ferdig adresselapp som PDF. Ingen data sendes til noen server.`,
    hashtags: "#pakkelapp #posten #bring #fraktlabel #norskutvikler",
  },
  {
    text: `Trenger du adresselapper for pakker? Med pakkelapp.no kan du generere Bring/Posten-etiketter rett fra QR-koden i appen. Funker pa mobil og PC, helt gratis!`,
    hashtags: "#bring #posten #pakke #nettbutikk #ecommerce #norge",
  },
  {
    text: `Har du noen gang onsket en enklere mate a skrive ut pakkelapper? pakkelapp.no lar deg skanne QR-koden fra Posten-appen og laste ned en profesjonell adresselapp som PDF pa sekunder.`,
    hashtags: "#pakkelapp #posten #bring #shipping #label #gratis",
  },
  {
    text: `Lanserer pakkelapp.no - et lite verktoy jeg lagde for a generere Bring/Posten adresselapper fra QR-koder. Helt klientbasert, ingen data lagres. Perfekt for deg som sender mange pakker!`,
    hashtags: "#sideprosjekt #webdev #posten #bring #pakkelapp #opensource",
  },
  {
    text: `Visste du at QR-koden i Posten-appen inneholder all informasjon for en adresselapp? Med pakkelapp.no kan du skanne den og fa en ferdig PDF-etikett. Prøv det selv!`,
    hashtags: "#posten #bring #tips #pakkelapp #shipping #norge",
  },
  {
    text: `Spar tid med pakkelapp.no! Skann QR-koden fra Posten/Bring-appen, og fa en korrekt adresselapp som PDF. Ingen innlogging, ingen kostnad, fungerer rett i nettleseren.`,
    hashtags: "#tidsbesparelse #pakkelapp #posten #bring #gratis #verktoy",
  },
  {
    text: `Bygget et lite prosjekt i helgen: pakkelapp.no genererer adresselapper fra Posten/Bring QR-koder. Alt kjorer lokalt i nettleseren - ingen data sendes noe sted. Sjekk det ut!`,
    hashtags: "#helgeprosjekt #webdev #nextjs #posten #bring #pakkelapp",
  },
];

const url = "https://pakkelapp.no";

function generate() {
  const post = posts[Math.floor(Math.random() * posts.length)];

  const facebook = `${post.text}\n\n${url}`;
  const linkedin = `${post.text}\n\n${url}\n\n${post.hashtags}`;

  console.log("=".repeat(60));
  console.log("FACEBOOK:");
  console.log("=".repeat(60));
  console.log(facebook);
  console.log();
  console.log("=".repeat(60));
  console.log("LINKEDIN:");
  console.log("=".repeat(60));
  console.log(linkedin);
  console.log();
}

generate();
