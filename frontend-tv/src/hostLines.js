/**
 * Teksty Profesora Pytajka – prowadzącego teleturnieju.
 *
 * Zasady pisania:
 *  - czas teraźniejszy i formy bezosobowe ("{name} trafia!"), bo nie znamy płci graczy,
 *  - imiona tylko w mianowniku (nie odmieniamy),
 *  - docinki lekkie, bez wulgaryzmów, bez żartów o wyglądzie, płci czy pochodzeniu.
 *
 * Zmienne: {name} {prev} {n} {round} {category} {time} {hits} {total}
 *          {leader} {last} {winner} {second} {third} {target}
 * Sabotaże: {name} = atakujący, {target} = ofiara.
 */

import { CHEEKY_LINES, RUDE_LINES } from './hostLinesExtra.js';

export const HOST_NAME = 'Prof. Pytajek';

// Poziomy humoru: 'polite' = tylko LINES, 'cheeky' = + CHEEKY_LINES, 'rude' = + RUDE_LINES
export const HUMOR_LEVELS = ['polite', 'cheeky', 'rude'];
const RUDE_SHARE = 0.55; // w trybie chamskim tyle losowań idzie w chamskie linijki (gdy pula je ma)

export const LINES = {
  // ---------------------------------------------------------------- lobby
  join: [
    'Witamy, {name}! Proszę się rozgościć, chipsy są wliczone w cenę.',
    '{name} na pokładzie! Średnia wiedzy w pokoju właśnie skoczyła o dwa punkty.',
    'O, {name}! Telefon naładowany? Bo wiedza wiedzą, a bateria swoje.',
    'Dołącza {name}. Reszta może zacząć się lekko denerwować.',
    '{name} w studiu! Proszę o gromkie brawa. Albo chociaż kiwnięcie głową.',
    'Kogo ja widzę! {name} we własnej osobie. Autografy po programie.',
    'Zgłasza się {name}! Wierzę w Ciebie. Z umiarem, ale wierzę.',
    '{name} dołącza do gry. Sprawdziłem w papierach: na razie zero punktów i sto procent potencjału.'
  ],
  lobbyIdle: [
    'Zeskanujcie kod, nie gryzie. Ja też nie, mam tylko muszkę.',
    'Czekamy na komplet. Przypominam: kanapa nie odpowiada za błędne odpowiedzi.',
    'Profesor Pytajek, do usług. Doktorat z ciekawostek, habilitacja z dygresji.',
    'Rozgrzewka: kto pamięta, gdzie leży pilot? No właśnie. Będzie ciężko.',
    'Mam przygotowane pytania, muszkę i szczyptę złośliwości. Brakuje tylko Was.',
    'Kto dołączy ostatni, ten zmywa. Żartuję. Chyba.',
    'Gotowi? Bo ja już gotuję się z ciekawości. Jak pierogi w niedzielę.'
  ],

  // ---------------------------------------------------------------- start
  start: [
    'Panie i Panowie, zaczynamy! Telefony w dłoń, ambicje na stół!',
    'Startujemy! Przypominam: podpowiadanie sąsiadowi to też sport. Nielegalny.',
    'Witam w Pytajce! Ja pytam, Wy odpowiadacie, a kanapa ocenia.',
    'Uwaga, uwaga! Mamy śmiałków w liczbie {n}. Zobaczymy, ilu zostanie bohaterami.',
    'Zaczynamy! Wszelkie wymówki proszę składać na piśmie, po programie.',
    'Kamery! Światła! Mózgi! Jedziemy z tym koksem!'
  ],

  // ---------------------------------------------------------------- głosowanie
  voteStart: [
    'Runda {round}! Głosujcie mądrze, bo potem nie będzie na kogo zwalić.',
    'Demokracja w akcji! Wybierzcie kategorię, z której potem będziecie się tłumaczyć.',
    'Czas na głosowanie. Proszę nie przekupywać prowadzącego. Chyba że pączkiem.',
    'Wybierzcie kategorię, w której jesteście mocni. Albo taką, w której inni są słabsi.',
    'Runda {round}. Głosujemy! Każdy głos się liczy. Nawet ten kliknięty łokciem.',
    'Głosowanie otwarte! Strategia czy serce? Rozum chyba poszedł już zrobić herbatę.'
  ],
  voteIdle: [
    'Kto nie głosuje, ten nie ma prawa narzekać na kategorię!',
    'Widzę wahanie. Wybierzcie sercem. Rozum dziś ma wolne.',
    'Ach, demokracja. Piękna i nieprzewidywalna jak pogoda w kwietniu.',
    'Tylko bez koalicji za moimi plecami! Ja wszystko widzę.',
    'Szybciutko, kategorie same się nie wybiorą. Sprawdzałem.'
  ],
  voteResult: [
    '{category}! Lud przemówił. Lud nie zawsze ma rację, ale przemówił.',
    'Wybór pada na: {category}. Ciekawe, kto teraz żałuje swojego głosu.',
    '{category}? Odważnie! Szanuję. Trochę się boję, ale szanuję.',
    'Gramy: {category}. Widzę już kilka zaniepokojonych min.',
    'No to {category}. Mam tu pytania tak dobre, że sam bym chciał znać odpowiedzi.',
    '{category}, proszę bardzo! Kto głosował inaczej, niech teraz cierpi z godnością.'
  ],

  // kategorie – klucze jak w backendzie (CATEGORY_POOLS niżej mapuje klucze na pule)
  cat_motoryzacja: [
    'Motoryzacja! Zapnijcie pasy, lusterka ustawione, mózg na piątym biegu.',
    'Motoryzacja! Kto myśli, że ABS to zespół disco polo, ma mały problem.',
    'Silniki ryczą! Albo to czyjś brzuch. Tak czy siak: motoryzacja, jedziemy!',
    'Motoryzacja! Pytania bez kręconego licznika, słowo honoru.',
    'Kategoria dla tych, co na dźwięk diesla dostają gęsiej skórki. Brum, brum!',
    'Motoryzacja! Mam nadzieję, że nikt nie zostawił wiedzy na parkingu.'
  ],
  cat_technologia: [
    'Technologia! Wyłączcie i włączcie mózg ponownie. Zwykle pomaga.',
    'Technologia i Internet! Proszę nie googlować. Widzę Was. No dobra, nie widzę, ale wiem.',
    'Technologia! Pytania przeszły aktualizację. Wy chyba jeszcze nie.',
    'Kategoria dla tych, co mają w domu więcej kabli niż skarpetek.',
    'Technologia! Kto teraz pomyśli o chmurze, niech nie patrzy w okno.'
  ],
  cat_prl: [
    'PRL! Kto pamięta kolejki, ten wie, że na dobrą odpowiedź też trzeba poczekać.',
    'PRL i lata 90.! Przewińcie kasetę ołówkiem i jedziemy.',
    'Ach, PRL! Pytania na kartki, odpowiedzi spod lady.',
    'Lata 90.! Modem piszczy, pager brzęczy, a my gramy.',
    'PRL! Nostalgia na pełnej, czajnik z gwizdkiem już się grzeje.'
  ],
  cat_kuchnia: [
    'Kuchnia! Tylko proszę nie odpowiadać z pełną buzią.',
    'Kuchnia i jedzenie! Kto dziś jadł pierogi, ten ma przewagę. Naukowo udowodnione. Przeze mnie.',
    'Kuchnia! Pytania podane na ciepło, odpowiedzi doprawione stresem.',
    'Smaczna kategoria! Kto zgłodnieje, lodówka jest gdzieś obok. Chyba.',
    'Kuchnia! Oby nikt nie przypalił tej rundy.'
  ],
  cat_sport: [
    'Sport! Rozgrzewka kciuków, rozciąganie palca wskazującego, start!',
    'Sport! Tu nie ma VAR-u, decyzja sędziego jest ostateczna. Sędzia to ja.',
    'Kategoria sportowa! Kanapowi trenerzy, Wasz czas nadszedł.',
    'Sport! Kto ogląda mecze tylko dla przekąsek, będzie miał pod górkę.',
    'Sport! Liczy się udział. Ale punkty liczą się bardziej.'
  ],
  cat_historia: [
    'Historia! Daty, bitwy i królowie. Ściąga z podstawówki by się przydała, co?',
    'Historia! Kto nie zna przeszłości, ten zaraz straci punkty.',
    'Historia! Przenosimy się w czasie. Bez wehikułu, za to z Pytajkiem.',
    'Historia! Spokojnie, nie zapytam, co było wczoraj na obiad. Tylko o Grunwald.',
    'Historia! Odkurzcie zakamarki pamięci. Tam, za wspomnieniem z wycieczki szkolnej.'
  ],
  cat_geografia: [
    'Geografia! Kto myli Austrię z Australią, niech się teraz skupi podwójnie.',
    'Geografia! Atlasy schowane, nawigacja wyłączona, kompas w sercu.',
    'Geografia! Świat jest duży, a pytania jeszcze większe.',
    'Geografia! Oby nikt się nie zgubił. Zwłaszcza w odpowiedziach.',
    'Geografia! Proszę nie kręcić globusem. To nie koło fortuny.'
  ],
  cat_kosmos: [
    'Kosmos! Houston, mamy pytania.',
    'Kosmos i astronomia! Odpowiedzi są gdzieś tam. Bardzo, bardzo daleko.',
    'Kosmos! Strzelajcie śmiało. W kosmosie nikt nie usłyszy, że to był strzał.',
    'Kosmos! Grawitacja punktów działa tylko na tych, co trafiają.',
    'Kosmos! Proszę zachować spokój. I tlen.'
  ],
  cat_zwierzeta: [
    'Zwierzęta! Domowy kot nie liczy się jako ekspert. Pies może.',
    'Zwierzęta i przyroda! Kto zna jeża tylko z naleśników, ma problem.',
    'Zwierzęta! Będzie dziko. Ale kulturalnie.',
    'Przyroda! Pytania z wolnego wybiegu, bez sztucznych dodatków.',
    'Zwierzęta! Proszę nie naśladować odgłosów. Dobra, jedno „muuu” wolno.'
  ],
  cat_muzyka: [
    'Muzyka! Proszę nie nucić odpowiedzi na głos. Sąsiad podsłuchuje.',
    'Muzyka! Oby zagrało czysto. Bez fałszu.',
    'Muzyka! W tej rundzie śpiewanie pod prysznicem nie daje punktów.',
    'Kategoria muzyczna! Kto zna tylko refreny, niech się trzyma mocno.',
    'Muzyka! Raz, dwa, trzy, próba mikrofonu. Wasza próba też.'
  ],
  cat_film: [
    'Film i seriale! Wreszcie przydadzą się te tysiące godzin przed ekranem.',
    'Film! Proszę nie spoilerować odpowiedzi. Zwłaszcza tych dobrych.',
    'Film i seriale! Popcorn w gotowości. Akcja!',
    'Film! Kto oglądał tylko zwiastuny, będzie zgadywać całe zakończenie.',
    'Kategoria filmowa! Statuetka za najlepszą odpowiedź już czeka.'
  ],
  cat_logika: [
    'Matematyka i zagadki! Kalkulatory odłożyć. Liczenie na palcach dozwolone.',
    'Matematyka! Spokojnie, nikt nie idzie do tablicy. Najwyżej do telewizora.',
    'Zagadki! Mózgi na najwyższe obroty. Słyszę już, jak skrzypią.',
    'Matematyka! Dwa plus dwa to cztery. Dalej będzie tylko trudniej.',
    'Logika! Kto rozwiązuje sudoku w autobusie, ma teraz swoje pięć minut.'
  ],
  cat_napoje: [
    'Napoje i drinki! Pytania wstrząśnięte, niezmieszane.',
    'Drinki! Na zdrowie! I na punkty!',
    'Napoje! Odpowiedzi proszę trzeźwe, nawet jeśli wieczór nie do końca.',
    'Napoje i drinki! Kategoria dla koneserów i dla tych, co tylko czytają etykiety.',
    'Napoje! Kto dziś przyniósł lemoniadę, ten jest moim faworytem.'
  ],
  cat_bajki: [
    'Bajki i dzieciństwo! Wreszcie kategoria, w której wszyscy jesteśmy ekspertami.',
    'Bajki! Dobranocka o tej porze? Czemu nie!',
    'Dzieciństwo! Proszę nie wzruszać się nad telefonem. Ekran zaparuje.',
    'Bajki! Kto oglądał w kapciach i z kakao, ma dziś przewagę.',
    'Bajki! Dawno, dawno temu ktoś wybrał tę kategorię. I to byliście Wy.'
  ],
  cat_jezyk: [
    'Język polski! Gżegżółka i chrząszcz już zacierają odnóża.',
    'Język polski! Ortografia boli, ale tylko trochę. Jak drzazga.',
    'Język polski! Kto mówi „poszłem”, minus dziesięć punktów. Żartuję. Minus pięć.',
    'Polszczyzna! Najpiękniejszy język świata. Zwłaszcza kiedy się go zna.',
    'Język polski! Przecinki gotowe, ogonki wyprostowane.'
  ],
  cat_pieniadze: [
    'Pieniądze! W końcu temat, o którym wszyscy myślą. Tylko nikt nie wie, gdzie one są.',
    'Kasa, kasa, kasa! Odpowiedzi warte więcej niż złoto. Ale mniej niż wypłata.',
    'Pieniądze i waluty! Nie przyjmuję łapówek. Chyba że w ciastkach.',
    'Finanse! Kto oszczędza na wiedzy, ten traci na punktach.',
    'Pieniądze! Inwestujcie mądrze. Najlepiej w poprawne odpowiedzi.'
  ],
  cat_mitologia: [
    'Mitologia! Zeus patrzy. Lepiej nie zawodzić bogów.',
    'Mitologia i legendy! Smok Wawelski pozdrawia i prosi o ciszę.',
    'Mitologia! Olimp ogląda transmisję. Bez wstydu, herosi!',
    'Legendy! Każda prawdziwa. Przynajmniej w połowie.',
    'Mitologia! Kto przyniósł nić Ariadny? Przyda się w tym labiryncie pytań.'
  ],

  // ---------------------------------------------------------------- pytania
  newQuestion: [
    'Pytanie numer {n}. Słuchajcie uważnie, czytajcie jeszcze uważniej.',
    'Następne pytanie! Proszę o skupienie. I o ciszę na kanapie.',
    'O, to pytanie lubię. Sam bym nie odpowiedział, ale lubię.',
    'Uwaga, pytanie! Odpowiedź jest prostsza, niż myślicie. Albo trudniejsza.',
    'Kolejne pytanie. Nie patrzcie tak na mnie, ja tu tylko prowadzę.',
    'Pytanie {n}. Kto wie, ten wie. Kto nie wie, ma dwadzieścia pięć procent szans.',
    'Proszę bardzo, świeżutkie pytanie. Prosto z pieca.'
  ],
  lastQuestion: [
    'Ostatnie pytanie gry! Teraz albo nigdy. Najlepiej teraz.',
    'Wielki finał! Ostatnie pytanie. Proszę nie mdleć.',
    'To już ostatnie pytanie! Wszystko może się jeszcze zmienić. Albo nic. Ale może!',
    'Ostatnia prosta! Kto ma asa w rękawie, niech go teraz wyciąga.',
    'Ostatnie pytanie. Czuję zapach zwycięstwa. Albo to popcorn.'
  ],
  questionIdle: [
    'Hmm, ja bym zaznaczył… nie, nic nie powiem.',
    'Widzę, że myślicie. To dobry znak. Rzadki, ale dobry.',
    'Zaufajcie intuicji. Ewentualnie sąsiadowi.',
    'Pierwsza myśl jest najlepsza. Chyba że była głupia.',
    'Spokojnie, to tylko kilka sekund i cała Wasza reputacja.',
    'Proszę nie podglądać cudzych telefonów. Ja widzę wszystko. No, prawie.'
  ],
  hurry: [
    'Pięć sekund! Tik-tak, tik-tak!',
    'Szybciutko! Czas ucieka, a ja się starzeję.',
    'No, no, no! Zegar nie czeka na nikogo!',
    'Hop, hop! Kto jeszcze myśli, niech myśli szybciej!',
    'Ostatnie sekundy! Strzelajcie, najwyżej trafi się szczęście.',
    'Halo! Telefony same nie odpowiedzą! Sprawdzałem.'
  ],
  hurryName: [
    '{name}, czekamy! Cała kanapa czeka!',
    'Halo, {name}! Tu studio, odbiór!',
    '{name} jeszcze się zastanawia. Szanuję. Ale zegar nie szanuje.',
    '{name}, kliknij cokolwiek! Nawet zła odpowiedź to jakaś odpowiedź!',
    'Czekamy tylko na: {name}. Bez presji. Ogromna presja.'
  ],
  allFast: [
    'Wszyscy już odpowiedzieli? Ale tempo! Ktoś tu wypił trzy kawy.',
    'Komplet odpowiedzi w rekordowym czasie! Albo geniusze, albo hazardziści.',
    'Błyskawicznie! Nawet nie zdążyłem się podrapać po głowie.',
    'Szybcy jak wiewiórka po espresso!',
    'Wszyscy już? Pewnie wiedzieli. Albo strzelali z biodra.'
  ],

  // ---------------------------------------------------------------- ujawnienie
  noneCorrect: [
    'Nikt?! Zero trafień! Muszę zadzwonić do ministra edukacji.',
    'Ani jednej dobrej odpowiedzi. Pytanie wygrywa jeden do zera!',
    'Nikt nie trafia. Spokojnie, ja też bym nie wiedział. Dlatego to ja pytam.',
    'Cisza w studiu. Zero trafień. Słychać tylko świerszcze.',
    'Nikt! No to przynajmniej jesteście zgodni. Zgodnie obok.',
    'Ups. Zero trafień. Udawajmy, że tego pytania nie było.',
    'Zero punktów dla wszystkich. Sprawiedliwie jak w spółdzielni!'
  ],
  allCorrect: [
    'Wszyscy trafiają! Za łatwe? Obiecuję poprawę. Groźną poprawę.',
    'Komplet trafień! Kto Wam zdradził odpowiedź? Przyznać się!',
    'Sto procent! Zaraz poproszę producenta o trudniejsze pytania.',
    'Wszyscy dobrze! Wzruszyłem się. Aż mi muszka zawilgotniała.',
    'Komplet! Takiej drużyny nie powstydziłby się żaden teleturniej.'
  ],
  onlyOne: [
    'Tylko {name} zna odpowiedź! Reszta, proszę o oklaski.',
    'Jedno trafienie i należy do: {name}. Geniusz czy szczęście? Nie wnikam.',
    '{name} trafia solo! Reszta, notujcie.',
    'Brawo, {name}! Samotny wilk wiedzy!',
    'Tylko {name}! Reszta na pewno wiedziała, tylko kliknęła z rozpędu obok.',
    'Proszę Państwa, {name} jako jedyna osoba na sali wie, o co chodzi!'
  ],
  fastest: [
    '{name} w {time} s! Szybciej niż moje wymówki.',
    '{name} odpowiada w {time} s. Palec jak błyskawica!',
    'Najszybszy palec w studiu: {name}! Tylko {time} s!',
    '{name}: {time} s. Czy ktoś sprawdził, czy to nie robot?',
    'Rekord tempa: {name}! Ledwo przeczytałem pytanie, a tu już po wszystkim.',
    '{name} klika, zanim ja skończę czytać. {time} s, szacunek!'
  ],
  mixed: [
    'Trafień: {hits} na {total}. Mogło być gorzej. Mogło być lepiej. Było, jak było.',
    'Trafień: {hits}. Reszta, do powtórki!',
    'Gratulacje dla trafionych, wyrazy otuchy dla reszty.',
    'Część wie, część zgaduje, a ja wszystko widzę.',
    'Ta odpowiedź podzieliła studio. Jak ostatni kawałek pizzy.'
  ],
  leaderChange: [
    'Zmiana na prowadzeniu! {name} na szczycie!',
    'Zmiana na fotelu lidera! Prowadzi {name}, a {prev} już szuka wymówki.',
    'Przetasowanie! Teraz prowadzi {name}. {prev}, oddaj koronę!',
    '{name} na czele! Ależ zwrot akcji! Scenarzyści by tego nie wymyślili.',
    'Uwaga, nowy porządek świata: prowadzi {name}!',
    '{name} na pierwszym miejscu! {prev}, spokojnie, jeszcze nic straconego.'
  ],
  streak: [
    '{name}: seria {n} z rzędu! Ktoś tu się rozgrzał!',
    '{name} nie myli się od {n} pytań! Proszę sprawdzić, czy nie ma ściągi.',
    'Seria {n}! {name} jest w gazie!',
    '{name} trafia i trafia! {n} razy z rzędu! Ja już się boję.',
    'Ogień! {name} z serią {n}. Ktoś zadzwoni po straż?',
    '{name} – maszyna do punktów! {n} z rzędu!'
  ],
  missStreak: [
    '{name}, nic się nie dzieje! Szczęście lubi wracać. Czasem z opóźnieniem.',
    '{name} trzyma formę. Niestety tę nieprzewidywalną. Głowa do góry!',
    'Kolejne pudło: {name}. Ale styl, w jakim pudłuje – mistrzowski!',
    '{name}, to tylko rozgrzewka, prawda? Prawda?!',
    'Trzecie pudło z rzędu: {name}. Statystycznie zaraz musi być trafienie!',
    'Spokojnie, {name}! Wiedza jest jak autobus – zaraz przyjedzie.'
  ],

  // ---------------------------------------------------------------- runda / koniec
  roundEnd: [
    'Koniec rundy {round}! Prowadzi {leader}. {last}, jeszcze wszystko przed Tobą!',
    'Po rundzie {round} na szczycie: {leader}. Na końcu: {last}. Ale to pewnie taktyka.',
    'Runda {round} za nami! {leader} prowadzi, a {last} usypia czujność rywali.',
    '{leader} na czele! {last} zamyka stawkę, ale z klasą.',
    'Koniec rundy! {leader} odbiera gratulacje, {last} odbiera słowa otuchy.',
    'Tabela mówi jasno: rządzi {leader}. {last}, czas na wielki powrót!'
  ],
  roundEndSolo: [
    'Koniec rundy {round}! {leader} prowadzi. I zamyka stawkę. Wygodnie!',
    'Runda {round} za nami. {leader} na pierwszym miejscu. Konkurencja nie dojechała.',
    '{leader} wygrywa rundę! Co prawda bez rywali, ale zwycięstwo to zwycięstwo.',
    'Koniec rundy! {leader} kontra pytania. Na razie remis ze wskazaniem na pytania.',
    'Runda {round}: {leader} na szczycie tabeli. I na jej dnie. Filozoficzne.'
  ],
  finished: [
    'Koniec gry! Zwycięża {winner}! Brawa, fanfary, konfetti!',
    '{winner} wygrywa Pytajkę! Proszę o owację na stojąco. Albo na siedząco, jak kto woli.',
    'Mamy zwycięstwo! {winner} zgarnia całą chwałę, reszta zgarnia chipsy.',
    'Brawo, {winner}! Mistrzowski występ. Reszta: rewanż?',
    'I to by było na tyle! Zwycięża {winner}. Byliście wspaniali. Prawie wszyscy.',
    '{winner} na tronie! Od dziś wszystkie spory w domu rozstrzyga {winner}.'
  ],
  podium: [
    'Srebro: {second}, brąz: {third}. Wirtualna piątka dla całego podium!',
    'Na podium także {second} i {third}! Bez Was ten finał byłby nudny.',
    '{second} i {third} – podium to podium! Medale wyślę pocztą. Kiedyś.',
    'Brawa także dla: {second} i {third}! Tuż za plecami mistrza.',
    'Drugie miejsce: {second}, trzecie: {third}. Do mety zabrakło tak niewiele!'
  ],

  // ---------------------------------------------------------------- sabotaże
  // {name} = atakujący, {target} = ofiara
  sabAttack: [
    'Uwaga, sabotaż! {name} celuje w: {target}. Fair play właśnie wyszło z budynku.',
    '{name} kontra {target}! Tak się buduje przyjaźnie. Albo je kończy.',
    'Ojoj! {name} wyciąga kartę i patrzy prosto na: {target}.',
    '{target}, nie odwracaj się teraz. {name} ma coś dla Ciebie.',
    'Sabotaż w studiu! {name} twierdzi, że to z sympatii do: {target}.',
    'Proszę państwa, {name} gra nieczysto. I robi to z wdziękiem!',
    'Karta poszła w ruch! {target} właśnie dostaje prezent od: {name}. Bez kokardki.'
  ],
  sabType_fog: [
    'Mgła! {target} zobaczy pytanie jak przez szybę w łazience.',
    '{name} zamawia mgłę dla: {target}. Polecam przetrzeć ekran rękawem.',
    'Nad telefonem gracza {target} zbiera się mgła. Prognoza: widoczność kiepska, pretensje duże.',
    'Mgiełka od: {name}. {target}, tylko nie zgub się we własnym telefonie!'
  ],
  sabType_bubbles: [
    'Bąbelki! {target} najpierw robi pianę, potem odpowiada.',
    '{name} wysyła bąbelki do: {target}. Pyk, pyk, pyk – jak folia bąbelkowa w Wigilię.',
    '{target}, przebijaj bąbelki! Odpowiedzi czekają pod spodem. Cierpliwie. W przeciwieństwie do zegara.',
    'Kąpiel w bąbelkach dla: {target}. Ufundowano przez: {name}.'
  ],
  sabType_math: [
    'Szybka matma! {target} najpierw liczy, potem myśli. Albo odwrotnie.',
    '{name} zadaje pracę domową graczowi {target}. Tabliczka mnożenia na start!',
    '{target}, ile to siedem razy osiem? Pytam w imieniu: {name}.',
    'Kalkulator schowany? Szkoda. {target} liczy na palcach, a zegar tyka.'
  ],
  sabType_mash: [
    'Klikacz! {target} musi teraz stukać jak dzięcioł na kofeinie.',
    '{name} zamawia trening kciuka dla: {target}. Klik, klik, klik!',
    '{target}, klikaj, jakby od tego zależało życie! Bo zależą od tego punkty.',
    'Siłownia dla palca w wykonaniu: {target}. Trener personalny: {name}.'
  ],
  sabType_sequence: [
    'Kolejność! {target} musi poukładać cyferki. Jeden, dwa, trzy… a może trzy, dwa, jeden?',
    '{name} sprawdza, czy {target} umie liczyć po kolei. Bez pośpiechu. Żartuję, z pośpiechem!',
    'Zadanie dla gracza {target}: kliknąć po kolei. Proste? To samo mówiłem o składaniu mebli.',
    '{target} układa liczby, a {name} układa plan zwycięstwa. Podstępnie.'
  ],
  sabType_catch: [
    'Uciekinier! {target} goni przycisk jak kota po mieszkaniu.',
    '{name} wypuszcza uciekiniera na telefon gracza {target}. Łap go!',
    '{target}, przycisk ucieka! Zachodź go od lewej, on się tego nie spodziewa.',
    'Berek na ekranie! Gra {target}, a uciekiniera tresuje {name}.'
  ],
  sabRevenge: [
    'Zemsta! {name} oddaje cios graczowi {target}. Kto sieje wiatr, ten zbiera mgłę.',
    'O, rewanż! {target} zaczyna, {name} kończy. Albo dopiero zaczyna.',
    '{name} pamięta! {target} chyba liczy, że nikt nie zauważy. Wszystko widzę!',
    'Wendeta w studiu! {name} kontra {target}, runda rewanżowa.',
    'Karma przyszła szybciej niż kurier. {target}, to od: {name}.',
    'Oko za oko, karta za kartę! {name} wyrównuje rachunki z: {target}.'
  ],
  sabPiling: [
    '{target} znowu na celowniku! To już {n}. atak. Ktoś tu ma wielu fanów.',
    'Wszyscy na: {target}! Chyba ktoś za dobrze grał.',
    'Ile można? {target} zbiera sabotaże jak naklejki. Stan kolekcji: {n}.',
    'Koalicja przeciw: {target}! Proszę się nie przejmować, to oznaka szacunku.',
    '{target} pod ostrzałem! Licznik kart w jednego gracza: {n}. To już nie sabotaż, to fanklub.'
  ],
  sabSurvived: [
    '{target} trafia mimo sabotażu! Prawdziwy twardziel. Albo twardy telefon.',
    'Nie da się złamać! {target} przebija się przez sabotaż i trafia!',
    'Mimo wszystko poprawnie! {target}, szacun. {name} pewnie właśnie zgrzyta zębami.',
    'Sabotaż? Jaki sabotaż? {target} trafia, jakby nic się nie stało!',
    '{target} odpowiada dobrze mimo przeszkód. {name}, plan chyba nie wypalił!',
    'Brawo, {target}! Przeszkoda pokonana, odpowiedź trafiona, honor obroniony.'
  ],
  sabFailed: [
    'Sabotaż zadziałał… {target} pudłuje. {name} zaciera ręce.',
    '{target} nie trafia. Ale z taką przeszkodą to i ja bym się pogubił.',
    'Pudło! Pół winy na: {target}, pół na kartę od: {name}.',
    'No cóż, {target}, sabotaż zrobił swoje. Następnym razem to Ty rzucasz kartę!',
    '{name} może być z siebie dumny. Albo dumna. {target} niestety pudłuje.',
    'Plan wykonany! {target} błądzi we mgle… albo w bąbelkach. W każdym razie błądzi.'
  ],

  // ---------------------------------------------------------------- wtrącenia
  filler: [
    'Wiecie, że ja też nie znam połowy tych odpowiedzi? Ciii.',
    'Przypominam: picie wody poprawia myślenie. Picie innych rzeczy – niekoniecznie.',
    'Uwielbiam tę pracę. Płacą mi w ciekawostkach.',
    'Ciekawostka: ośmiornica ma trzy serca. A ja jedną muszkę. Za to jaką!',
    'Mój doktorat? Z teleturniejów. Promotor: pilot do telewizora.',
    'Ktoś tu bardzo głośno myśli. Słyszę zębatki.',
    'Proszę nie podpowiadać. Podpowiadać mogę tylko ja. I nie podpowiem.',
    'Gdyby punkty dawali za miny, mielibyśmy już zwycięzcę.',
    'Ciekawostka: ślimak potrafi spać nawet trzy lata. Niektórzy gracze chyba też.',
    'Patrzę na Was i myślę: ale zgrana ekipa. Zgrana jak orkiestra przed strojeniem.'
  ]
};

