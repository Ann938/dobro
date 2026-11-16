# Анкеты остальных животных приюта (кроме избранных из content.ts): фото с Wikimedia Commons + вымышленные имена и характеры.
# Вход: research/sel.json — [{"tag": "dq", "i": 12, "kind": "dog", "pos": "50% 40%"}, ...] (выбрано по контактным листам);
# кандидаты — research/cand2/<tag>.json. Выход: public/pets/p-NNN.jpg (640 px), src/pets.json, дописывает src/credits.json.
# python -I scripts/gen-pets.py
import json, os, re, html, io, random, time, urllib.request, urllib.error
from PIL import Image

UA = {"User-Agent": "DobroConcept/0.1 (portfolio prototype; python urllib)"}
random.seed(42)
sel = json.load(open("research/sel.json", encoding="utf8"))
cands = {}


def fetch(url):
    for k in range(6):
        try:
            time.sleep(0.6)
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90).read()
        except urllib.error.HTTPError as e:
            if e.code != 429:
                raise
            time.sleep(5 * (k + 1))
    raise RuntimeError(url)


DOG_M = "Бим Рекс Джек Арчи Чарли Ральф Тоша Пират Гром Лаки Марс Кекс Барни Оскар Филя Шарик Дружок Тиль Бакс Сэм Бруно Локи Боня Граф Тайсон Мишка Персей Буран Норд Юкон Амур Байкал Вольт Дик Жорик Зевс Кадет Лёва Макс Нюх Портос Рокки Самсон Фунтик Хаски Цезарь".split()
DOG_F = "Лайма Ника Белка Стрелка Найда Джесси Тайга Рыжуля Зоя Ася Молли Луна Грета Бусинка Вега Нора Юта Дина Альма Ветка Фрося Кнопка Плюша Ласка Дуна Сара Айра Буся Веста Дана Ева Жужа Илька Каштанка Лиса Мила Пенни Рина Тори Ульяна Хлоя Чара".split()
CAT_M = "Барсик Мурзик Васька Кузя Тимофей Персик Пушок Семён Маркиз Финик Пряник Оливер Кот-Бегемот Уголёк Дымок Лучик Мармелад Сёма Тоша Хвостик Граф Ричард Гоша Тишка Борис Вольдемар Егор Жорж Ластик Мася Нафаня Пломбир Рыжий Сметан Тимон Фантик Чижик Шустрик".split()
CAT_F = "Муся Мурка Соня Лиза Дуся Ириска Пуговка Ночка Сима Кира Багира Луша Тоня Ватрушка Шпрота Масяня Ласточка Пенка Варя Карамелька Белла Клёпа Кнопа Алиса Брусника Ветта Голубка Дымка Ежевика Зефирка Лапка Марта Нюша Пуша Рысь Тучка Фея Чернушка".split()
used = {"Ричи", "Тигра", "Корж", "Мотя", "Бублик", "Зефир", "Аврора", "Рыжик", "Домино", "Маркиза", "Шерлок", "Феня"}

DOG_A = ["Обожает долгие прогулки и палку, которую можно приносить", "Знает «сидеть» и «рядом», учит «лежать»", "Спит, свернувшись бубликом, и сопит",
         "Носит игрушки в зубах и хвастается каждой", "Первым встречает волонтёров у ворот", "Ходит на поводке ровно, как по линейке",
         "Тает, когда чешут за ухом", "Не пропускает ни одной лужи", "Улыбается во всю пасть", "Не лает зря, только по делу",
         "Ловит снежинки и мыльные пузыри", "Приносит тапки — правда, не всегда парные"]
CAT_A = ["Мурчит как маленький трактор", "Засыпает только на коленях", "Ловит фантики лучше всех в приюте", "Сидит на подоконнике и комментирует голубей",
         "Прибегает на звук открываемой банки", "Бодается лбом в ладонь, просит погладить", "Умеет открывать двери и шкафы",
         "Любит коробки больше дорогих игрушек", "Встречает у двери и провожает до кухни", "Охотится на солнечных зайчиков",
         "Спит в позе буквы «С»", "Моет лапы после каждого ужина"]
