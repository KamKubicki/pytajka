/**
 * Kolejna porcja tekstów Profesora Pytajka (dokładana do pul z hostLines.js i hostLinesExtra.js).
 *
 *  - MORE_LINES        – „grzeczny” (trafia do LINES),
 *  - MORE_CHEEKY_LINES – docinki „z jajem” (trafia do CHEEKY_LINES),
 *  - MORE_RUDE_LINES   – „chamski 🌶️” (trafia do RUDE_LINES),
 *  - MORE_CATEGORY_POOLS – nowe pule kategorii (klucz z backendu -> pula).
 *
 * Zasady jak w hostLines.js: czas teraźniejszy, imiona tylko w mianowniku, bez form zależnych
 * od płci gracza. Liczebniki przy {n}/{hits}/{total} tylko w formie odpornej na odmianę
 * („seria {n}”, „{n} z rzędu”, „{n}. raz”, „licznik: {n}”).
 * Chamski tryb wyśmiewa wyłącznie GRĘ (wiedza, refleks, wyniki). Łagodne przekleństwa OK,
 * ciężkie wulgaryzmy, wygląd, waga, płeć, orientacja, pochodzenie, religia,
 * niepełnosprawność i treści seksualne – nigdy.
 */

// ---------------------------------------------------------------- nowe kategorie
export const MORE_CATEGORY_POOLS = {
  pilka_nozna: 'cat_pilka',
  kultura_polska: 'cat_kultura',
  nauka_polska: 'cat_nauka',
  zdrowie: 'cat_zdrowie',
  biznes: 'cat_biznes',
  rozrywka_polska: 'cat_popkultura',
  militaria: 'cat_militaria',
  swieta: 'cat_swieta',
  podroze: 'cat_podroze',
  architektura: 'cat_architektura',
  rekordy: 'cat_rekordy',
  moda: 'cat_moda',
  rosliny: 'cat_rosliny',
  jezyki_swiata: 'cat_jezyki'
};