// klucz kategorii z backendu -> pula tekstów
export const CATEGORY_POOLS = {
  motoryzacja: 'cat_motoryzacja',
  technologia: 'cat_technologia',
  prl: 'cat_prl',
  kuchnia: 'cat_kuchnia',
  sport_polski: 'cat_sport',
  pilka_nozna: 'cat_sport',
  historia_polski: 'cat_historia',
  historia_swiata: 'cat_historia',
  geografia_polski: 'cat_geografia',
  geografia_swiata: 'cat_geografia',
  kosmos: 'cat_kosmos',
  zwierzeta: 'cat_zwierzeta',
  muzyka: 'cat_muzyka',
  film: 'cat_film',
  logika: 'cat_logika',
  napoje: 'cat_napoje',
  bajki: 'cat_bajki',
  jezyk: 'cat_jezyk',
  pieniadze: 'cat_pieniadze',
  mitologia: 'cat_mitologia'
};

// emocja postaci przy danej puli
export const POOL_EMOTION = {
  join: 'happy',
  lobbyIdle: 'idle',
  start: 'happy',
  voteStart: 'idle',
  voteIdle: 'think',
  voteResult: 'happy',
  newQuestion: 'idle',
  lastQuestion: 'shock',
  questionIdle: 'think',
  hurry: 'shock',
  hurryName: 'shock',
  allFast: 'happy',
  noneCorrect: 'sad',
  allCorrect: 'laugh',
  onlyOne: 'shock',
  fastest: 'happy',
  mixed: 'idle',
  leaderChange: 'shock',
  streak: 'happy',
  missStreak: 'sad',
  roundEnd: 'happy',
  roundEndSolo: 'laugh',
  finished: 'dance',
  podium: 'dance',
  filler: 'laugh',
  sabAttack: 'shock',
  sabType_fog: 'laugh',
  sabType_bubbles: 'laugh',
  sabType_math: 'think',
  sabType_mash: 'laugh',
  sabType_sequence: 'think',
  sabType_catch: 'laugh',
  sabRevenge: 'shock',
  sabPiling: 'shock',
  sabSurvived: 'happy',
  sabFailed: 'sad'
};

