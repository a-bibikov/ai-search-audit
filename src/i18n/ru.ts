import type { Messages } from "./en.ts";

/** Отчёт на русском. Тип Messages не даст пропустить строку: если в en.ts что-то добавили, здесь будет ошибка компиляции. */
export const ru: Messages = {
  report: {
    title: (site: string) => `Проверка для AI-поиска: ${site}`,
    summary: (o) =>
      `**${o.score}/100 (${o.grade})** · ошибок: ${o.errors} · предупреждений: ${o.warnings} · заметок: ${o.notes} · страниц: ${o.pages}`,
    clean: "Исправлять нечего: AI-поиск может прочитать, понять и процитировать эти страницы.",
    fix: "Как исправить",
    recommendation: "Рекомендация",
    more: (n: number) => `…и ещё ${n}`,
    checklist: "Чек-лист",
    legend: "✓ в порядке · ✖ ошибка · ⚠ предупреждение · ℹ заметка",
    count: (o) =>
      [o.errors && `ошибок: ${o.errors}`, o.warnings && `предупреждений: ${o.warnings}`, o.notes && `заметок: ${o.notes}`].filter(Boolean).join(", "),
    site: "сайт",
    footer: (pages: number, date: string) =>
      `Проверено страниц: ${pages}, ${date}. После каждого деплоя проверьте вручную: боевой CDN и защиту от ботов с настоящими AI-агентами (A-3), Google Search Console, Bing Webmaster Tools (поиск ChatGPT опирается на Bing), Яндекс Вебмастер.`,
    groups: {
      A: "Доступ для AI-агентов",
      B: "Текст без JavaScript",
      C: "Сущности и авторство",
      D: "Ответ в начале",
      E: "Машиночитаемые версии",
      F: "Свежесть",
      G: "Безопасность контента",
    },
  },

  rules: {
    "A-1": {
      title: "robots.txt пускает поисковых AI-агентов",
      fix: "Уберите Disallow для этих агентов (или добавьте `Allow: /` в их группу). Они загружают страницы, чтобы ответить на вопрос и сослаться на источник; боты обучения — отдельное решение (A-2).",
    },
    "A-2": {
      title: "Боты обучения следуют вашей политике",
      fix: "Решите, могут ли будущие модели учиться на сайте, и укажите это в robots.txt отдельной группой для каждого бота. Запрет для них не убирает сайт из AI-поиска (A-1).",
    },
    "A-3": {
      title: "Сервер отвечает AI-агентам так же, как браузеру",
      fix: "Проверьте CDN, WAF или защиту от ботов: эти агенты получают ошибку, проверку или другую страницу. Разрешите их по User-Agent или по подтверждённым диапазонам IP.",
    },
    "A-4": {
      title: "На публичных страницах нет noindex и noai",
      fix: 'Уберите `noindex`, `none`, `noai` из `<meta name="robots">` и заголовка `X-Robots-Tag` на страницах, которые должны цитироваться (на превью и staging их оставьте).',
    },
    "A-5": {
      title: "Лента объявлена в <head>",
      fix: 'Добавьте на страницы `<link rel="alternate" type="application/rss+xml" href="…">`, чтобы краулеры находили новое без угадывания адреса.',
    },
    "B-1": {
      title: "Текст есть в HTML, а не только в JavaScript",
      fix: "Рендерите контент на сервере (SSR или статическая генерация). Большинство AI-краулеров не выполняют JavaScript: чего нет в HTML, того для них не существует.",
    },
    "B-2": {
      title: "В машиночитаемых версиях нет невидимых символов внутри слов",
      fix: "Уберите U+2060, U+200B, U+FEFF и U+00AD из <title>, мета-тегов, JSON-LD, лент и llms.txt: «AI-⟨U+2060⟩native» со скрытым символом не совпадает с запросом «AI-native». На самой странице типограф может их оставлять, но где можно, используйте CSS `white-space: nowrap`.",
    },
    "B-3": {
      title: "Заголовки не склеивают слова",
      fix: 'Поставьте пробел между соседними элементами внутри заголовка (в JSX: `{" "}`). Стили показывают две строки, а краулер читает текстовые узлы подряд: «ИмяСлоган».',
    },
    "C-1": {
      title: "Автор или компания описаны как сущность",
      fix: "Добавьте на главную или страницу «О себе» JSON-LD Person (или Organization) с постоянным `@id` (например, https://example.com/#person), `name`, `url`, `sameAs` со ссылками на профили и `jobTitle` для человека.",
    },
    "C-2": {
      title: "Статьи ссылаются на автора через @id",
      fix: 'Укажите `author: { "@id": "https://example.com/#person" }` (name и url можно оставить) — тот же @id, что у Person на главной.',
    },
    "C-4": {
      title: "У статей полная разметка Article / BlogPosting",
      fix: "Заполните `headline`, `datePublished`, `author` (обязательно), а также `dateModified`, `image`, `inLanguage`.",
    },
    "C-6": {
      title: "У каждой страницы есть карточка ссылки: og:title, og:description, og:image",
      fix: "Добавьте og:image (1200×630) и og:title / og:description на каждую публичную страницу. По ним мессенджеры, соцсети и AI-ответы строят карточку ссылки.",
    },
    "C-7": {
      title: "Видимый FAQ размечен как FAQPage",
      fix: "Если страница действительно состоит из вопросов и ответов, добавьте JSON-LD FAQPage с теми же вопросами и ответами, что на странице.",
    },
    "D-2": {
      title: "Статьи отвечают в первых двух абзацах",
      fix: "Начинайте с ответа: что это, для кого, главный вывод — от 25 слов. AI-поиск чаще всего цитирует первые абзацы; вступление вроде «В этой статье мы расскажем…» тратит их впустую.",
    },
    "E-1": {
      title: "llms.txt есть и соответствует llmstxt.org",
      fix: "Отдавайте /llms.txt в Markdown: `# Название сайта`, строка `> краткое описание`, затем разделы `## …` со ссылками `- [Заголовок](url): пояснение` на ключевые страницы.",
    },
    "E-2": {
      title: "Ссылки в llms.txt работают и совпадают с sitemap",
      fix: "Исправьте или уберите битые ссылки; оставляйте только опубликованные страницы. Ссылка, которая есть в llms.txt, но не в sitemap.xml, — часто черновик или устаревший адрес.",
    },
    "E-3": {
      title: "У каждого языка свой llms.txt",
      fix: "Для многоязычного сайта отдавайте llms.txt на каждом языке (например, /llms.txt и /ru/llms.txt) и связывайте их ссылками друг на друга.",
    },
    "E-5": {
      title: "llms-full.txt содержит полный текст",
      fix: "Отдавайте /llms-full.txt с полным текстом ключевых страниц и статей, чтобы модель могла прочитать сайт за один запрос.",
    },
    "F-1": {
      title: "lastmod в sitemap совпадает с dateModified страницы",
      fix: "Берите lastmod из той же даты, что и dateModified в JSON-LD: расхождение сообщает краулерам об изменениях, которых не было, или скрывает настоящие обновления.",
    },
    "G-1": {
      title: "В контенте нет указаний, обращённых к AI",
      fix: "Уберите строки, которые говорят AI-системам, что сказать или сделать. AI-поиск считает их prompt injection и может отбросить страницу или меньше доверять сайту. Пасхалка для людей может жить в humans.txt или в консоли.",
    },
  },

  m: {
    none: "нет",
    blockedSite: (agent: string) => `${agent} закрыт на всём сайте`,
    blockedPages: (agent: string, n: number, total: number, example: string) => `${agent} закрыт на ${n} из ${total} страниц, например ${example}`,
    trainingBlockButAllowed: (list: string) => `Политика — запрещать, но разрешены: ${list}`,
    trainingAllowButBlocked: (list: string) => `Политика — разрешать, но запрещены: ${list}`,
    trainingStatus: (allowed: string, blocked: string) => `Боты обучения — разрешены: ${allowed}; запрещены: ${blocked}`,
    agentGets: (agent: string, what: string) => `${agent} получает ${what}`,
    agentSmallPage: (agent: string, size: number, normal: number) => `${agent} получает страницу вдвое меньше обычной (${size} против ${normal} байт): проверка от бота или заглушка?`,
    undeclaredFeed: (url: string) => `Лента есть по адресу ${url}, но ни одна страница не ссылается на неё в <head>`,
    fewWords: (words: number, article: boolean, min: number) => `слов в HTML без JavaScript: ${words} (для ${article ? "статьи" : "страницы"} нужно не меньше ${min})`,
    h1Typography: (q: string) => `H1 ${q} — допустимо, если это намеренная типографика: видимый текст сравнивается мягче`,
    feedInvisible: (n: number) => `невидимых символов в ленте: ${n}`,
    fileInvisible: (n: number) => `невидимых символов: ${n}`,
    h1Reads: (q: string) => `H1 читается как ${q}`,
    noEntity: "Ни на одной проверенной странице нет Person или Organization с name и url в JSON-LD",
    noId: (type: string, name: string) => `у ${type} «${name}» нет @id: статьи не могут сослаться на него как на одну сущность`,
    noSameAs: (type: string, name: string) => `у ${type} «${name}» нет sameAs (LinkedIn, GitHub…): модели не могут подтвердить, кто это`,
    noJobTitle: (name: string) => `у Person «${name}» нет jobTitle`,
    authorNoId: (name: string) => `у автора ${name} нет @id`,
    authorUnknownId: (id: string) => `@id автора ${id} не совпадает ни с одним Person или Organization на сайте`,
    articleMissing: (type: string, fields: string) => `в ${type} нет ${fields}`,
    noOg: (tags: string) => `нет ${tags}`,
    faqDetails: (n: number) => `элементов <details>: ${n}, FAQPage нет — проверьте вручную, FAQ ли это`,
    faqQuestions: (n: number) => `заголовков с «?» на конце: ${n}, FAQPage нет — проверьте вручную, FAQ ли это`,
    introFirst: (q: string) => `начинается со вступления, а не с ответа: ${q}`,
    noLongParagraph: "среди первых двух абзацев нет абзаца от 25 слов",
    notFound: (path: string) => `${path} не найден`,
    returnsHtml: "отдаёт HTML, а не Markdown",
    noH1: "не начинается с заголовка `# Название`",
    noSummary: "нет строки `> описание`",
    noSections: "нет разделов `## …`",
    noLinks: "нет ссылок",
    brokenLink: (status: string) => `указана в llms.txt, отвечает: ${status}`,
    nothing: "нет ответа",
    notInSitemap: "указана в llms.txt, но её нет в sitemap.xml",
    noOtherLlms: (n: number, langs: string) => `языков на сайте: ${n} (${langs}), а llms.txt не ссылается на другие llms.txt`,
    noArticleText: (missing: number, total: number, example: string) => `нет текста ${missing} из ${total} проверенных статей, например ${example}`,
    lastmodMismatch: (lastmod: string, modified: string) => `lastmod в sitemap ${lastmod}, dateModified ${modified}`,
    noLastmod: "нет lastmod в sitemap.xml",
  },
};
