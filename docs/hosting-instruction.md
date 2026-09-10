Инструкция по оформлению хостинга (10 сентября 2026)

Текст ниже — без разметки, готов к вставке в Google Docs.
Заголовки и выделения расставить средствами документа.
Русская часть — первая, румынская — ниже, содержание одинаковое.

---


ЧАСТЬ 1. РУССКАЯ ВЕРСИЯ


Добрый день!

Сайт и панель управления готовы. Осталось одно, чего мы не можем
сделать за вас: оформить сервер, на котором всё это будет работать.
Ниже — что именно завести, по шагам, и что понадобится от вас в день
запуска.

Времени это займёт минут двадцать. Стоимость — порядка 5–10 евро
в месяц.


1. ПОЧЕМУ НА ВАШЕ ИМЯ, А НЕ НА НАШЕ

Три причины, и все они не про удобство.

Вы оператор персональных данных. Пациенты будут загружать через сайт
анализы и медицинские документы, а данные о здоровье — особая
категория, к которой закон относится строже всего. В Молдове их
защищает Legea 195/2024, действующая с 23 августа 2026 и написанная
по образцу европейского GDPR. А для ваших пациентов из диаспоры,
живущих в ЕС, действует и сам GDPR — напрямую. По обоим законам
отвечает тот, кто указан владельцем, и это должны быть вы, а не
подрядчик.

Сервер обязан находиться в Европейском союзе. Сервер в ЕС закрывает
оба требования разом: и молдавский закон, и GDPR. Мы уже написали
об этом посетителям на странице «Confidențialitate» — обещание
должно быть правдой.

И практическая причина: аккаунт на ваше имя означает, что доступ
к сайту остаётся у вас при любом развитии отношений с нами. Вы
в любой момент можете отозвать наш доступ, и ничего не сломается.

Нас вы добавите в проект как сотрудника — как это сделать, в пункте 3.


2. ЧТО ЗАВЕСТИ, ПО ШАГАМ

Провайдер — Hetzner, немецкая компания. Мы выбрали её из-за цены,
надёжности и того, что дата-центры находятся в Германии и Финляндии,
то есть внутри ЕС.

2.1. Регистрация

Откройте console.hetzner.com и нажмите «Register».

Регистрируйте на своё имя и свою карту. Понадобится email, пароль
и данные карты — деньги списываются раз в месяц по факту.

Скорее всего, Hetzner попросит подтвердить личность: загрузить фото
паспорта или удостоверения. Это стандартная процедура для новых
аккаунтов, беспокоиться не о чем. Проверка занимает от часа до
суток.

2.2. Создайте проект

После входа вы увидите список проектов. Нажмите «+ New project»
и назовите его:

    oleseajalba

Название — просто ярлык, но нам будет проще, если оно совпадает.

2.3. Создайте сервер

Внутри проекта нажмите «Add Server» и выберите:

Location — Falkenstein или Nuremberg. Оба в Германии, разницы для
нас нет. Не выбирайте Ashburn или Singapore: это США и Азия, туда
медицинские данные вывозить нельзя.

Image — Ubuntu, версия 24.04.

Type — вкладка «Shared vCPU», процессор «Intel/AMD (x86)», тариф
CX23: 2 vCPU, 4 ГБ памяти, 40 ГБ диска. Около 5 евро в месяц
на момент написания этой инструкции.

Если тарифа с таким названием не окажется — Hetzner иногда обновляет
линейку, — берите самый дешёвый вариант с 4 ГБ памяти. Это
единственный параметр, который для нас важен.

Networking — оставьте включённой галочку «Public IPv4». Без неё сайт
не будет виден части посетителей.

SSH keys — пропустите, ничего добавлять не нужно. Ключ мы добавим
сами, когда получим доступ.

Backups — включите. Это добавит 20% к стоимости сервера, примерно
один евро в месяц. Hetzner будет сам делать снимки всего сервера,
и если что-то пойдёт не так на уровне системы, можно откатиться
на день назад целиком.

Это не то же самое, что наши собственные ночные копии базы данных
и файлов — они настроены отдельно и работают внутри сервера. Два
разных уровня защиты, и нужны оба.

Name — назовите сервер, например:

    oleseajalba-api