export const MORE_LINES = {
  // ---------------------------------------------------------------- lobby
  join: [
    '{name} melduje się w studiu! Krzesło gotowe, presja też.',
    'Wita nas {name}! Kanapa właśnie zrobiła trochę miejsca.',
    '{name} w grze! Każdy nowy gracz to nowa szansa na kompromitację. Kogoś innego, oczywiście.',
    'Nowa osoba na liście: {name}! Zapisuję drukowanymi literami.'
  ],
  lobbyIdle: [
    'Proszę się nie krępować, kod QR nie wymaga zaproszenia.',
    'Muszka wyprasowana, pytania wytasowane. Czekamy na maruderów.',
    'Kto jeszcze się waha? Ta gra nie gryzie. Najwyżej trochę podszczypuje.'
  ],
  start: [
    'Startujemy! Graczy: {n}. Prowadzący: jeden. Ja. Jedziemy!',
    'Do dzieła! Niech wygra najlepszy umysł. Albo najszybszy kciuk.',
    'Oficjalnie otwieram Pytajkę! Szampana nie ma, jest wiedza.'
  ],

  // ---------------------------------------------------------------- głosowanie
  voteStart: [
    'Runda {round}! Proszę wybierać kategorię z głową. Najlepiej własną.',
    'Runda {round}, głosowanie! Pamiętajcie, że ja już znam pytania. Hehe.',
    'Kategorie na stół! Runda {round} czeka na Wasz wybór.',
    'Runda {round}. Jeden klik i los przesądzony. Bez presji.'
  ],
  voteIdle: [
    'Myślicie nad kategorią dłużej niż nad wyborem pizzy. Imponujące.',
    'Każdy głos jest ważny. Nawet ten oddany w ostatniej sekundzie.',
    'Kategorie czekają jak szczeniaki w schronisku. Któraś na pewno Was pokocha.',
    'Wybór kategorii to sztuka. Ewentualnie loteria. Głosujcie!'
  ],
  voteResult: [
    '{category}! Wybór przyjęty, odwrotu nie ma.',
    'Lud zdecydował: {category}. Zapisuję w protokole.',
    'I mamy to: {category}! Niech się dzieje.',
    '{category}! Pierwszy raz widzę tyle nadziei w jednym pokoju.',
    'Kategoria na tę rundę: {category}. Mózgi, rozgrzewka!',
    'Wybór pada na: {category}. Startujemy za chwilę!',
    '{category}! Doskonały wybór. Mówię tak o każdym, ale ten naprawdę.'
  ],

  // ---------------------------------------------------------------- kategorie (nowe pule)
  cat_pilka: [
    'Piłka nożna! Gwizdek sędziego, zaczynamy mecz!',
    'Piłka nożna! Kto wie, co to spalony, ma dziś przewagę.',
    'Futbol! Dziewięćdziesiąt minut pytań. No, trochę krócej.',
    'Piłka nożna! Proszę nie krzyczeć „gol” przed czasem.',
    'Piłka nożna! Kanapowa reprezentacja, na boisko!'
  ],
  cat_kultura: [
    'Kultura i literatura! Proszę usiąść prosto, jak na wieczorku poetyckim.',
    'Kultura! Mickiewicz patrzy z portretu. Bez stresu.',
    'Literatura! Kto czytał lektury, a nie streszczenia, ma dziś przewagę.',
    'Kultura i literatura! Wiedza z półki z książkami. Tej odkurzanej raz na rok.'
  ],
  cat_nauka: [
    'Nauka! Fartuchy na siebie, okulary ochronne na nos.',
    'Nauka! Eksperyment polega na tym, że ja pytam, a Wy wiecie.',
    'Nauka! Hipoteza: ktoś dziś zabłyśnie. Sprawdźmy ją.',
    'Nauka! Maria Skłodowska-Curie trzyma kciuki.'
  ],
  cat_zdrowie: [
    'Ciało i zdrowie! Pytania bez recepty, za to z punktami.',
    'Zdrowie! Proszę nie diagnozować się w trakcie gry.',
    'Ciało i zdrowie! Wiedza lepsza niż kolejka w przychodni. I szybsza.',
    'Zdrowie! Kto wie, ile kości ma człowiek, niech podniesie rękę. Wszystkie jej kości.'
  ],
  cat_biznes: [
    'Marki i biznes! Krawaty poprawione, wykresy w górę.',
    'Biznes! Dziś inwestujemy w wiedzę. Zwrot gwarantowany. Albo nie.',
    'Marki! Logo widzicie codziennie. Ciekawe, ile z nich pamiętacie.',
    'Biznes! Zebranie zarządu uważam za otwarte.'
  ],
  cat_popkultura: [
    'Popkultura i gry! Pady na bok, kciuki na ekran.',
    'Popkultura! Memy, gry i gwiazdy. Czas spędzony w internecie wreszcie się zwraca.',
    'Gry! Wreszcie nagroda za te zarwane noce.',
    'Popkultura! Wiedza z internetu, tylko tym razem sprawdzona.'
  ],
  cat_militaria: [
    'Lotnictwo i militaria! Baczność! Spocznij! Odpowiadać!',
    'Lotnictwo! Proszę zapiąć pasy, czeka nas turbulentna runda.',
    'Militaria! Strategia, taktyka i odrobina szczęścia.',
    'Lotnictwo i militaria! Wieża kontrolna zezwala na start.'
  ],
  cat_swieta: [
    'Święta i tradycje! Pierniki, pisanki i dyngus. Mamy wszystko!',
    'Tradycje! Pytania przekazywane z pokolenia na pokolenie. Prawie.',
    'Święta! Choinka w sercu, karp w wannie, wiedza w głowie.',
    'Tradycje! Andrzejki, Tłusty Czwartek i Wasze odpowiedzi. Same pyszności.',
    'Święta i tradycje! Proszę nie wróżyć z wosku, tylko odpowiadać.'
  ],
  cat_podroze: [
    'Podróże! Paszporty w dłoń, walizki spakowane.',
    'Podróże! Ten lot obsługuje Prof. Pytajek. Bagaż wiedzy bez limitu.',
    'Podróże! Proszę nie zgubić się na lotnisku pytań.',
    'Podróże! Kto zwiedził pół świata, ma dziś przewagę. Reszta ma wyobraźnię.',
    'Podróże! Odprawa zakończona, odlatujemy w stronę punktów.'
  ],
  cat_architektura: [
    'Budowle i architektura! Kaski na głowy, wchodzimy na plac budowy.',
    'Architektura! Pytania stoją na solidnych fundamentach.',
    'Budowle! Od zamków po wieżowce. Oby nic się nie zawaliło.',
    'Architektura! Gotyk, barok i Wasza logika. Wszystko z rozmachem.',
    'Budowle! Proszę nie budować zamków na piasku. Tylko na wiedzy.'
  ],
  cat_rekordy: [
    'Rekordy i ciekawostki! Najdłuższe, najwyższe, najdziwniejsze.',
    'Rekordy! Może ktoś dziś ustanowi rekord trafień.',
    'Ciekawostki! Wiedza zupełnie nieprzydatna. Poza dzisiejszym wieczorem.',
    'Rekordy! Księga rekordów patrzy. Albo przynajmniej ja.',
    'Ciekawostki! Zaraz się okaże, kto zbiera je jak znaczki.'
  ],
  cat_moda: [
    'Moda i styl! Proszę wyprostować kołnierzyki, kamera patrzy.',
    'Moda! Trendy przychodzą i odchodzą. Punkty zostają.',
    'Moda i styl! Moja muszka już się cieszy.',
    'Moda! Pytania prosto z wybiegu. Odpowiedzi poproszę z klasą.',
    'Moda i styl! Kto zna nazwiska projektantów, ten dziś błyszczy.'
  ],
  cat_rosliny: [
    'Rośliny i ogród! Konewki w dłoń, wiedza kiełkuje.',
    'Ogród! Pytania świeże, prosto z grządki.',
    'Rośliny! Proszę nie podlewać telefonów.',
    'Rośliny i ogród! Mam nadzieję, że wiedza się ukorzeniła.',
    'Ogród! Kto ma zieloną rękę, niech ją teraz położy na ekranie.'
  ],
  cat_jezyki: [
    'Języki świata! Hello, hola, ciao i dzień dobry!',
    'Języki! Proszę odpowiadać w dowolnym języku. Byle poprawnie.',
    'Języki świata! Wieża Babel zaprasza na pytania.',
    'Języki! Kto zna więcej niż „dziękuję” w trzech językach, ma przewagę.',
    'Języki świata! Merci, danke, gracias i powodzenia!'
  ],

  // ---------------------------------------------------------------- pytania
  newQuestion: [
    'Pytanie {n}! Oczy na ekran, palce w gotowości.',
    'Lecimy dalej! Pytanie {n} już czeka.',
    'Pytanie numer {n}. Spokojnie, czytajcie do końca.',
    'Nowe pytanie, nowe szanse!',
    'Kolejne pytanie, prosto z mojej teczki.',
    'Pytanie {n}. Mam przeczucie, że będzie ciekawie.',
    'Pytanie {n}. Głęboki wdech i do dzieła!',
    'Przed nami pytanie {n}. Powodzenia!'
  ],
  lastQuestion: [
    'Ostatnie pytanie! Wszystko albo nic. No, raczej wszystko albo trochę.',
    'Finał! Ostatnie pytanie, ostatnia szansa na chwałę.',
    'Ostatnie pytanie wieczoru! Proszę o maksymalne skupienie.'
  ],
  questionIdle: [
    'Czytajcie ze zrozumieniem. To nie wyścig. No dobra, trochę wyścig.',
    'W ciszy słychać, jak ktoś liczy na palcach. Szacunek za metodę.',
    'Ktoś się uśmiecha. Albo wie, albo blefuje.',
    'Spokojnie, odpowiedź gdzieś tam jest. Najczęściej na ekranie.',
    'Myślenie w toku. Proszę nie przeszkadzać.',
    'Czasu jeszcze trochę jest. Wykorzystajcie go mądrze.',
    'Widzę skupienie na twarzach. Piękny widok.'
  ],
  hurry: [
    'Ostatnie sekundy! Klik, klik!',
    'Zegar dobiega końca! Kto nie kliknie, ten nie trafi.',
    'Pięć sekund! Teraz albo przy następnym pytaniu!',
    'Odliczamy! Pięć, cztery… no, klikajcie!',
    'Tik-tak! Ostatnia chwila na decyzję!'
  ],
  hurryName: [
    '{name}, wszyscy już są! Brakuje tylko Ciebie!',
    '{name}, odliczamy! Pięć, cztery…',
    'Czekamy, {name}! Odwagi, jedno kliknięcie!'
  ],
  allFast: [
    'Komplet odpowiedzi w mgnieniu oka! Pewność siebie na wysokim poziomie.',
    'Wszyscy odpowiedzieli ekspresowo! Zegar nawet się nie rozgrzał.',
    'Szybko poszło! Ciekawe, czy równie dobrze.'
  ],

  // ---------------------------------------------------------------- ujawnienie
  noneCorrect: [
    'Nikt nie trafia! Pytanie triumfuje, a ja tylko rozkładam ręce.',
    'Zero trafień! Zapamiętajcie odpowiedź, przyda się w przyszłości.',
    'Nikt? Dobrze, że to tylko gra.',
    'Ani jednego trafienia. Pytanie zasłużyło na order.',
    'Zero na liczniku! Nic to, następne będzie łatwiejsze. Może.',
    'Nikt nie trafia. Pytanie było podchwytliwe, a Wy szlachetnie daliście się podejść.'
  ],
  allCorrect: [
    'Wszyscy trafiają! Pięknie, aż chce się żyć.',
    'Sto procent trafień! Takie chwile się pamięta.',
    'Komplet! Studio pełne geniuszy.',
    'Wszyscy dobrze! Duma rozpiera mnie od muszki po buty.',
    'Wszyscy dobrze! Proszę przybić sobie piątki. Wirtualne też się liczą.'
  ],
  onlyOne: [
    'Jedyne trafienie należy do: {name}! Owacja!',
    '{name} ratuje honor całej sali!',
    'Tylko {name} wie! Reszta, oklaski dla eksperta!',
    'Brawo, {name}! Jedna osoba, jedna dobra odpowiedź, sto procent klasy.',
    '{name} trafia jako jedyna osoba w studiu. Szacunek!',
    'Jedno trafienie w całym studiu i należy do: {name}. Brawo!'
  ],
  fastest: [
    '{name} trafia w {time} s! Refleks jak u bramkarza.',
    'Szybko i dobrze: {name}, {time} s!',
    '{name} w {time} s. Zanim zdążyłem dopić herbatę!',
    'Brawo, {name}! {time} s i trafione.',
    '{name} odpowiada w {time} s i trafia. Mistrzowski refleks!'
  ],
  mixed: [
    'Wynik: {hits} na {total}. Brawa dla trafionych!',
    '{hits} na {total}. Szklanka do połowy pełna. Mniej więcej.',
    'Studio podzielone! Wynik: {hits} na {total}.',
    'Część trafia, część się uczy. To też ważne.',
    'Wynik: {hits} na {total}. Następnym razem więcej, prawda?',
    'Brawo dla trafionych, a reszcie dedykuję następne pytanie.'
  ],
  leaderChange: [
    'Nowy lider: {name}! {prev} musi teraz gonić.',
    'Zmiana warty! {name} wyprzedza: {prev}.',
    '{name} wskakuje na pierwsze miejsce! {prev}, czas na kontratak.',
    'Korona zmienia właściciela! Prowadzi {name}.',
    'Na prowadzenie wychodzi {name}! {prev} depcze po piętach.'
  ],
  streak: [
    '{name} z serią {n}! Kto to zatrzyma?',
    'Już {n} z rzędu dla: {name}! Pięknie!',
    '{name} na fali! Seria: {n}!',
    'Seria {n}! {name} jest dziś w formie życia.',
    'Brawo, {name}! Seria {n} robi wrażenie.'
  ],
  missStreak: [
    '{name}, trzy pudła to tylko rozbieg. Teraz będzie skok!',
    'Głowa do góry, {name}! Następne pytanie jest Twoje.',
    '{name} zbiera doświadczenie. Punkty przyjdą później.'
  ],

  // ---------------------------------------------------------------- runda / koniec
  roundEnd: [
    'Runda {round} zamknięta! Na czele {leader}, na końcu {last}. Wszystko może się zmienić!',
    'Koniec rundy {round}! Brawa dla: {leader}. {last}, czas na pościg!',
    'Po rundzie {round}: rządzi {leader}, a {last} zbiera siły.'
  ],
  roundEndSolo: [
    'Runda {round} zakończona! {leader} prowadzi bez dyskusji. Nie było z kim dyskutować.',
    '{leader} kończy rundę {round} na pierwszym miejscu. Gratulacje dla jedynego uczestnika!'
  ],
  finished: [
    'Mamy mistrza! {winner} zgarnia tytuł wieczoru!',
    'Koniec gry! {winner} na szczycie. Gratulacje dla wszystkich za walkę!',
    'Wielki finał zakończony! {winner}, pokłon od Profesora!'
  ],
  podium: [
    'Srebro dla: {second}, brąz dla: {third}! Brawo!',
    'Na podium także: {second} i {third}. Piękna walka!'
  ],

  // ---------------------------------------------------------------- sabotaże
  sabAttack: [
    'Atak! {name} wybiera cel: {target}. Strategia czy zemsta?',
    '{name} wyciąga asa z rękawa. Adresat: {target}.',
    'Uwaga, karta w powietrzu! Leci od: {name} do: {target}.',
    '{target}, coś nadlatuje! Nadawca: {name}.',
    'Sabotaż! {name} wysyła niespodziankę. Odbiorca: {target}.'
  ],
  sabType_fog: [
    'Telefon: {target}. Pogoda: mgła. Prognoza od: {name}.'
  ],
  sabType_bubbles: [
    'Bąbelki dla: {target}! Pyk, pyk i do odpowiedzi.'
  ],
  sabType_math: [
    'Rachunki dla: {target}! Ołówek w dłoń. A, nie ma ołówka.'
  ],
  sabType_mash: [
    '{target} klika jak perkusista! Rytm nadaje {name}.'
  ],
  sabType_sequence: [
    'Po kolei, {target}! Spokojnie, liczby nie uciekną.'
  ],
  sabType_catch: [
    '{target}, łap ten przycisk! {name} kibicuje przyciskowi.'
  ],
  sabRevenge: [
    'Zemsta nadchodzi! {name} odpowiada tym samym. Adresat: {target}.',
    'Rachunki się wyrównują! {name} odsyła kartę do nadawcy, czyli do: {target}.'
  ],
  sabPiling: [
    'Znowu {target}! Licznik ataków: {n}. Popularność ma swoją cenę.',
    '{target} na celowniku po raz kolejny. Stan: {n}.'
  ],
  sabSurvived: [
    '{target} trafia mimo przeszkód! {name}, karta zmarnowana.',
    'Nie z nami takie numery! {target} trafia mimo sabotażu.',
    '{target} odpiera atak i zgarnia punkty. Brawo!',
    'Sabotaż nie straszny! {target} trafia, a {name} bije brawo. Albo i nie.'
  ],
  sabFailed: [
    'Sabotaż skuteczny! {target} pudłuje, {name} świętuje.',
    '{target} nie trafia. Karta, którą rzuca {name}, robi swoje.'
  ],

  // ---------------------------------------------------------------- wtrącenia
  filler: [
    'Ciekawostka: miód się nie psuje. Moje żarty niestety tak.',
    'Ciekawostka: flamingi stoją na jednej nodze. Polecam, świetnie wspiera koncentrację.',
    'Ciekawostka: krowy mają najlepsze przyjaciółki. A ja mam Was.',
    'Uwielbiam ten moment, kiedy wszyscy udają, że się nie stresują.',
    'Przypominam, że jestem bezstronny. Prawie zawsze.',
    'Ciekawostka: kolibry potrafią latać do tyłu. Tak jak niektóre wyniki w tabeli.',
    'Ciekawostka: banany są jagodami, a truskawki nie. Świat jest pełen niespodzianek.',
    'Dziękuję, że jesteście. Bez Was mówiłbym do pustej kanapy.'
  ]
};

