const lang = window.navigator.language
const defaultLang = "en"
const allTexts = {
  "de": {
    "persons": "Personen",
    "topics": "Themen",
    "interestedParties": "Interessierte Personen",
    "linkTitle": "{{title}} anzeigen",
    "defaultDescription": "Es gibt aktuell noch keine Beschreibung zu diesem Eintrag. Informationen könntest du in [GitHub](https://github.com/jschirrmacher/netvis-server/blob/master/public/data.json) ergänzen."
  },
  "en": {
    "persons": "Persons",
    "topics": "Topics",
    "interestedParties": "interested Parties",
    "linkTitle": "Show {{title}}",
    "defaultDescription": "There is no description for this entry yet. You could add them in [GitHub](https://github.com/jschirrmacher/netvis-server/blob/master/public/data.json)."
  }
}
const texts = allTexts[lang] || allTexts[lang.substr(0, 2)] || allTexts[defaultLang]
