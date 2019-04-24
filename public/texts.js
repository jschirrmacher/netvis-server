const lang = window.navigator.language
const defaultLang = "en"
const allTexts = {
  "de": {
    "persons": "Personen",
    "topics": "Themen",
    "interestedParties": "Interessierte Personen",
    "rooms": "Räume",
    "linkTitle": "{{title}} anzeigen",
    "defaultDescription": "Es gibt aktuell noch keine Beschreibung zu diesem Eintrag."
  },
  "en": {
    "persons": "Persons",
    "topics": "Topics",
    "interestedParties": "interested Parties",
    "rooms": "Rooms",
    "linkTitle": "Show {{title}}",
    "defaultDescription": "There is no description for this entry yet."
  }
}
const texts = allTexts[lang] || allTexts[lang.substr(0, 2)] || allTexts[defaultLang]