B = {
    "kids": ["Ладит с детьми — проверено волонтёрами.", "Детей любит и выдерживает любые игры."],
    "flat": ["Спокойно живёт в квартире.", "Подойдёт для квартиры."],
    "active": ["Ищет семью, где много гуляют.", "Ждёт активного хозяина и походов за город."],
    "shy": ["Первые дни стесняется — нужен терпеливый человек.", "Сначала присматривается, потом не отходит ни на шаг."],
    "senior": ["Ищет тихий дом, где никто никуда не торопится.", "Лучший компаньон для спокойной семьи."],
    "baby": ["Всему учится на лету.", "Ищет семью, с которой вырастет вместе."],
    "calm": ["Без лишнего шума ждёт свою семью.", "Подойдёт спокойной семье."],
}


def plural(n, one, few, many):
    n10, n100 = n % 10, n % 100
    return one if n10 == 1 and n100 != 11 else few if 2 <= n10 <= 4 and not 12 <= n100 <= 14 else many


def age_label(m):
    return f"{m} {plural(m, 'месяц', 'месяца', 'месяцев')}" if m < 12 else f"{m // 12} {plural(m // 12, 'год', 'года', 'лет')}"


def adj(word, f):
    # спокойный → спокойная, игривый → игривая
    return re.sub(r"(ый|ий|ой)$", "ая", word) if f else word


def name(kind, f):
    pool = {("dog", 0): DOG_M, ("dog", 1): DOG_F, ("cat", 0): CAT_M, ("cat", 1): CAT_F}[(kind, f)]
    left = [n for n in pool if n not in used]
    n = random.choice(left) if left else random.choice(pool) + " II"
    used.add(n)
    return n


os.makedirs("public/pets", exist_ok=True)
pets, credits = [], json.load(open("src/credits.json", encoding="utf8"))
credits = [c for c in credits if not c["id"].startswith("p-")]
for k, s in enumerate(sel):
    tag = s["tag"]
    cands.setdefault(tag, json.load(open(f"research/cand2/{tag}.json", encoding="utf8")))
    o = cands[tag][s["i"]]
    pid = f"p-{k:03d}"
    path = f"public/pets/{pid}.jpg"
    if not os.path.exists(path):
        im = Image.open(io.BytesIO(fetch(re.sub(r"/\d+px-", "/960px-", o["thumb"])))).convert("RGB")
        im.thumbnail((640, 800))
        im.save(path, quality=80, optimize=True, progressive=True)
    kind = s["kind"]
    f = random.random() < 0.5
    r = random.random()
    months = random.choice([3, 4, 5, 6, 8, 10]) if r < 0.15 else random.randint(1, 7) * 12 if r < 0.8 else random.randint(8, 13) * 12
    senior, baby = months > 84, months < 12
    kids = random.random() < (0.75 if kind == "cat" else 0.55) and not s.get("nokids")
    flat = kind == "cat" or random.random() < 0.6
    active = kind == "dog" and not senior and random.random() < 0.45
    shy = not active and random.random() < 0.2
    tags = []
    if baby: tags.append("щенок" if kind == "dog" else "котёнок")
    if senior: tags.append(adj("пожилой", f))
    tags.append(adj("энергичный", f) if active else adj("застенчивый", f) if shy else adj(random.choice(["спокойный", "ласковый", "игривый", "весёлый", "умный"]), f))
    if kids: tags.append("ладит с детьми")
    a = random.choice(DOG_A if kind == "dog" else CAT_A)
    key = "senior" if senior else "baby" if baby else "active" if active else "shy" if shy else "kids" if kids else "flat" if flat else "calm"
    line = f"{a}. {random.choice(B[key])}"
    pets.append({"id": pid, "kind": kind, "name": name(kind, int(f)), "age": age_label(months), "months": months, "sex": "девочка" if f else "мальчик",
                 "tags": tags, "kids": kids, "flat": flat, "line": line, "pos": s.get("pos", "50% 40%")})
    artist = html.unescape(re.sub(r"<[^>]+>", "", o["artist"])).strip()
    credits.append({"id": pid, "author": artist, "license": o["lic"], "source": o["page"]})
    print(pid, kind, pets[-1]["name"], flush=True)

json.dump(pets, open("src/pets.json", "w", encoding="utf8"), ensure_ascii=False, indent=1)
json.dump(credits, open("src/credits.json", "w", encoding="utf8"), ensure_ascii=False, indent=1)
print("pets", len(pets))
