/**
 * Dodatkowe teksty Profesora Pytajka – poziomy humoru.
 *
 *  - LINES (hostLines.js)  – „grzeczny”: tylko te,
 *  - CHEEKY_LINES          – „z jajem” (domyślny): grzeczne + docinki,
 *  - RUDE_LINES            – „chamski 🌶️”: wszystko + bezczelny roast teleturniejowy.
 *
 * Zasady jak w hostLines.js (czas teraźniejszy, imiona w mianowniku). W chamskim trybie
 * wyśmiewamy wyłącznie GRĘ: wiedzę, refleks, wyniki, strategię. Łagodne przekleństwa są OK
 * (kurde, cholera, do cholery, ja pierdzielę, kurczę blade, matoły, baranie, łamago).
 * NIGDY: ciężkie wulgaryzmy, wygląd, waga, płeć, orientacja, pochodzenie, religia,
 * niepełnosprawność, treści seksualne.
 */

export const CHEEKY_LINES = {
  // ---------------------------------------------------------------- lobby
  join: [
    '{name} dołącza! Mam nadzieję, że wiedza też przyszła, a nie tylko apetyt.',
    'Witamy, {name}! Regulamin jest prosty: nie płakać przy ludziach.',
    '{name} w grze. Zakłady przyjmuję do końca rozgrzewki.'
  ],
  lobbyIdle: [
    'Kto jeszcze nie dołączył, ten pewnie szuka okularów. Do czytania kodu QR.',
    'Pamiętajcie: telefon do ręki, chipsy na bok. Ekran sam się nie wyczyści.',
    'Czekam cierpliwie. Mam doktorat z czekania na spóźnialskich.',
    'Ostatnia szansa, żeby udawać, że nie gracie. Potem już wstyd.'
  ],
  start: [
    'Startujemy! Proszę zapiąć pasy, niektórzy polecą nisko.',
    'Gong! Od teraz każda pomyłka zostaje w pamięci zbiorowej.',
    'Zaczynamy! Wymówka „nie słyszałem pytania” nie działa, pytanie jest na ekranie.',
    'Zaczynamy! Ja się nie stresuję. To Wy się stresujcie.'
  ],

  // ---------------------------------------------------------------- głosowanie
  voteStart: [
    'Runda {round}! Wybierzcie kategorię, za którą jutro będzie Wam wstyd.',
    'Głosowanie! Tylko nie wybierajcie znowu tego samego, bo usnę.',
    'Runda {round}. Kategoria to jak los na loterii: niby wybór, a i tak boli.',
    'Głosujemy! Kto przegra głosowanie, przegra też pytania. Statystyka nie kłamie.'
  ],
  voteIdle: [
    'Długo się zastanawiacie. Na pytaniach też tak będzie?',
    'Głosowanie, nie egzamin dojrzałości. Klikać!',
    'Ktoś tu kalkuluje jak arcymistrz. Szkoda, że tylko przy kategoriach.',
    'Wybierzcie coś, zanim kategorie same się poobrażają.',
    'Tik-tak, demokracja nie będzie czekać wiecznie.'
  ],
  voteResult: [
    '{category}. No to teraz zobaczymy, kto naprawdę czytał, a kto tylko przewijał.',
    'Zwycięża: {category}! Przegranym proponuję chusteczki.',
    '{category}! Ktoś się uśmiecha, ktoś blednie. Uwielbiam to.',
    '{category}. Lud wybrał, lud za to zapłaci.'
  ],

  // ---------------------------------------------------------------- kategorie
  cat_motoryzacja: [
    'Motoryzacja! Kto tankuje „za pięćdziesiąt” i liczy na cud, ten się zaraz przekona.',
    'Motoryzacja. Proszę nie trąbić, tylko odpowiadać.',
    'Motoryzacja! Pytania jadą bez kierunkowskazu, uważajcie.',
    'Motoryzacja! Wiedza z serwisu, nie z reklamy, poproszę.'
  ],
  cat_technologia: [
    'Technologia! Wyłączcie i włączcie mózg ponownie. Pomaga.',
    'Technologia! Proszę nie googlować. Widzę Wasze kciuki.',
    'Technologia. Zobaczymy, kto tu jest informatykiem, a kto tylko naprawia drukarki cioci.',
    'Technologia! Ładowanie wiedzy: 3 procent. Proszę czekać.',
    'Technologia. Jeśli coś nie działa, to na pewno wina aktualizacji.'
  ],
  cat_prl: [
    'PRL! Kolejka do odpowiedzi ustawia się tutaj.',
    'PRL! Pytania na kartki. Każdy dostaje przydział wiedzy.',
    'PRL. Kto nie pamięta, niech zapyta babcię. Po grze.',
    'PRL! Wiedza z tamtych lat, wydawana spod lady.',
    'PRL! Proszę nie kombinować. Chociaż wtedy wszyscy kombinowali.'
  ],
  cat_kuchnia: [
    'Kuchnia! Kto przypala wodę na herbatę, ten ma dziś pod górkę.',
    'Kuchnia! Wiedza świeża, prosto z garnka.',
    'Kuchnia. Pytania doprawione do smaku. Niektórym będzie za ostro.',
    'Kuchnia! Mam nadzieję, że nie tylko jecie, ale też czytacie przepisy.',
    'Kuchnia! Kto pyta „a ile to jest szczypta”, niech się przygotuje.'
  ],
  cat_sport: [
    'Sport! Kanapowi eksperci, wasz czas nadszedł.',
    'Sport! Rozgrzewka kciuków i jedziemy.',
    'Sport. Komentować mecze każdy umie, odpowiadać już niekoniecznie.',
    'Sport! Faul na wiedzy będzie karany żółtą kartką.',
    'Sport! Proszę nie symulować kontuzji przy trudnym pytaniu.'
  ],
  cat_historia: [
    'Historia! Kto spał na lekcjach, ten się dziś obudzi z ręką w nocniku.',
    'Historia! Daty, bitwy, królowie. I Wasze miny.',
    'Historia. Pytania sprzed wieków, odpowiedzi poproszę na teraz.',
    'Historia! Przypominam: Grunwald to nie jest nazwa pizzerii.',
    'Historia! Kto nie pamięta przeszłości, ten traci punkty.'
  ],
  cat_geografia: [
    'Geografia! Kto myli Austrię z Australią, niech się trzyma mocno.',
    'Geografia! Mapa w głowie, nie w telefonie.',
    'Geografia. Zobaczymy, kto podróżuje, a kto tylko ogląda zdjęcia znajomych.',
    'Geografia! Rzeki, stolice i Wasza zgubiona orientacja w terenie.',
    'Geografia! GPS wyłączony, kompas w dłoń.'
  ],
  cat_kosmos: [
    'Kosmos! Proszę nie odlatywać za daleko z odpowiedziami.',
    'Kosmos! Tu nikt nie usłyszy Waszego jęku.',
    'Kosmos. Pytania z innej galaktyki, odpowiedzi poproszę z tej.',
    'Kosmos! Grawitacja wiedzy działa na wszystkich jednakowo.',
    'Kosmos! Startujemy za trzy, dwa, jeden… i już ktoś się pogubił.'
  ],
  cat_zwierzeta: [
    'Zwierzęta! Wiewiórka by wiedziała. Zobaczymy, czy Wy też.',
    'Zwierzęta! Proszę nie odpowiadać jak przestraszony jeż.',
    'Zwierzęta. Kto myśli, że wieloryb to ryba, ma dziś pod górkę.',
    'Zwierzęta! Mam nadzieję, że nikt nie zgaduje na ślepo jak kret.',
    'Zwierzęta! Natura jest piękna. Wasze odpowiedzi zobaczymy.'
  ],
  cat_muzyka: [
    'Muzyka! Kto śpiewa tylko pod prysznicem, ma dziś szansę na solo.',
    'Muzyka! Fałsz w odpowiedziach będzie słychać.',
    'Muzyka. Zobaczymy, kto ma słuch, a kto tylko słuchawki.',
    'Muzyka! Proszę nie nucić odpowiedzi. Klikać!',
    'Muzyka! Hit czy kit? Zaraz się okaże.'
  ],
  cat_film: [
    'Film! Popcorn w gotowości, mózg też, mam nadzieję.',
    'Film! Spoilerów nie będzie. Tylko pytania i łzy.',
    'Film. Kto ogląda tylko zwiastuny, niech się trzyma.',
    'Film! Akcja! Cięcie! I punkty dla tych, co uważali.',
    'Film! Oscar za najlepszą minę przy pytaniu trafia do…'
  ],
  cat_logika: [
    'Logika! Myślenie nie boli. Tak twierdzą naukowcy.',
    'Logika! Tu nie pomoże zgadywanie. No dobra, trochę pomoże.',
    'Logika. Proszę uruchomić szare komórki. Wszystkie.',
    'Logika! Jeśli A wynika z B, to Wy wynikacie z kanapy.',
    'Logika! Zaraz zobaczymy, kto myśli, a kto tylko udaje.'
  ],
  cat_napoje: [
    'Napoje! Tylko bez degustacji podczas odpowiadania.',
    'Napoje! Kto zna się na rzeczy, ten wie. Kto pije, ten zgaduje.',
    'Napoje. Pytania gazowane, odpowiedzi poproszę klarowne.',
    'Napoje! Na zdrowie. I na punkty.',
    'Napoje! Ktoś tu chyba ma przewagę praktyczną.'
  ],
  cat_bajki: [
    'Bajki! Dzieciństwo wraca. Razem z traumą z Bambiego.',
    'Bajki! Dorośli gracze, dziecięce pytania, poważne łzy.',
    'Bajki. Kto nie zna, ten był chyba zbyt poważnym dzieckiem.',
    'Bajki! Dobranocka dla wiedzy. Oby nikt nie usnął.',
    'Bajki! Morał na koniec: trzeba było oglądać.'
  ],
  cat_jezyk: [
    'Język polski! Ortografia drży, przecinki się chowają.',
    'Język polski! Proszę nie mówić „poszłem”. Nawet w myślach.',
    'Język polski. Gżegżółka patrzy i ocenia.',
    'Język polski! Ó zamknięte, umysły otwarte.',
    'Język polski! Najtrudniejszy język świata, najłatwiejsze pytania. Prawie.'
  ],
  cat_pieniadze: [
    'Pieniądze! Wiedza nic nie kosztuje. Niewiedza kosztuje punkty.',
    'Pieniądze! Inflacja wiedzy jest dziś dość wysoka.',
    'Pieniądze. Kto oszczędza, ten ma. Kto zgaduje, ten traci.',
    'Pieniądze! Proszę nie liczyć na palcach. Albo liczyć, ale szybko.',
    'Pieniądze! Zobaczymy, kto tu jest prezesem, a kto stażystą.'
  ],
  cat_mitologia: [
    'Mitologia! Zeus patrzy. Nie zawiedźcie go.',
    'Mitologia! Bogowie się kłócą, a Wy odpowiadacie.',
    'Mitologia. Kto myli Herkulesa z Hermesem, ten się zaraz przekona.',
    'Mitologia! Achilles miał piętę, a Wy macie tę kategorię.',
    'Mitologia! Pytania z Olimpu, odpowiedzi z kanapy.'
  ],

  // ---------------------------------------------------------------- pytania
  newQuestion: [
    'Pytanie numer {n}. Proszę się skupić, to nie jest ćwiczenie.',
    'Kolejne pytanie! Kto zgaduje, niech zgaduje z wdziękiem.',
    'Pytanie {n}. Łatwe? Zobaczymy, co powiecie za piętnaście sekund.',
    'Następne! Mózgi na start, kciuki w gotowości.',
    'Pytanie {n}. Kto teraz nie trafi, ten stawia kolejkę. Herbaty.'
  ],
  lastQuestion: [
    'Ostatnie pytanie! Teraz albo nigdy. Raczej teraz.',
    'Finałowe pytanie! Proszę się nie spocić.',
    'Ostatnie pytanie. Cała wiedza, jaką macie, czas jej użyć.',
    'To już ostatnie! Ktoś jeszcze może wszystko odwrócić.',
    'Ostatnie pytanie! Pamiętajcie: ja to wszystko nagrywam. Nie, żartuję.'
  ],
  questionIdle: [
    'Myślicie tak głośno, że aż ekran się grzeje.',
    'Ktoś tu zgaduje. Czuję to w muszce.',
    'Spokojnie, czas jeszcze jest. Niedużo, ale jest.',
    'Patrzę na Wasze miny i już wiem, kto nie wie.',
    'Widzę, że niektórzy szukają odpowiedzi na suficie. Tam jej nie ma.'
  ],
  hurry: [
    'Pięć sekund! Kciuki, do roboty!',
    'Zegar nie śpi! A Wy?',
    'Ostatnie chwile! Kliknijcie cokolwiek, byle z przekonaniem!',
    'Czas ucieka! Jak wiedza po wakacjach!'
  ],
  hurryName: [
    '{name}, halo! Czas leci, a Ty dalej myślisz!',
    '{name}, odpowiedź sama się nie kliknie!',
    'Czekamy na Ciebie, {name}! Bez presji. Duża presja.',
    '{name}, wszyscy patrzą! Klikaj!',
    '{name}, zegar nie jest Twoim przyjacielem. Pospiesz się!'
  ],

  // ---------------------------------------------------------------- odsłona
  allFast: [
    'Ale tempo! Albo wszyscy wiedzą, albo wszyscy strzelają.',
    'Ekspresowe odpowiedzi! Mam nadzieję, że to wiedza, a nie panika.',
    'Szybko poszło! Pytanie było łatwe czy Wy macie dziś formę?',
    'Błyskawica! Kciuki dziś w formie olimpijskiej.',
    'Tak szybko? Nie zdążyłem nawet poprawić muszki.'
  ],
  noneCorrect: [
    'Nikt! Absolutnie nikt! Zapiszę to w kronice wstydu.',
    'Zero trafień. Pytanie wygrywa przez nokaut.',
    'Nikt nie trafił. To było pytanie czy zagadka sfinksa?'
  ],
  allCorrect: [
    'Wszyscy trafili! Za łatwo? Następnym razem się postaram.',
    'Komplet trafień! Ktoś chyba ściągał. Wszyscy?',
    'Sto procent! Zaczynam podejrzewać zmowę.',
    'Wszyscy dobrze! Wreszcie mogę być z Was dumny.',
    'Pełna pula trafień! Pytanie się poddało.'
  ],
  onlyOne: [
    'Tylko {name}! Reszta może bić brawo. Albo się wstydzić.',
    '{name} jako jedyny głos rozsądku w tym pokoju!',
    'Samotny bohater: {name}! Reszta poszła na spacer.',
    'Tylko {name}. Proszę o minutę ciszy dla reszty.'
  ],
  fastest: [
    '{name} w {time} s! Kciuk szybszy niż myśl.',
    'Najszybciej: {name}! Czy to jeszcze refleks, czy już czary?',
    '{name} odpowiada w {time} s. Reszta jeszcze czytała pytanie.',
    'Rekord tempa: {name}! {time} sekundy i po sprawie.'
  ],
  mixed: [
    'Trafień: {hits} na {total}. Bywało gorzej. Bywało też lepiej.',
    '{hits} z {total}. Klasa podzielona jak na wywiadówce.',
    '{hits} na {total} trafia. Reszta ma przerwę na refleksję.',
    'Wynik {hits} do {total}. Niektórym się udało, innym się wydawało.',
    'Połowa sukcesu, połowa porażki. Czyli zwykły wtorek.'
  ],
  leaderChange: [
    'Zmiana lidera! {name} wyprzedza: {prev}. Zrobiło się ciekawie!',
    '{prev}, oddaj koronę! Teraz rządzi {name}!',
    'Przewrót w studiu! {name} na czele, {prev} sprawdza, co poszło nie tak.',
    'Nowy lider: {name}! {prev} właśnie traci cierpliwość.'
  ],
  streak: [
    '{name}: {n} z rzędu! Ktoś tu chyba czyta encyklopedie do poduszki.',
    '{n} trafień z rzędu! {name}, zostaw coś dla innych!',
    '{name} nie zwalnia! Seria: {n}. Reszta patrzy z zazdrością.',
    'Seria {n} dla: {name}! Czy ktoś to w ogóle zatrzyma?'
  ],
  missStreak: [
    '{name}, trzecie pudło z rzędu. Proponuję zmianę taktyki. Na jakąkolwiek.',
    '{name} pudłuje konsekwentnie. Szacunek za wytrwałość!',
    'Trzy pudła z rzędu, {name}. Jutro będzie lepiej. Albo za tydzień.',
    '{name}, statystycznie zaraz musi się udać. Statystyka czeka.'
  ],

  // ---------------------------------------------------------------- runda / finał
  roundEnd: [
    'Koniec rundy {round}! {leader} prowadzi, {last} prowadzi od końca.',
    'Runda {round} za nami. {leader} na górze, {last} szuka formy.',
    'Po rundzie {round}: {leader} pewnie, {last} nerwowo.',
    'Runda {round} zamknięta! {last}, jeszcze nic straconego. Prawie nic.'
  ],
  roundEndSolo: [
    'Runda {round} zamknięta! {leader} pierwsze i ostatnie miejsce jednocześnie.',
    'Koniec rundy {round}. {leader} bezkonkurencyjnie. Dosłownie.',
    'Runda {round}! {leader} gra sam ze sobą i chyba wygrywa.',
    'Solo, runda {round}. {leader}, przynajmniej nikt Cię nie wyprzedzi.',
    'Runda {round}: {leader} kontra pytania. Pytania walczą dzielnie.'
  ],
  finished: [
    '{winner} wygrywa! Reszta może składać reklamacje. Nie przyjmuję.',
    'Mistrz wieczoru: {winner}! Proszę o owacje na stojąco. Albo siedząco.',
    '{winner} na szczycie! Dziś wolno się chwalić. Jutro już mniej.',
    'Koniec! {winner} triumfuje, a reszta liczy na rewanż.'
  ],
  podium: [
    '{second} i {third} – blisko było! Tak blisko, że aż żal.',
    'Podium: {second} i {third}. Medal to medal, nawet z czekolady.',
    '{second} drugie, {third} trzecie. Następnym razem więcej pewności siebie!',
    'Brawa dla: {second} i {third}! Mistrz był szybszy, ale niewiele.',
    '{second} i {third} – zasłużone miejsca. Za to bez nagrody, budżet się skończył.'
  ],

  // ---------------------------------------------------------------- sabotaże
  sabAttack: [
    '{name} rzuca kartę w: {target}. Przyjaźń wystawiona na próbę!',
    'Zdrada! {name} atakuje: {target}. Ale tak z uśmiechem.',
    '{target}, masz wroga. Nazywa się {name}.'
  ],
  sabType_fog: [
    'Mgła dla: {target}! Proszę zapalić światła przeciwmgielne.',
    '{target} we mgle. Nawet jeż we mgle miał łatwiej.',
    'Pada mgła na telefon gracza {target}. {name} uśmiecha się podejrzanie.',
    '{name} włącza wytwornicę dymu. Koncert dla jednego widza: {target}.',
    '{target}, przecieraj, przecieraj! Odpowiedź gdzieś tam jest.',
    'Gęsta mgła u: {target}. Prognoza od: {name}.'
  ],
  sabType_bubbles: [
    '{target} pływa w bąbelkach. Spa za darmo, ale czas płatny.',
    'Pianka dla: {target}! Pyk, pyk, a zegar tyk, tyk.',
    '{name} odpala maszynę do baniek. Ofiara: {target}.',
    'Bąbelki! {target}, przebijaj szybciej niż kot folię.',
    'Bąbelkowy atak na: {target}. Pachnie lawendą i porażką.',
    '{target} dostaje bąbelki. {name} dostaje moją cichą aprobatę.'
  ],
  sabType_math: [
    'Matma dla: {target}! Proszę pokazać, czego uczyła szkoła.',
    '{target} liczy, a punkty uciekają. Matematyka jest bezlitosna.',
    'Szybka matma! {target}, dwa plus dwa to wciąż cztery. Na razie.',
    '{name} zadaje zadanie z gwiazdką graczowi {target}.',
    'Sprawdzian niezapowiedziany dla: {target}! Nauczyciel: {name}.',
    '{target}, liczymy w pamięci, a nie na kalkulatorze w telefonie!'
  ],
  sabType_mash: [
    '{target} klika jak szalony! Ekran prosi o litość.',
    'Klikacz dla: {target}! Kciuk właśnie zapisał się na maraton.',
    '{name} każe graczowi {target} klikać do upadłego.',
    'Stuk, stuk, stuk! {target} trenuje palec, a czas leci.',
    '{target}, szybciej! Jak przy wyprzedaży biletów!',
    'Klikanie dla: {target}! Sponsorem odcinka jest {name}.'
  ],
  sabType_sequence: [
    '{target} układa liczby. Jeden, dwa, trzy… cztery? No, prawie.',
    'Kolejność dla: {target}. Jak w urzędzie: po kolei i bez nerwów.',
    '{name} sprawdza, czy {target} umie liczyć do kilku.',
    '{target}, po kolei! Nie na skróty, to nie autostrada.',
    'Układanka dla: {target}. Najtrudniejsza część: nie spanikować.',
    'Liczby w rozsypce u: {target}. Bałagan zrobił {name}.'
  ],
  sabType_catch: [
    '{target} goni przycisk. Przycisk wygrywa na razie.',
    'Uciekinier u: {target}! Łap go, zanim ucieknie z telefonu!',
    '{name} wypuszcza zbiega. {target} rusza w pogoń.',
    'Berek! {target} goni, przycisk ucieka, my się śmiejemy.',
    '{target}, przycisk jest szybszy niż Ty. Ale nie mądrzejszy!',
    'Polowanie dla: {target}! Zwierzyna: jeden mały przycisk.'
  ],
  sabRevenge: [
    'Rewanż! {name} oddaje graczowi {target} z odsetkami.',
    '{name} nie zapomina! {target}, to było do przewidzenia.',
    'Zemsta jest słodka. Szczególnie dla: {name}.',
    'Kto mieczem wojuje… {target}, dalszy ciąg znasz.'
  ],
  sabPiling: [
    '{target} znowu?! {n} ataki! Ktoś chyba za dobrze gra.',
    'Wszyscy na jednego: {target}! To się nazywa popularność.',
    '{target} ma już {n} sabotaże. Zbiera jak punkty w sklepie.',
    '{target} pod ostrzałem! Proszę o chwilę wsparcia dla ofiary.',
    'Znowu {target}! Chyba mamy tu cichego faworyta. Do bicia.'
  ],
  sabSurvived: [
    '{target} jak skała! Sabotaż odbity, punkty zgarnięte.',
    'Haha! {target} trafia mimo przeszkody. {name}, coś nie wyszło.',
    'Odporność level ekspert: {target}!',
    '{target} przechodzi przez sabotaż jak przez otwarte drzwi.'
  ],
  sabFailed: [
    '{target} pudłuje. Sabotaż od: {name} działa jak w zegarku.',
    'Sabotaż skuteczny! {target}, nie przejmuj się. Albo trochę się przejmij.',
    '{name} zaciera ręce. {target} liczy straty.',
    '{target} nie trafia. Ale wymówka jest naprawdę dobra!'
  ]
};