Нажмите «Create & Buy now».

2.4. Storage Box — место для второй копии

Отдельно закажите хранилище для резервных копий. В том же аккаунте
перейдите в раздел «Storage Boxes», нажмите «Add Storage Box»,
выберите тариф BX11 (1 ТБ, около 3,20 евро в месяц плюс НДС на момент
написания) и локацию Falkenstein.

Зачем вторая копия: резервная копия, которая лежит на том же сервере,
спасает от ошибки в программе, но не спасает от того, что сервер
целиком выйдет из строя или окажется недоступен. Копия в другом
месте — это страховка именно от этого случая. Место в ЕС, как и
всё остальное.


3. КАК ДАТЬ НАМ ДОСТУП

В проекте Hetzner откройте «Security», вкладку «Members», нажмите
«Invite member».

Email:

    granici.design@gmail.com

Role: Admin.

Пароль от вашего аккаунта нам не нужен, и присылать его не надо
никому и никогда — ни нам, ни поддержке Hetzner. Приглашение даёт
ровно тот доступ, который нужен для работы, и вы можете отозвать
его в один клик в том же разделе.


4. ЧТО ПОНАДОБИТСЯ ОТ ВАС В ТОТ ЖЕ ДЕНЬ

Чтобы мы закончили за один день, приготовьте, пожалуйста, три вещи.

4.1. Домен oleseajalba.md

Подтвердите, что домен оформлен на вас, и напишите, где вы его
покупали — у какого регистратора.

Нам нужно будет добавить несколько технических записей: две для
сервера (панель управления и серверная часть) и две для самого сайта.
Либо дайте нам доступ к панели регистратора, либо мы пришлём точный
список записей, и вы внесёте их сами — это пять строк, копированием.
Как вам удобнее.

4.2. Адрес электронной почты для сертификатов

Сайт работает по защищённому соединению, сертификат для него
выпускается бесплатно и продлевается автоматически. На указанный
адрес приходят только предупреждения, если что-то с продлением
пошло не так. Подойдёт ваш обычный gmail.

4.3. IP-адрес сервера — для банка

После создания сервера у него появится постоянный IP-адрес. Его
нужно будет сообщить в maib, в личный кабинет для приёма платежей:
банк принимает запросы только с известных ему адресов. Мы напомним
об этом и подскажем, куда его вписать, — просто держите в голове,
что такой шаг будет.


5. ЧТО БУДЕТ ДАЛЬШЕ

Как только приглашение придёт, мы разворачиваем всё за один рабочий
день.

После этого вы получите от нас ссылку на панель управления:

    admin.oleseajalba.md

и временный пароль. При первом входе система сама попросит его
сменить — придумайте свой, длинный. Тут же она предложит включить
двухфакторную защиту: это код из приложения на телефоне вдобавок
к паролю. Мы очень просим её включить. В панели видны данные
пациентов, и одного пароля для такого мало.

Дальше мы вместе пройдём остальное: график работы, тексты, оплату.


6. ЧЕГО ДЕЛАТЬ НЕ НУЖНО

Не устанавливайте на сервер ничего самостоятельно и не заходите
в него через консоль Hetzner. Он пустой до нашей настройки, и любое
изменение придётся распутывать.

Не меняйте тариф и не удаляйте сервер или проект — даже если
покажется, что что-то лишнее. Напишите нам, мы посмотрим.

Не отменяйте включённые Backups: они стоят около евро и однажды
могут спасти всё.

Если Hetzner попросит подтвердить личность — это нормально,
см. пункт 2.1.

Если придёт письмо, которого вы не ждали, или что-то покажется
странным, перешлите нам, прежде чем что-то нажимать.


Спасибо! Если на каком-то шаге что-то пойдёт не так — напишите,
разберёмся вместе.


---


PARTEA 2. VERSIUNEA ÎN ROMÂNĂ


Bună ziua!

Site-ul și panoul de administrare sunt gata. A mai rămas un singur
lucru pe care nu îl putem face în locul dumneavoastră: să înregistrăm
serverul pe care va funcționa totul. Mai jos găsiți pașii exacți și
ce ne va trebui de la dumneavoastră în ziua lansării.