export const MORE_CHEEKY_LINES = {
  join: [
    '{name} dołącza. Proszę zapiąć pasy, w tabeli będą turbulencje.',
    '{name} w grze! Czy ktoś sprawdził, czy wiedza też jest naładowana?',
    '{name} dołącza. Kolejny cel dla moich docinków.'
  ],
  lobbyIdle: [
    'Czekamy na resztę. Pewnie szukają telefonu, który trzymają w ręce.',
    'Rozgrzewka mózgów: proszę pomyśleć o czymkolwiek. Dla niektórych to już wyzwanie.',
    'Dołączcie wreszcie, pytania stygną.'
  ],
  start: [
    'Startujemy! Graczy: {n}. Zobaczymy, ilu wyjdzie z twarzą.',
    'Zaczynamy! Ręce na telefony, wymówki do szuflady.',
    'Graczy: {n}. A wiedzy ile? Zaraz sprawdzimy.'
  ],
  voteStart: [
    'Runda {round}. Wybierzcie mądrze, bo potem pretensje tylko do siebie.',
    'Runda {round}! Proszę nie wybierać kategorii po kolorze kafelka.',
    'Runda {round}. I tak każda kategoria Was pokona. Wybierzcie chociaż ładną.'
  ],
  voteIdle: [
    'Wybór kategorii to nie randka, nie trzeba się zastanawiać do rana.',
    'Demokracja wymaga kliknięcia. Jednego. Naprawdę.',
    'Ktoś czeka, żeby zobaczyć, jak głosują inni. Widzę to.',
    'To tylko kategoria, nie testament!',
    'Proszę nie zmieniać zdania co sekundę. Kategorie się męczą.'
  ],
  voteResult: [
    '{category}! Ktoś tu właśnie strzelił sobie w kolano.',
    '{category}. Głosowanie wygrane, teraz jeszcze tylko pytania. Drobiazg.',
    '{category}! Szykuje się festiwal zgadywania.',
    '{category}! Ciekawe, kto na to głosował, a kto teraz udaje, że nie.',
    '{category}. Wybór odważny. Zobaczymy, czy wiedza nadąży.'
  ],

  // ---------------------------------------------------------------- kategorie (nowe pule)
  cat_pilka: [
    'Piłka nożna! Każdy tu był kiedyś selekcjonerem. Teraz zobaczymy.',
    'Futbol! Kto ogląda tylko mundial co cztery lata, ma problem.'
  ],
  cat_kultura: [
    'Kultura! Teraz wyjdzie, kto czytał „Lalkę”, a kto tylko oglądał okładkę.',
    'Literatura! Streszczenia z internetu dziś nie pomogą.'
  ],
  cat_nauka: [
    'Nauka! Kto myśli, że atom to marka proszku, niech się trzyma.',
    'Nauka! Wyniki tego doświadczenia mogą być bolesne.'
  ],
  cat_zdrowie: [
    'Zdrowie! Doktor Google nie przyjmuje w tej rundzie.',
    'Ciało i zdrowie! Kto leczy wszystko herbatą z miodem, ten się zaraz zdziwi.'
  ],
  cat_biznes: [
    'Marki i biznes! Kto zna tylko marki z gazetki promocyjnej, ma pod górkę.',
    'Biznes! Kto lubi mówić „zróbmy burzę mózgów”, niech teraz pokaże choć mżawkę.'
  ],
  cat_popkultura: [
    'Popkultura! Kto mówi, że gry to strata czasu, zaraz się przekona.',
    'Gry i popkultura! Przycisk pauzy nie działa, sprawdzałem.'
  ],
  cat_militaria: [
    'Militaria! Kto zna czołgi tylko z gier, ten zaraz pozna je z bliska.',
    'Lotnictwo! Kto myli myśliwiec ze śmigłowcem, zostaje na lotnisku.'
  ],
  cat_swieta: [
    'Święta! Kto zna tylko tradycję jedzenia, ma dziś przewagę połowiczną.',
    'Tradycje! Kto myśli, że Tłusty Czwartek to dzień tygodnia jak każdy inny, ma problem.'
  ],
  cat_podroze: [
    'Podróże! Wakacje all inclusive nie liczą się jako zwiedzanie.',
    'Podróże! Kto zna świat tylko z hotelowego basenu, będzie dziś pływać.'
  ],
  cat_architektura: [
    'Budowle! Kto myśli, że gotyk to styl ubierania się, ma problem.',
    'Architektura! Po tej rundzie niektórym zawali się strop wiedzy.'
  ],
  cat_rekordy: [
    'Rekordy! Jedyny rekord, jaki tu może paść, to rekord pomyłek. Zobaczymy.',
    'Ciekawostki! Kto zna ich pełno, niech nie zanudza nimi po grze.'
  ],
  cat_moda: [
    'Moda! Skarpetki do sandałów to też jakiś styl. Ale punktów nie da.',
    'Moda i styl! Teraz wyjdzie, kto śledzi trendy, a kto tylko kiwa głową przy znajomych.'
  ],
  cat_rosliny: [
    'Rośliny! Kto ususzył kaktusa, ma dziś coś do udowodnienia.',
    'Ogród! Kto odróżnia tylko trawę od nie-trawy, ma problem.'
  ],
  cat_jezyki: [
    'Języki świata! Kto na wakacjach mówi tylko „one beer, please”, ma kłopot.',
    'Języki! Tłumacz w telefonie ma dziś wolne.'
  ],

  // ---------------------------------------------------------------- pytania
  newQuestion: [
    'Pytanie {n}. Kto teraz strzela na ślepo, ten później się tłumaczy.',
    'Następne pytanie! Proszę nie robić tej miny, jeszcze go nie widzieliście.',
    'Pytanie {n}. Łatwe. Dla mnie. Ja mam odpowiedzi.',
    'Kolejne pytanie! Wiedza na stół, wymówki pod stół.',
    'Pytanie {n}. Czas na rehabilitację po poprzednim.',
    'Kolejne pytanie. Oby nie skończyło się jak poprzednie.',
    'Pytanie {n}. Kto zgadnie, ten bohater. Kto nie, ten ma wymówkę.',
    'Kolejne pytanie. Uwaga, może zawierać wiedzę.',
    'Pytanie {n}. Proszę nie klikać, zanim się przeczyta. Patrzę na niektórych.'
  ],
  lastQuestion: [
    'Ostatnie pytanie! Kto teraz spudłuje, ten zbiera kubki po grze.',
    'Ostatnie pytanie. Ostatnia okazja, żeby zostać bohaterem albo memem.',
    'Ostatnie pytanie! Niech chociaż finał wyjdzie przyzwoicie.'
  ],
  questionIdle: [
    'Widzę palec zawieszony nad ekranem. Odwagi!',
    'Ktoś tu zmienia zdanie trzeci raz. W myślach, ale widzę.',
    'Głęboki namysł. Szkoda, że czas płynie.',
    'Ciekawe, ilu z Was zgaduje z kamienną twarzą.',
    'Tak długo myślicie, że aż zegar się nudzi.',
    'Ktoś tu klika i od razu żałuje. Znam to spojrzenie.',
    'Myślicie tak intensywnie, że muszka mi się przekrzywiła.',
    'Kto jeszcze nie kliknął, niech wie, że zegar nie ma cierpliwości.'
  ],
  hurry: [
    'Czas się kończy, a niektórzy dalej podziwiają pytanie.',
    'Hej! To nie wystawa, tylko quiz! Klikać!',
    'Pięć sekund! Intuicjo, ratuj!',
    'Czas ucieka, a Wy dalej medytujecie!',
    'Pięć sekund! Teraz nawet strzał ma sens.',
    'Ostatnie sekundy! Kto nie kliknie, ten nie wygra. Proste.'
  ],
  hurryName: [
    '{name}, myślisz czy drzemiesz?',
    '{name}, odpowiedź nie dojrzeje, jak ją dłużej potrzymasz!',
    '{name} analizuje. Zegar już się niecierpliwi.',
    '{name}, kliknij cokolwiek, potem będziemy się zastanawiać!'
  ],
  allFast: [
    'Ale pośpiech! Ktoś się spieszy na autobus?',
    'Wszyscy już? Mam nadzieję, że czytaliście pytanie, a nie tylko odpowiedzi.'
  ],

  // ---------------------------------------------------------------- ujawnienie
  noneCorrect: [
    'Nikt! Gratuluję jedności. W błędzie, ale jedności.',
    'Zero trafień. Proszę udawać, że to była pułapka.',
    'Nikt nie wiedział. Ja też nie, ale ja mam kartkę.',
    'Zero. Proponuję minutę ciszy za wszystkie zmarnowane punkty.',
    'Zero trafień. Pytanie odchodzi niepokonane i z podniesioną głową.',
    'Nikt nie trafia. Gdyby to był egzamin, cała klasa szłaby na poprawkę.'
  ],
  allCorrect: [
    'Wszyscy trafili. Ktoś tu chyba ma dostęp do moich notatek.',
    'Komplet trafień. Trudne pytanie? Najwyraźniej nie.',
    'Sto procent! Proszę się nie przyzwyczajać.',
    'Wszyscy trafili. Pewnie przez przypadek, ale się liczy.',
    'Wszyscy trafiają. Podejrzewam przeciek z redakcji.'
  ],
  onlyOne: [
    '{name} trafia. Reszta może zapisać się na korepetycje.',
    'Tylko {name}! Reszta, notatki i powtórka materiału.',
    '{name} wie, a reszta tylko udaje, że wiedziała.',
    'Jedno trafienie: {name}. Reszta liczy, że nikt tego nie zapamięta.',
    'Tylko {name}! Reszta właśnie dowiaduje się czegoś nowego.',
    '{name} trafia, a reszta robi miny, jakby wiedziała od początku.'
  ],
  fastest: [
    '{name} w {time} s. Ktoś tu chyba znał odpowiedź przed pytaniem.',
    '{name}: {time} s. Ciekawe, czy myślenie było wliczone w cenę.',
    'Najszybciej: {name}! {time} s. Reszta jeszcze czyta pierwszą linijkę.',
    '{time} s, {name}! A reszta dopiero odblokowuje telefon.',
    '{name} w {time} s. Kciuk szybszy niż myśli całej reszty.',
    '{name}, {time} s. Reszta jeszcze wybierała, którym palcem kliknąć.'
  ],
  mixed: [
    '{hits} na {total}. Reszta: odpowiedź była na ekranie. Naprawdę.',
    'Wynik {hits} na {total}. Niektórzy wiedzą, inni mają nadzieję.',
    'Trafionych: {hits}. Nietrafionych: cała reszta. Matematyka jest okrutna.',
    '{hits} na {total}. Reszta chyba grała w inną grę.',
    '{hits} na {total}. Jedni się cieszą, drudzy udają, że to nic.',
    'Wynik {hits} na {total}. Część z Was wie, część ma dobre intencje.',
    'Trafienia: {hits} na {total}. Reszcie składam wyrazy współczucia.'
  ],
  leaderChange: [
    '{prev}, tron był wygodny? Szkoda, teraz siedzi na nim {name}.',
    '{name} na czele! {prev} właśnie odkrywa smak srebra.',
    'Prowadzenie dla: {name}. {prev}, to nie był dobry moment na drzemkę.',
    '{name} wyprzedza: {prev}. Jak ktoś, kto podbiera ostatni kawałek pizzy.',
    '{name} wyprzedza: {prev}. Ktoś tu zasnął na prowadzeniu.',
    'Nowy szef w tabeli: {name}. {prev}, proszę oddać klucze do gabinetu.'
  ],
  streak: [
    '{name}: {n} razy z rzędu. Ktoś tu się przygotowywał po nocach.',
    '{name} trafia {n}. raz z rzędu. Proszę sprawdzić, czy nie ma słuchawki w uchu.',
    'Seria {n} dla: {name}. Reszta, czas zacząć się bać.',
    'Seria {n} dla: {name}! Ktoś musi to zatrzymać, zanim zrobi się nudno.',
    '{name} trafia raz za razem. Licznik serii: {n}. Reszta notuje.'
  ],
  missStreak: [
    '{name}, trzy pudła z rzędu. Konsekwencja godna podziwu.',
    '{name} testuje po kolei wszystkie złe odpowiedzi. Metoda eliminacji?',
    '{name}, jeszcze chwila i będzie z Ciebie ekspert od tego, czego nie wiadomo.',
    '{name}, trzy pudła z rzędu. Kolejne pytanie na pewno będzie Twoje. Prawdopodobnie.'
  ],

  // ---------------------------------------------------------------- runda / koniec
  roundEnd: [
    'Runda {round} za nami. {leader} świętuje, {last} liczy na cud.',
    '{leader} na szczycie po rundzie {round}, {last} na drugim końcu tabeli. Ale jeszcze się da!',
    'Runda {round}! {last}, nie martw się, ktoś musi być ostatni. Dziś wypadło na Ciebie.',
    'Runda {round} za nami! {leader} zaciera ręce, a {last} zaciera ślady.'
  ],
  roundEndSolo: [
    'Runda {round}. {leader}, samotność na szczycie bywa trudna.',
    'Koniec rundy {round}. {leader} wygrywa walkowerem.'
  ],
  finished: [
    '{winner} wygrywa! Reszta może szukać wymówek. Proszę bardzo, mam czas.',
    'Zwycięstwo dla: {winner}! Od teraz {winner} wybiera film na wieczór.',
    '{winner} triumfuje! Będzie o czym opowiadać przy każdej okazji.',
    '{winner} wygrywa! Reszta, rewanż jest możliwy. Wynik niestety zostaje.'
  ],
  podium: [
    '{second} i {third} na podium. Medal to medal, nawet jeśli nie złoty.',
    '{second} drugie, {third} trzecie. Zabrakło tak mało, że aż szkoda gadać.',
    '{second} i {third} na podium. Dobre i to, jak na takie odpowiedzi.'
  ],

  // ---------------------------------------------------------------- sabotaże
  sabAttack: [
    '{name} uśmiecha się niewinnie, ale {target} już wie, co się święci.',
    'Sabotaż! {name} najwyraźniej uważa, że {target} gra za dobrze.',
    '{name} atakuje: {target}. Przyjaźń? Jaka przyjaźń?',
    '{name} wali kartą w: {target}. Bez litości!',
    '{name} rzuca kartę i robi niewinną minę. {target}, ja wszystko widziałem.',
    'Karta od: {name} leci do: {target}. Ładnie to tak?'
  ],
  sabRevenge: [
    '{target} zaczyna, {name} kończy. Bumerang zawsze wraca.',
    '{name} nie zapomina. {target} właśnie się o tym przekonuje.',
    'Zemsta! {name} odpłaca się za kartę. Adresat: {target}. Ale pamiętliwa ekipa.'
  ],
  sabPiling: [
    '{target} ma dziś fanklub. Liczba kart: {n}.',
    'Wszystkie karty lecą w: {target}. Licznik: {n}. Zbieg okoliczności? Nie sądzę.'
  ],
  sabSurvived: [
    '{name}, ten sabotaż był jak parasolka w huraganie. {target} trafia!',
    '{target} trafia. {name} właśnie przelicza, czy warto było.',
    'Sabotaż od: {name} odbity jak piłka. {target} trafia!',
    '{target} trafia mimo sabotażu! {name}, może następnym razem coś mocniejszego?'
  ],
  sabFailed: [
    '{target} pudłuje i ma idealną wymówkę. Nazywa się {name}.',
    '{name} zaciera ręce, {target} zgrzyta zębami.',
    'Pudło, {target}! Ale przynajmniej z usprawiedliwieniem.',
    '{target} pudłuje. Karta od: {name} spisała się na medal.'
  ],

  // ---------------------------------------------------------------- wtrącenia
  filler: [
    'Każdy błąd to lekcja. Dziś mamy całe korepetycje.',
    'Ciekawostka: mózg zużywa mnóstwo energii. U niektórych tutaj chyba działa w trybie oszczędnym.',
    'Proszę mi wierzyć, ja też byłem kiedyś amatorem. Wczoraj.',
    'Gdyby za podpowiadanie dawali punkty, wiem, kto by dziś wygrał.',
    'Lubię Was. Szczególnie wtedy, gdy trafiacie.',
    'Ciekawostka: jestem tu jedyną osobą, która zna wszystkie odpowiedzi. Prawie wszystkie.',
    'Proszę nie patrzeć na mnie tak błagalnie. Nie podpowiem.'
  ]
};