// typ sabotażu -> pula tekstów
export const SABOTAGE_POOLS = {
  fog: 'sabType_fog',
  bubbles: 'sabType_bubbles',
  math: 'sabType_math',
  mash: 'sabType_mash',
  sequence: 'sabType_sequence',
  catch: 'sabType_catch'
};

const NAME_KEYS = new Set(['name', 'prev', 'leader', 'last', 'winner', 'second', 'third', 'target']);

/** Long names make the bubble huge – keep the first word, then cut. */
export function shortName(raw) {
  const name = String(raw ?? '').trim();
  if (name.length <= 16) return name;
  const first = name.split(/\s+/)[0];
  const base = first.length >= 3 ? first : name;
  return base.length <= 16 ? base : `${base.slice(0, 15)}…`;
}

const lastUsed = new Map(); // pula+poziom -> ostatnio użyta linia

/** Linie puli dostępne na danym poziomie humoru. */
export function poolLines(pool, level = 'cheeky') {
  const base = LINES[pool] || [];
  if (level === 'polite') return base;
  return [...base, ...(CHEEKY_LINES[pool] || [])];
}

/**
 * Losuje linię z puli (bez powtórzenia tej samej linii pod rząd) i podstawia zmienne.
 * `level`: 'polite' | 'cheeky' (domyślnie) | 'rude'.
 */
export function pickLine(pool, vars = {}, level = 'cheeky') {
  const rude = level === 'rude' ? (RUDE_LINES[pool] || []) : [];
  const normal = poolLines(pool, level === 'rude' ? 'cheeky' : level);
  let list = normal;
  let key = `${pool}:${level}`;
  if (rude.length && (!normal.length || Math.random() < RUDE_SHARE)) {
    list = rude;
    key = `${pool}:rude-only`;
  }
  if (!list || list.length === 0) return null;
  const prev = lastUsed.get(key);
  let idx = Math.floor(Math.random() * list.length);
  if (list.length > 1 && list[idx] === prev) idx = (idx + 1 + Math.floor(Math.random() * (list.length - 1))) % list.length;
  lastUsed.set(key, list[idx]);
  return list[idx].replace(/\{(\w+)\}/g, (m, key) => {
    const v = vars[key];
    if (v === undefined || v === null) return '…';
    return NAME_KEYS.has(key) ? shortName(v) : String(v);
  });
}