export const RUDE_LINES = {
  join: [
    'O, {name}. Kurde, myślałem, że przyjdzie ktoś mądry.',
    '{name} dołącza. Średnia inteligencji w pokoju właśnie spadła, ale nic to.',
    'Witaj, {name}! Wiedzy nie widzę, ale entuzjazm jest.',
    '{name} w grze. Cholera, a tak dobrze się zapowiadało.'
  ],
  lobbyIdle: [
    'Ile można skanować kod QR? To nie jest test na inteligencję. Chociaż…',
    'Czekamy na marudy. Kurczę blade, nawet ślimak by już dołączył.',
    'No dalej, matoły, klikajcie w ten link! Ja tu nie mam całej nocy.',
    'Ja pierdzielę, szybciej się rozpakowuje meble z paczki niż Wy dołączacie.'
  ],
  start: [
    'Zaczynamy! Do cholery, niech chociaż jedna osoba coś dziś wie.',
    'Startujemy! Patrzę na skład i już mi się nie chce.',
    'Kamery, światła, kompromitacja! Jedziemy!',
    'Zaczynamy, baranki! Pasza w postaci pytań zaraz będzie.'
  ],
  voteStart: [
    'Runda {round}. Wybierzcie kategorię, w której zbłaźnicie się najmniej.',
    'Głosujcie, matoły. I tak wszystko Wam idzie jednakowo źle.',
    'Runda {round}! Kurde, może tym razem coś trafię za Was.'
  ],
  voteIdle: [
    'Do cholery, to tylko kategoria, a nie wybór kredytu!',
    'Kliknąć to tak trudno? Ja pierdzielę, ileż można.',
    'No ruchy, łamagi! Głosowanie się samo nie zrobi.'
  ],
  voteResult: [
    '{category}. Gratuluję, właśnie wybraliście sobie gwóźdź do trumny.',
    '{category}? Kurde, odważnie jak na takie wyniki.',
    '{category}! No to pozamiatane. W sensie: Wasze punkty.',
    'Wygrywa: {category}. Kto na to głosował, ten nie ma za grosz instynktu samozachowawczego.'
  ],
  newQuestion: [
    'Pytanie {n}. Spróbujcie tym razem użyć głowy, a nie tylko kciuka.',
    'Kolejne pytanie. Kurde, aż się boję, co wymyślicie.',
    'Pytanie {n}. Proste jak drut, więc pewnie polegniecie.',
    'Następne! Do cholery, chociaż połowa niech trafi.'
  ],
  lastQuestion: [
    'Ostatnie pytanie! Ostatnia szansa, żeby nie wyjść stąd jak baran.',
    'Ostatnie! Ja pierdzielę, wreszcie koniec tego cierpienia.',
    'Finałowe pytanie. Kto teraz spudłuje, temu nawet ja nie pomogę.'
  ],
  questionIdle: [
    'Myślicie? Bo z tej strony wygląda to jak awaria systemu.',
    'Kurczę blade, ktoś tu czyta pytanie trzeci raz. Ze zrozumieniem by pomogło.',
    'Widzę te miny. Pustka jak w lodówce w poniedziałek.',
    'Cisza w studiu. Słychać, jak szare komórki proszą o urlop.',
    'Odpowiadacie jak po trzech piwach. A może to tylko ja tak widzę?'
  ],
  hurry: [
    'Pięć sekund, łamagi! Klikać, do cholery!',
    'No ruchy! Szybciej kombinuje kalkulator na baterie słoneczne w nocy!',
    'Czas, matoły! Zegar nie będzie na Was czekał!',
    'Kurde, klikajcie cokolwiek! Nawet strzał to lepsze niż nic!',
    'Ja pierdzielę, ślimak by już odpowiedział!'
  ],
  hurryName: [
    '{name}, rusz się, do cholery! Wszyscy czekają!',
    '{name}, zasnąć można! Klikaj, baranie!',
    'Halo, {name}! Ziemia do gracza! Odbiór!',
    '{name}, kurde, to nie szachy korespondencyjne!',
    '{name} myśli. Długo. Za długo. Cholera jasna, klikaj!'
  ],
  allFast: [
    'Szybko poszło. Pewnie dlatego, że nikt nie myślał.',
    'Ekspres! Albo geniusze, albo strzelanie na oślep. Stawiam na to drugie.',
    'Kurde, ale tempo. Szkoda, że mózgi nie nadążają za kciukami.'
  ],
  noneCorrect: [
    'Nikt?! Ja pierdzielę, nikt! To był najgorszy występ od czasów mojego debiutu.',
    'Zero trafień. Do cholery, kogo ja tu zaprosiłem?',
    'Nikt nie trafił. Pytanie wygrywa, a Wy idziecie na korepetycje.',
    'Cała ekipa pudłuje. Kurczę blade, to musiało boleć nawet pytanie.',
    'Nikt?! Matoły, przecież to było w podręczniku do czwartej klasy!',
    'Zero. Okrągłe zero. Jak Wasza wiedza z tej kategorii.'
  ],
  allCorrect: [
    'Wszyscy trafili. Pewnie pytanie było dla przedszkolaków.',
    'Komplet! Cholera, nie wiedziałem, że potraficie.',
    'Wszyscy dobrze! Kurde, ktoś Wam podpowiada? Przyznać się!',
    'Sto procent. Zapamiętajcie ten moment, drugi raz się nie zdarzy.'
  ],
  onlyOne: [
    'Tylko {name}! Reszta, matoły, do kąta!',
    '{name} jako jedyny myślący organizm w tym pokoju.',
    'Tylko {name}. Kurde, reszta chyba ogląda inny program.',
    'Brawo, {name}. Reszta – ja pierdzielę, szkoda gadać.'
  ],
  fastest: [
    '{name} w {time} s. Reszta jeszcze sznuruje buty.',
    'Najszybciej {name}! Pozostali klikają jak po trzech piwach.',
    '{name} w {time} s! Kurde, a reszta jeszcze szuka telefonu.',
    '{time} s dla: {name}. Reszta? Łamagi.'
  ],
  mixed: [
    '{hits} na {total}. Reszta ma dziś wolne od myślenia.',
    'Trafiło {hits} z {total}. Kurde, bywało gorzej. Ale rzadko.',
    '{hits} na {total}. Pozostali, do cholery, co to było?',
    'Wynik {hits} z {total}. Przynajmniej ktoś czytał pytanie.'
  ],
  leaderChange: [
    '{name} zrzuca z tronu: {prev}! Kurde, {prev}, ale wstyd.',
    '{prev}, prowadzenie przegrane jak klucze w kanapie. Teraz rządzi {name}!',
    'Nowy lider: {name}! {prev}, cholera jasna, co się stało?',
    '{name} na czele! {prev} właśnie dostaje lekcję pokory.'
  ],
  streak: [
    '{name}: {n} z rzędu! Albo geniusz, albo ma ściągę. Sprawdzę.',
    'Seria {n}, {name}! Reszta, matoły, uczcie się!',
    '{name} trafia {n} raz z rzędu. Kurde, aż się nudzę.',
    '{n} z rzędu dla: {name}! Do cholery, zostawcie coś reszcie!'
  ],
  missStreak: [
    '{name}, trzecie pudło z rzędu. To już nie pech, to talent.',
    '{name} pudłuje jak zawodowiec. Kurczę blade, może grasz w inną grę?',
    'Trzy pudła, {name}. Baranie, przeczytaj chociaż pytanie!',
    '{name}, cholera jasna, nawet losowo trafiłoby się raz na cztery!',
    '{name} znowu pudło. Statystyka płacze, a ja razem z nią.'
  ],
  roundEnd: [
    'Koniec rundy {round}. {leader} prowadzi, {last} prowadzi wycieczkę po dnie.',
    'Runda {round} za nami. {last}, kurde, nawet nie wiem, co powiedzieć.',
    'Po rundzie {round}: {leader} na górze, {last} w piwnicy. Z latarką.',
    'Runda {round}! {last} gra chyba w trybie demo.'
  ],
  roundEndSolo: [
    'Runda {round}. {leader} gra sam i i tak ledwo daje radę.',
    '{leader}, sam w grze i wciąż bez fajerwerków. Kurde.',
    'Koniec rundy {round}. {leader}, z kim przegrywasz, jak nikogo nie ma?'
  ],
  finished: [
    '{winner} wygrywa! Reszta – do cholery, trzeba było się uczyć.',
    'Mistrz: {winner}! Pozostali, matoły, idźcie poczytać encyklopedię.',
    '{winner} triumfuje. Reszta przegrywa z godnością. A raczej bez.',
    'Koniec! {winner} na szczycie, reszta na dnie. Kurde, ale widok.'
  ],
  podium: [
    '{second} i {third} – prawie. Prawie robi wielką różnicę, łamagi.',
    'Podium: {second} i {third}. Medal z tektury, bo na więcej nie zasłużyliście.',
    '{second} drugie, {third} trzecie. Kurde, blisko, ale bez cygara.'
  ],
  filler: [
    'Patrzę na Wasze wyniki i, ja pierdzielę, potrzebuję herbaty.',
    'Ciekawostka: złota rybka ma lepszą pamięć niż niektórzy z Was.',
    'Prowadziłem już wiele teleturniejów. Ten jest… wyjątkowy. Wyjątkowo słaby.',
    'Kurczę blade, gdyby za pomyłki dawali punkty, bylibyście mistrzami świata.',
    'Wiecie, co jest głośniejsze niż Wasze myślenie? Cisza w Waszych głowach.',
    'Do cholery, ja tu mam doktorat, a Wy nawet maturę z teleturnieju oblewacie.'
  ],
  sabAttack: [
    '{name} rzuca kartę w: {target}. Kurde, bez skrupułów!',
    '{name} kopie leżącego. Ofiara: {target}. Cholera, piękne.',
    '{target}, zostajesz skreślony. Pozdrowienia od: {name}.'
  ],
  sabType_fog: [
    'Mgła dla: {target}. I tak nic nie widzi w tych pytaniach, więc różnicy brak.'
  ],
  sabType_bubbles: [
    'Bąbelki dla: {target}! Kurde, wreszcie coś, co pęka szybciej niż Wasze nerwy.'
  ],
  sabType_math: [
    'Matma dla: {target}. Ja pierdzielę, tu się zaraz polegnie na tabliczce mnożenia.'
  ],
  sabType_mash: [
    'Klikacz dla: {target}! Klikaj, łamago, klikaj!'
  ],
  sabType_sequence: [
    'Kolejność dla: {target}. Do cholery, jeden, dwa, trzy – to nie fizyka kwantowa!'
  ],
  sabType_catch: [
    'Uciekinier! {target} goni przycisk jak baran swoją kolejkę do domu.'
  ],
  sabRevenge: [
    'Zemsta! {name} oddaje graczowi {target}. Kurde, a liczysz, że ujdzie Ci to płazem?',
    '{target}, cholera, sam się prosisz. {name} odpłaca z nawiązką.',
    'Rewanż od: {name}! {target}, ja pierdzielę, karma ma dziś dobry dzień.'
  ],
  sabPiling: [
    '{target} znowu dostaje! {n} ataki. Kurde, ludzie, zostawcie coś na później.',
    'Wszyscy biją w: {target}. Do cholery, to już lincz, nie gra.',
    '{target}, {n} kart na głowie. Albo jesteś groźny, albo słaby. Stawiam na to drugie.'
  ],
  sabSurvived: [
    '{target} trafia mimo sabotażu! {name}, kurde, nawet sabotować nie umiesz.',
    'Sabotaż jak z papieru. {target} trafia, a {name} wychodzi na łamagę.',
    '{target} wytrzymuje atak. Cholera jasna, {name}, wstyd!'
  ],
  sabFailed: [
    '{target} pudłuje. Sabotaż czy nie – i tak szło jak po grudzie.',
    'Kurde, {target}, sabotaż był mały, a pudło duże.',
    '{target} nie trafia. {name} zaciera ręce, a ja przewracam oczami.',
    'Pudło, {target}! Do cholery, nawet bez mgły szło Ci podobnie.'
  ]
};
