# Schauplatz Einkaufszentrum: Präsentationen

Folien für die Ethik-Einheit (RKE, 1. Sek A) als Webseite. Ersetzt PowerPoint.

- `index.html`: Übersicht
- `dl1.html`, `dl2.html`: je eine Doppellektion
- `assets/`: Gestaltung und Steuerung

## Bedienung

| Taste | Wirkung |
|---|---|
| Pfeil rechts, Leertaste | nächste Folie |
| Pfeil links | vorherige Folie |
| T | Timer der Folie starten oder pausieren |
| R | Timer zurücksetzen |
| P | Referentenansicht öffnen (Notizen, Timer, Vorschau, nur auf deinem Bildschirm) |
| F | Vollbild |
| H | Hilfe |

Jede Folie hat oben die geplante Uhrzeit und Phase. Folien mit Arbeitsauftrag haben einen Timer, der am Ende piept.

## Notizen nur für die Lehrperson

Mit `P` öffnet sich die Referentenansicht (`referent.html`) in einem eigenen Fenster. Sie zeigt Notizen,
den Auftrag an die Klasse, die aktuelle und die nächste Folie und steuert Folien und Timer im Beamer-Fenster.
Voraussetzung: Bildschirm erweitern, nicht duplizieren (Windows: Win+P, Mac: Systemeinstellungen, Displays).

## Export

Unten links in der Präsentation: «PDF» oder «PowerPoint». Jede Folie wird als Bild exportiert,
in der PowerPoint stehen die Notizen in der Notizenansicht. Der Export braucht Internet.

## Bilder aus dem Lehrmittel

Das Schauplatzbild, der Wertepark und der Bildausschnitt Bank sind urheberrechtlich geschützt
(Schauplatz Ethik 7-9, © Lehrmittelverlag Zürich) und liegen deshalb **nicht** in diesem öffentlichen Repository.

So kommen sie in die Präsentation:

1. Präsentation auf dem Unterrichtscomputer öffnen.
2. Die Bilddatei in das leere Bildfeld ziehen oder «Bild wählen» klicken.
3. Der Browser speichert das Bild auf diesem Gerät. Auf allen Folien mit demselben Bild erscheint es automatisch.

Bildfelder: `schauplatzbild`, `wertepark`, `bank`.
Wer die Bilder trotzdem im Repository haben will, legt sie als `bilder/schauplatzbild.jpg` usw. ab. Sie sind dann öffentlich sichtbar.

## Veröffentlichen mit GitHub Pages

Settings → Pages → Source: «Deploy from a branch» → Branch `main`, Ordner `/ (root)` → Save.