Vă va lua aproximativ douăzeci de minute. Costul este de ordinul
a 5–10 euro pe lună.


1. DE CE PE NUMELE DUMNEAVOASTRĂ, NU PE AL NOSTRU

Trei motive, și niciunul nu ține de comoditate.

Dumneavoastră sunteți operatorul de date cu caracter personal.
Pacienții vor încărca prin site analize și documente medicale, iar
datele despre sănătate sunt o categorie specială, față de care legea
este cea mai exigentă. În Moldova ele sunt protejate de Legea
195/2024, în vigoare din 23 august 2026 și scrisă după modelul GDPR
european. Iar pentru pacienții dumneavoastră din diasporă, care
locuiesc în UE, se aplică direct și GDPR-ul. Conform ambelor legi,
răspunzător este cel înregistrat ca titular, iar acesta trebuie să
fiți dumneavoastră, nu un prestator.

Serverul trebuie să se afle în Uniunea Europeană. Un server în UE
acoperă ambele cerințe deodată: și legea din Moldova, și GDPR.
Vizitatorilor le-am scris deja acest lucru pe pagina
„Confidențialitate” — promisiunea trebuie să fie adevărată.

Și un motiv practic: un cont pe numele dumneavoastră înseamnă că
accesul la site rămâne al dumneavoastră, indiferent cum evoluează
colaborarea cu noi. Ne puteți retrage accesul oricând, fără ca ceva
să se strice.

Pe noi ne veți adăuga în proiect ca membru — cum se face, la punctul 3.


2. CE TREBUIE ÎNREGISTRAT, PAS CU PAS

Furnizorul este Hetzner, o companie germană. Am ales-o pentru preț,
fiabilitate și pentru că centrele de date sunt în Germania și
Finlanda, adică în interiorul UE.

2.1. Înregistrarea

Deschideți console.hetzner.com și apăsați „Register”.

Înregistrați-vă pe numele dumneavoastră și cu cardul dumneavoastră.
Vă vor trebui un email, o parolă și datele cardului — suma se reține
o dată pe lună, pentru consumul real.

Cel mai probabil Hetzner vă va cere să vă confirmați identitatea:
o fotografie a pașaportului sau a buletinului. Este o procedură
standard pentru conturile noi, nu este motiv de îngrijorare.
Verificarea durează între o oră și o zi.

2.2. Creați proiectul

După autentificare veți vedea lista de proiecte. Apăsați
„+ New project” și denumiți-l:

    oleseajalba

Denumirea este doar o etichetă, dar ne este mai simplu dacă
se potrivește.

2.3. Creați serverul

În interiorul proiectului apăsați „Add Server” și alegeți:

Location — Falkenstein sau Nuremberg. Ambele sunt în Germania, pentru
noi nu există diferență. Nu alegeți Ashburn sau Singapore: acelea sunt
în SUA și în Asia, iar datele medicale nu au voie să ajungă acolo.

Image — Ubuntu, versiunea 24.04.

Type — fila „Shared vCPU”, procesor „Intel/AMD (x86)”, planul CX23:
2 vCPU, 4 GB memorie, 40 GB disc. În jur de 5 euro pe lună la momentul
scrierii acestei instrucțiuni.

Dacă nu găsiți un plan cu acest nume — Hetzner își mai actualizează
gama —, luați varianta cea mai ieftină cu 4 GB memorie. Acesta este
singurul parametru care contează pentru noi.

Networking — lăsați bifată opțiunea „Public IPv4”. Fără ea, o parte
dintre vizitatori nu vor putea deschide site-ul.

SSH keys — săriți peste, nu trebuie adăugat nimic. Cheia o adăugăm
noi, după ce primim accesul.

Backups — activați. Adaugă 20% la costul serverului, aproximativ un
euro pe lună. Hetzner va face singur copii ale întregului server, iar
dacă ceva se strică la nivel de sistem, se poate reveni cu o zi în
urmă, în întregime.

Nu este același lucru cu copiile noastre de noapte ale bazei de date
și ale fișierelor — acelea sunt configurate separat și rulează în
interiorul serverului. Sunt două niveluri diferite de protecție și
avem nevoie de amândouă.

Name — denumiți serverul, de exemplu:

    oleseajalba-api