export const MORE_RUDE_LINES = {
  join: [
    '{name}? Cholera, myślałem, że to już komplet mądrych głów. Był.'
  ],
  lobbyIdle: [
    'Ja pierdzielę, szybciej się gotuje rosół, niż Wy skanujecie kod.'
  ],
  start: [
    'Zaczynamy! Cholera, oby było choć jedno trafienie na głowę.'
  ],
  voteStart: [
    'Runda {round}. Kurde, wybierzcie coś, w czym nie polegniecie w pierwszej minucie.'
  ],
  voteIdle: [
    'Matoły, głosujcie, bo wybiorę za Was. Coś okropnego.'
  ],
  voteResult: [
    '{category}. Kurde, odwaga godna lepszej sprawy.',
    '{category}! Ja pierdzielę, już widzę te pudła.'
  ],

  // ---------------------------------------------------------------- kategorie (istniejące pule)
  cat_motoryzacja: [
    'Motoryzacja. Kurde, połowa z Was zmienia olej dopiero wtedy, gdy spod maski idzie dym.'
  ],
  cat_technologia: [
    'Technologia. Ja pierdzielę, połowa z Was resetuje router, wyrywając wszystkie kable naraz.'
  ],
  cat_prl: [
    'PRL. Kurde, wiedza z tamtych lat jak towar w sklepie: nie ma.'
  ],
  cat_kuchnia: [
    'Kuchnia. Cholera, Wasza wiedza kulinarna kończy się na numerze do pizzerii.'
  ],
  cat_sport: [
    'Sport. Kurde, kanapowi mistrzowie, tym razem bez pilota i bez wymówek.'
  ],
  cat_historia: [
    'Historia. Ja pierdzielę, zaraz się okaże, że ktoś myśli, że Mieszko I miał konto w banku.'
  ],
  cat_geografia: [
    'Geografia. Kurde, część z Was gubi się w galerii handlowej, a tu cały świat.'
  ],
  cat_kosmos: [
    'Kosmos. Cholera, Wasza wiedza działa jak czarna dziura: wszystko wpada, nic nie wychodzi.'
  ],
  cat_zwierzeta: [
    'Zwierzęta. Kurde, sowa by się popłakała, a wróbel podpowiedziałby lepiej.'
  ],
  cat_muzyka: [
    'Muzyka. Ja pierdzielę, Wy fałszujecie nawet przy klikaniu.'
  ],
  cat_film: [
    'Film. Kurde, tu Oscar za odpowiedzi raczej nikomu nie grozi.'
  ],
  cat_logika: [
    'Logika. Cholera, liczenie na palcach dozwolone, ale tylko do dziesięciu.'
  ],
  cat_napoje: [
    'Napoje. Kurde, praktyki macie dużo, ciekawe, jak z teorią.'
  ],
  cat_bajki: [
    'Bajki. Ja pierdzielę, jak tu ktoś nie zna Reksia, to ja wychodzę.'
  ],
  cat_jezyk: [
    'Język polski. Kurde, zaraz się okaże, ile „poszłem” siedzi w tym pokoju.'
  ],
  cat_pieniadze: [
    'Pieniądze. Cholera, przy takiej wiedzy nawet skarbonka by zbankrutowała.'
  ],
  cat_mitologia: [
    'Mitologia. Kurde, Zeus już szykuje pioruny na pierwszą osobę, która spudłuje.'
  ],

  // ---------------------------------------------------------------- kategorie (nowe pule)
  cat_pilka: [
    'Piłka nożna. Kurde, odpowiadacie jak nasza kadra w doliczonym czasie.',
    'Piłka nożna. Cholera, ktoś już szuka wymówki, że murawa była krzywa.'
  ],
  cat_kultura: [
    'Kultura i literatura. Kurde, mam przeczucie, że ostatnia przeczytana książka to instrukcja do pralki.',
    'Literatura! Ja pierdzielę, czas sprawdzić, kto w liceum jechał na brykach.'
  ],
  cat_nauka: [
    'Nauka. Kurde, po Waszych odpowiedziach Newton poprosiłby o zwrot jabłka.'
  ],
  cat_zdrowie: [
    'Ciało i zdrowie. Cholera, po tej rundzie niektórym przyda się zwolnienie lekarskie z myślenia.'
  ],
  cat_biznes: [
    'Marki i biznes. Kurde, z takimi wynikami nawet stragan z pietruszką by splajtował.'
  ],
  cat_popkultura: [
    'Popkultura. Ja pierdzielę, tyle godzin przed ekranem, zobaczmy, czy cokolwiek zostało w głowie.',
    'Gry! Kurde, tu nie ma zapisu stanu gry przed trudnym pytaniem.'
  ],
  cat_militaria: [
    'Lotnictwo i militaria. Kurde, z taką celnością odpowiedzi trzymajcie się z dala od strzelnicy.'
  ],
  cat_swieta: [
    'Święta i tradycje. Kurde, wiecie więcej o promocjach przedświątecznych niż o samych świętach.',
    'Tradycje! Cholera, nawet karp w wannie wiedziałby więcej.'
  ],
  cat_podroze: [
    'Podróże. Ja pierdzielę, połowa z Was gubi się w drodze do sklepu, a my tu o całym świecie.'
  ],
  cat_architektura: [
    'Budowle i architektura. Kurde, Wasza wiedza ma solidność szałasu z patyków.'
  ],
  cat_rekordy: [
    'Rekordy. Kurde, jeśli ktoś tu pobije rekord, to w szybkości pudłowania.'
  ],
  cat_moda: [
    'Moda i styl. Kurde, Wasza wiedza modowa to wyprzedaż z zeszłego sezonu.'
  ],
  cat_rosliny: [
    'Rośliny i ogród. Cholera, przy Waszej wiedzy uschłaby nawet plastikowa paprotka.'
  ],
  cat_jezyki: [
    'Języki świata. Kurde, z polskim bywa ciężko, a tu jeszcze cały świat.'
  ],

  // ---------------------------------------------------------------- pytania
  newQuestion: [
    'Pytanie {n}. Kurde, przeczytajcie je chociaż raz w całości.',
    'Pytanie {n}. Ja pierdzielę, trzymam kciuki, bo nic innego mi nie zostało.',
    'Następne pytanie, matoły. Tym razem z głową, proszę.'
  ],
  lastQuestion: [
    'Ostatnie pytanie. Kurde, wyciśnijcie resztki szarych komórek, ile się da!'
  ],
  questionIdle: [
    'Cisza jak w bibliotece. Szkoda, że bez książek w głowach.',
    'Ja pierdzielę, ktoś tu chyba czeka na podpowiedź z kosmosu.'
  ],
  hurry: [
    'Kurde, pięć sekund! Ruszcie te kciuki!',
    'Ruchy, matoły! Zegar nie bierze jeńców!'
  ],
  hurryName: [
    '{name}, kurde, telefon nie gryzie! Klikaj!',
    '{name}, cholera jasna, cała sala czeka!',
    '{name}, ja pierdzielę, pytanie nie zrobi się łatwiejsze od patrzenia!'
  ],
  allFast: [
    'Kurde, szybko. Za szybko. Coś czuję, że będzie płacz.'
  ],

  // ---------------------------------------------------------------- ujawnienie
  noneCorrect: [
    'Zero trafień. Kurde, a to pytanie było prostsze niż instrukcja do mikrofalówki.',
    'Nikt?! Cholera jasna, ja wnoszę pytania, a Wy wynosicie kompromitację.',
    'Ja pierdzielę, nikt. Pytanie powinno dostać nagrodę za wytrwałość.',
    'Okrągłe zero, matoły. Wiedza wyszła i nie wróciła.'
  ],
  allCorrect: [
    'Komplet! Cholera, chyba za łatwe pytania wybieram.',
    'Wszyscy dobrze. Ja pierdzielę, cud się zdarzył, zapiszcie datę.'
  ],
  onlyOne: [
    'Tylko {name}! Reszta, kurde, wstyd na całą dzielnicę.',
    '{name} trafia. Pozostali, ja pierdzielę, gdzie byliście?',
    'Jedyny działający mózg na sali: {name}. Reszta na urlopie.',
    'Tylko {name}. Cholera, reszta chyba klikała łokciem.'
  ],
  fastest: [
    '{name} w {time} s. Kurde, reszta klika jak na starym modemie.',
    '{name} w {time} s. Ja pierdzielę, a reszta wciąż szuka, gdzie się klika.'
  ],
  mixed: [
    'Wynik {hits} na {total}. Cholera, pozostali, wstyd przed sąsiadami.'
  ],
  leaderChange: [
    '{prev}, kurde, prowadzenie przeciekło jak przez sito. Teraz rządzi {name}!',
    'Cholera, ale upadek! {prev} spada z tronu, a na górze siedzi {name}.',
    '{name} prowadzi. {prev}, ja pierdzielę, chwila nieuwagi i po koronie.'
  ],
  streak: [
    '{name}: {n} z rzędu. Kurde, zostaw coś dla tych matołów.',
    'Seria {n}, {name}! Cholera, reszta przy Tobie to drużyna rezerwowa.',
    '{name} z serią {n}. Ja pierdzielę, czy ktoś tu w ogóle stawia opór?'
  ],
  missStreak: [
    '{name}, kurde, rzut monetą dałby lepszy wynik!',
    '{name}, cholera, trzy pudła. To już styl życia.',
    '{name}, ja pierdzielę, nawet zepsuty zegar ma rację dwa razy na dobę.'
  ],

  // ---------------------------------------------------------------- runda / koniec
  roundEnd: [
    'Runda {round}. {leader} prowadzi, a {last}, kurde, chyba gra z zamkniętymi oczami.',
    'Koniec rundy {round}! {last}, cholera, tabela płacze, jak na Ciebie patrzy.',
    'Po rundzie {round}: {leader} na górze, {last} w okopach. Ja pierdzielę, ale przepaść.'
  ],
  roundEndSolo: [
    'Runda {round}. {leader}, kurde, gra solo i dalej bez rekordów.'
  ],
  finished: [
    '{winner} wygrywa! Reszta, kurde, było blisko. Nie, nie było.',
    'Zwycięża {winner}. Cholera, przynajmniej jedna osoba coś dziś wiedziała.',
    'Koniec! {winner} mistrzem, a reszta, ja pierdzielę, marsz na korepetycje.'
  ],
  podium: [
    'Podium: {second} i {third}. Cholera, srebro i brąz też trzeba umieć przegrać.'
  ],

  // ---------------------------------------------------------------- sabotaże
  sabAttack: [
    'Cholera, {name} poluje na: {target}. Piękna podłość.',
    '{target}, ja pierdzielę, {name} chyba ma Cię dość.'
  ],
  sabType_fog: [
    'Mgła dla: {target}. Cholera, {name} wie, jak zepsuć komuś widok.'
  ],
  sabType_bubbles: [
    'Bąbelki dla: {target}. Kurde, przebijaj, a nie podziwiaj!'
  ],
  sabType_math: [
    '{target} liczy. Ja pierdzielę, oby palców starczyło.'
  ],
  sabType_mash: [
    '{target}, klikaj, cholera! Kciuk nie jest na emeryturze!'
  ],
  sabType_sequence: [
    '{target}, kurde, jeden, dwa, trzy. Przedszkolaki dają radę!'
  ],
  sabType_catch: [
    '{target} goni przycisk. Ja pierdzielę, przycisk ma lepszy refleks.'
  ],
  sabRevenge: [
    '{target}, kurde, myślisz, że to przejdzie bez echa? {name} oddaje!'
  ],
  sabPiling: [
    '{target}, kurde, licznik sabotaży: {n}. Ktoś Cię naprawdę nie lubi.',
    'Ja pierdzielę, {target} obrywa już {n}. raz. To nie gra, to oblężenie.'
  ],
  sabSurvived: [
    '{target} trafia, a {name}, kurde, zostaje z ręką w nocniku.',
    '{name}, cholera, sabotaż na pół gwizdka. {target} i tak trafia.',
    'Ja pierdzielę, {name}, nawet sabotaż nie wyszedł. {target} trafia.'
  ],
  sabFailed: [
    '{target} pudłuje. Kurde, pewnie i bez sabotażu byłoby to samo.',
    '{name} trafia sabotażem, {target} pudłuje odpowiedzią. Cholera, piękna współpraca.',
    '{target}, ja pierdzielę, pudło jak stodoła.'
  ],

  // ---------------------------------------------------------------- wtrącenia
  filler: [
    'Kurde, prowadzę ten program z miłości. Na pewno nie dla Waszych wyników.',
    'Ciekawostka: ślimak pokonuje kilka metrów na godzinę. Nie wiem, czemu o tym myślę, patrząc na Was.',
    'Cholera, tęsknię za czasami, gdy ktoś tu coś wiedział.',
    'Matoły kochane, ja Was naprawdę lubię. Tylko Waszej wiedzy nie ufam.'
  ]
};