Apăsați „Create & Buy now”.

2.4. Storage Box — spațiul pentru a doua copie

Comandați separat un spațiu de stocare pentru copiile de siguranță.
În același cont mergeți la secțiunea „Storage Boxes”, apăsați
„Add Storage Box”, alegeți planul BX11 (1 TB, aproximativ 3,20 euro
pe lună plus TVA la momentul scrierii) și locația Falkenstein.

De ce a doua copie: o copie de siguranță care stă pe același server
vă salvează de o eroare în program, dar nu vă salvează dacă serverul
cedează în întregime sau devine inaccesibil. O copie în alt loc este
asigurarea exact pentru acest caz. Locul este tot în UE, ca restul.


3. CUM NE DAȚI ACCES

În proiectul Hetzner deschideți „Security”, fila „Members”, apăsați
„Invite member”.

Email:

    granici.design@gmail.com

Role: Admin.

Parola contului dumneavoastră nu ne trebuie și nu trebuie trimisă
nimănui, niciodată — nici nouă, nici suportului Hetzner. Invitația dă
exact accesul necesar pentru lucru, iar dumneavoastră îl puteți retrage
dintr-un clic, din aceeași secțiune.


4. CE NE VA TREBUI DE LA DUMNEAVOASTRĂ ÎN ACEEAȘI ZI

Ca să terminăm într-o singură zi, vă rugăm să pregătiți trei lucruri.

4.1. Domeniul oleseajalba.md

Confirmați că domeniul este înregistrat pe numele dumneavoastră și
scrieți-ne de unde l-ați cumpărat — de la ce registrar.

Va trebui să adăugăm câteva înregistrări tehnice: două pentru server
(panoul de administrare și partea de server) și două pentru site-ul
propriu-zis. Fie ne dați acces la panoul registrarului, fie vă trimitem
lista exactă și le introduceți dumneavoastră — sunt cinci rânduri, prin
copiere. Cum vă este mai comod.

4.2. O adresă de email pentru certificate

Site-ul funcționează pe o conexiune securizată, iar certificatul pentru
ea se emite gratuit și se reînnoiește automat. Pe adresa indicată vin
doar avertismente, dacă reînnoirea nu a reușit. Este suficient gmail-ul
dumneavoastră obișnuit.

4.3. Adresa IP a serverului — pentru bancă

După crearea serverului, acesta va primi o adresă IP permanentă. Va
trebui comunicată către maib, în contul pentru încasarea plăților:
banca acceptă cereri doar de la adrese pe care le cunoaște. Vă vom
reaminti și vă vom arăta unde se introduce — rețineți doar că va exista
și acest pas.


5. CE URMEAZĂ

Imediat ce primim invitația, punem totul în funcțiune într-o zi
lucrătoare.

După aceea veți primi de la noi linkul către panoul de administrare:

    admin.oleseajalba.md

și o parolă temporară. La prima autentificare sistemul vă va cere
singur să o schimbați — alegeți una proprie, lungă. Tot atunci vă va
propune să activați protecția în doi pași: un cod dintr-o aplicație de
pe telefon, pe lângă parolă. Vă rugăm insistent să o activați. În panou
se văd datele pacienților, iar o singură parolă este prea puțin pentru
așa ceva.

Mai departe parcurgem împreună restul: programul de lucru, textele,
plățile.


6. CE NU TREBUIE FĂCUT

Nu instalați nimic pe server și nu intrați în el prin consola Hetzner.
Este gol până la configurarea noastră, iar orice modificare va trebui
apoi descâlcită.

Nu schimbați planul și nu ștergeți serverul sau proiectul — chiar dacă
vi se pare că este ceva în plus. Scrieți-ne, ne uităm noi.

Nu anulați opțiunea Backups: costă în jur de un euro și într-o zi
poate salva totul.

Dacă Hetzner vă cere confirmarea identității, este normal — vedeți
punctul 2.1.

Dacă primiți un email la care nu vă așteptați sau ceva vi se pare
ciudat, trimiteți-ni-l înainte de a apăsa ceva.


Mulțumim! Dacă la vreun pas ceva nu merge, scrieți-ne și rezolvăm
împreună.
