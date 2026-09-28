// KONG Tattoo Care — In-page translations
// Usage: setLang('de') / getLang() / initLang()
// Each page marks translatable elements with data-i18n="key"

const TRANSLATIONS = {
  en: {
    nav_home: 'Home', nav_shop: 'Shop', nav_about: 'About', nav_journal: 'Journal',
    nav_signin: 'Sign In', nav_shop_now: 'Shop Now',
    announce: 'Free Shipping · 90 Day Returns · Trusted by Artists',
    hero_h1: 'DEFEND YOUR INK<br><span>WITH KONG.</span>',
    hero_sub: 'Professional care for fresh ink, healed tattoos and everything in between.',
    hero_cta: 'Shop the System',
    hero_cta2: 'Find your collection',
    section_why: 'WHY KONG',
    section_why_sub: 'Built for the people who take their art seriously.',
    footer_shipping: 'Free Shipping',
    footer_returns: '90 Day Returns',
    footer_trusted: 'Trusted by Artists',
    // product page
    prod_add: 'Add to Bag',
    prod_explore: 'Explore product details ↓',
    prod_swipe: 'Swipe products',
    prod_use_kicker: 'Selected product guide',
    prod_use_title: 'USE IT<br><em>LIKE A PRO.</em>',
    aftercare_kicker: 'Complete your routine',
    aftercare_title: 'BUILD YOUR<br><em>AFTERCARE.</em>',
    aftercare_lead: 'Products that work perfectly with what you\'ve chosen.',
    aftercare_add: 'Add to bag',
    // shop all
    shop_title: 'THE SYSTEM',
    shop_sub: 'Every product, every stage.',
    shop_add: 'Add to Bag',
    shop_view: 'View Product',
  },
  de: {
    nav_home: 'Startseite', nav_shop: 'Shop', nav_about: 'Über uns', nav_journal: 'Journal',
    nav_signin: 'Anmelden', nav_shop_now: 'Jetzt shoppen',
    announce: 'Kostenloser Versand · 90 Tage Rückgabe · Von Künstlern vertraut',
    hero_h1: 'HALT ES<br><span>LEGENDÄR.</span>',
    hero_sub: 'Professionelle Pflege für frische Tinte, verheilte Tattoos und alles dazwischen.',
    hero_cta: 'Das System entdecken',
    hero_cta2: 'Deinen Typ finden',
    section_why: 'WARUM KONG',
    section_why_sub: 'Gebaut für Menschen, die ihre Kunst ernst nehmen.',
    footer_shipping: 'Kostenloser Versand',
    footer_returns: '90 Tage Rückgabe',
    footer_trusted: 'Von Künstlern vertraut',
    prod_add: 'In den Warenkorb',
    prod_explore: 'Produktdetails entdecken ↓',
    prod_swipe: 'Produkte wischen',
    prod_use_kicker: 'Ausgewählter Produktguide',
    prod_use_title: 'SO NUTZT DU ES<br><em>WIE EIN PROFI.</em>',
    aftercare_kicker: 'Deine Routine vervollständigen',
    aftercare_title: 'BAUE DEINE<br><em>NACHSORGE AUF.</em>',
    aftercare_lead: 'Produkte, die perfekt zu deiner Wahl passen.',
    aftercare_add: 'In den Warenkorb',
    shop_title: 'DAS SYSTEM',
    shop_sub: 'Jedes Produkt, jede Phase.',
    shop_add: 'In den Warenkorb',
    shop_view: 'Produkt ansehen',
  },
  pt: {
    nav_home: 'Início', nav_shop: 'Loja', nav_about: 'Sobre', nav_journal: 'Journal',
    nav_signin: 'Entrar', nav_shop_now: 'Comprar agora',
    announce: 'Envio gratuito · Devoluções em 90 dias · Confiado por artistas',
    hero_h1: 'MANTENHA<br><span>LENDÁRIO.</span>',
    hero_sub: 'Cuidado profissional para tinta fresca, tatuagens cicatrizadas e tudo mais.',
    hero_cta: 'Explorar o sistema',
    hero_cta2: 'Encontrar o seu tipo',
    section_why: 'POR QUE KONG',
    section_why_sub: 'Criado para quem leva a sua arte a sério.',
    prod_add: 'Adicionar ao carrinho', prod_explore: 'Ver detalhes do produto ↓',
    prod_swipe: 'Deslize os produtos', aftercare_kicker: 'Complete a sua rotina',
    aftercare_title: 'CONSTRUA O SEU<br><em>PÓS-CUIDADO.</em>',
    aftercare_lead: 'Produtos que funcionam perfeitamente com o que você escolheu.',
    aftercare_add: 'Adicionar', shop_title: 'O SISTEMA',
    shop_sub: 'Cada produto, cada etapa.', shop_add: 'Adicionar', shop_view: 'Ver Produto',
  },
  ru: {
    nav_home: 'Главная', nav_shop: 'Магазин', nav_about: 'О нас', nav_journal: 'Журнал',
    nav_signin: 'Войти', nav_shop_now: 'Купить сейчас',
    announce: 'Бесплатная доставка · Возврат 90 дней · Доверие художников',
    hero_h1: 'ДЕРЖИ ЭТО<br><span>ЛЕГЕНДАРНО.</span>',
    hero_sub: 'Профессиональный уход за свежими татуировками, заживленными и всем, что между.',
    hero_cta: 'Изучить систему',
    hero_cta2: 'Найти свой тип',
    section_why: 'ПОЧЕМУ KONG',
    section_why_sub: 'Создано для тех, кто серьёзно относится к своему искусству.',
    prod_add: 'В корзину', prod_explore: 'Подробнее ↓',
    prod_swipe: 'Листайте продукты', aftercare_kicker: 'Завершите свой уход',
    aftercare_title: 'СОЗДАЙТЕ СВОЙ<br><em>УХОД.</em>',
    aftercare_lead: 'Продукты, идеально подходящие к вашему выбору.',
    aftercare_add: 'В корзину', shop_title: 'СИСТЕМА',
    shop_sub: 'Каждый продукт, каждый этап.', shop_add: 'В корзину', shop_view: 'Смотреть',
  },
  nl: {
    nav_home: 'Home', nav_shop: 'Winkel', nav_about: 'Over ons', nav_journal: 'Journal',
    nav_signin: 'Inloggen', nav_shop_now: 'Nu winkelen',
    announce: 'Gratis verzending · 90 dagen retour · Vertrouwd door artiesten',
    hero_h1: 'HOUD HET<br><span>LEGENDARISCH.</span>',
    hero_sub: 'Professionele verzorging voor verse inkt, genezen tatoeages en alles daartussenin.',
    hero_cta: 'Ontdek het systeem', hero_cta2: 'Vind je type',
    prod_add: 'In winkelmand', aftercare_kicker: 'Voltooi je routine',
    aftercare_title: 'BOW JE<br><em>AFTERCARE.</em>', aftercare_add: 'Toevoegen',
    shop_title: 'HET SYSTEEM', shop_sub: 'Elk product, elke fase.',
    shop_add: 'In winkelmand', shop_view: 'Product bekijken',
  },
  sv: {
    nav_home: 'Hem', nav_shop: 'Butik', nav_about: 'Om oss', nav_journal: 'Journal',
    nav_signin: 'Logga in', nav_shop_now: 'Handla nu',
    announce: 'Gratis frakt · 90 dagars retur · Betrodd av konstnärer',
    hero_h1: 'HÅLL DET<br><span>LEGENDARISKT.</span>',
    hero_sub: 'Professionell vård för ny bläck, läkta tatueringar och allt däremellan.',
    hero_cta: 'Utforska systemet', hero_cta2: 'Hitta din typ',
    prod_add: 'Lägg i varukorg', aftercare_kicker: 'Slutför din rutin',
    aftercare_title: 'BYGG DIN<br><em>EFTERVÅRD.</em>', aftercare_add: 'Lägg till',
    shop_title: 'SYSTEMET', shop_sub: 'Varje produkt, varje steg.',
    shop_add: 'Lägg i varukorg', shop_view: 'Visa produkt',
  },
  no: {
    nav_home: 'Hjem', nav_shop: 'Butikk', nav_about: 'Om oss', nav_journal: 'Journal',
    nav_signin: 'Logg inn', nav_shop_now: 'Handle nå',
    announce: 'Gratis frakt · 90 dagers retur · Betrodd av artister',
    hero_h1: 'HOLD DET<br><span>LEGENDARISK.</span>',
    hero_sub: 'Profesjonell pleie for fersk blekk, helede tatoveringer og alt imellom.',
    hero_cta: 'Utforsk systemet', hero_cta2: 'Finn din type',
    prod_add: 'Legg i kurv', aftercare_kicker: 'Fullfør rutinen din',
    aftercare_title: 'BYGG DIN<br><em>ETTERPLEIE.</em>', aftercare_add: 'Legg til',
    shop_title: 'SYSTEMET', shop_sub: 'Hvert produkt, hvert trinn.',
    shop_add: 'Legg i kurv', shop_view: 'Se produkt',
  },
  cs: {
    nav_home: 'Domů', nav_shop: 'Obchod', nav_about: 'O nás', nav_journal: 'Časopis',
    nav_signin: 'Přihlásit', nav_shop_now: 'Nakupovat nyní',
    announce: 'Doprava zdarma · Vrácení do 90 dnů · Důvěřují umělci',
    hero_h1: 'UDRŽUJ TO<br><span>LEGENDÁRNÍ.</span>',
    hero_sub: 'Profesionální péče pro čerstvý inkoust, zhojená tetování a vše mezi tím.',
    hero_cta: 'Prozkoumat systém', hero_cta2: 'Najít svůj typ',
    prod_add: 'Přidat do košíku', aftercare_kicker: 'Dokončete svou rutinu',
    aftercare_title: 'SESTAVTE SVOU<br><em>PÉČI.</em>', aftercare_add: 'Přidat',
    shop_title: 'SYSTÉM', shop_sub: 'Každý produkt, každá fáze.',
    shop_add: 'Do košíku', shop_view: 'Zobrazit produkt',
  },
  hr: {
    nav_home: 'Početna', nav_shop: 'Trgovina', nav_about: 'O nama', nav_journal: 'Časopis',
    nav_signin: 'Prijava', nav_shop_now: 'Kupuj sada',
    announce: 'Besplatna dostava · Povrat 90 dana · Pouzdano od strane umjetnika',
    hero_h1: 'DRŽI GA<br><span>LEGENDARNIM.</span>',
    hero_sub: 'Profesionalna njega za svježi tintu, zacijeljene tetovaže i sve između.',
    hero_cta: 'Istraži sustav', hero_cta2: 'Pronađi svoj tip',
    prod_add: 'Dodaj u košaricu', aftercare_kicker: 'Upotpunite svoju rutinu',
    aftercare_title: 'IZGRADITE SVOJU<br><em>NJEGU.</em>', aftercare_add: 'Dodaj',
    shop_title: 'SUSTAV', shop_sub: 'Svaki proizvod, svaka faza.',
    shop_add: 'U košaricu', shop_view: 'Pogledaj proizvod',
  },
  bs: {
    nav_home: 'Početna', nav_shop: 'Prodavnica', nav_about: 'O nama', nav_journal: 'Časopis',
    nav_signin: 'Prijava', nav_shop_now: 'Kupuj sada',
    announce: 'Besplatna dostava · Povrat 90 dana · Pouzdano od strane umjetnika',
    hero_h1: 'DRŽI GA<br><span>LEGENDARNIM.</span>',
    hero_sub: 'Profesionalna njega za svježu tintu, zacijeljene tetovaže i sve između.',
    hero_cta: 'Istraži sistem', hero_cta2: 'Pronađi svoj tip',
    prod_add: 'Dodaj u korpu', aftercare_kicker: 'Upotpunite svoju rutinu',
    aftercare_title: 'IZGRADITE SVOJU<br><em>NJEGU.</em>', aftercare_add: 'Dodaj',
    shop_title: 'SISTEM', shop_sub: 'Svaki proizvod, svaka faza.',
    shop_add: 'U korpu', shop_view: 'Pogledaj proizvod',
  },
  kk: {
    nav_home: 'Басты бет', nav_shop: 'Дүкен', nav_about: 'Біз туралы', nav_journal: 'Журнал',
    nav_signin: 'Кіру', nav_shop_now: 'Қазір сатып алу',
    announce: 'Тегін жеткізу · 90 күн қайтару · Суретшілер сенеді',
    hero_h1: 'ОНЫ<br><span>АҢЫЗҒА АЙНАЛДЫР.</span>',
    hero_sub: 'Жаңа сия, жазылған тату және барлық арасындағысы үшін кәсіби күтім.',
    hero_cta: 'Жүйені зерттеу', hero_cta2: 'Түріңді тап',
    prod_add: 'Себетке қосу', aftercare_kicker: 'Тәртібіңізді аяқтаңыз',
    aftercare_title: 'КҮТІМІҢІЗДІ<br><em>ЖАСАҢЫЗ.</em>', aftercare_add: 'Қосу',
    shop_title: 'ЖҮЙЕ', shop_sub: 'Әр өнім, әр кезең.',
    shop_add: 'Себетке', shop_view: 'Өнімді қарау',
  },
  sr: {
    nav_home: 'Почетна', nav_shop: 'Продавница', nav_about: 'О нама', nav_journal: 'Часопис',
    nav_signin: 'Пријава', nav_shop_now: 'Купуј сада',
    announce: 'Бесплатна испорука · Повраћај 90 дана · Поуздано од уметника',
    hero_h1: 'ЗАДРЖИ ГА<br><span>ЛЕГЕНДАРНИМ.</span>',
    hero_sub: 'Profesionalna nega za svež mastilo, zarasle tetovaže i sve između.',
    hero_cta: 'Истражи систем', hero_cta2: 'Пронађи свој тип',
    prod_add: 'Додај у корпу', aftercare_kicker: 'Употпуните своју рутину',
    aftercare_title: 'ИЗГРАДИТЕ СВОЈУ<br><em>НЕГУ.</em>', aftercare_add: 'Додај',
    shop_title: 'СИСТЕМ', shop_sub: 'Сваки производ, свака фаза.',
    shop_add: 'У корпу', shop_view: 'Погледај производ',
  },
  fi: {
    nav_home: 'Koti', nav_shop: 'Kauppa', nav_about: 'Meistä', nav_journal: 'Lehti',
    nav_signin: 'Kirjaudu', nav_shop_now: 'Osta nyt',
    announce: 'Ilmainen toimitus · 90 päivän palautus · Taiteilijoiden luottama',
    hero_h1: 'PIDÄ SE<br><span>LEGENDAARISENA.</span>',
    hero_sub: 'Ammattimainen hoito tuoreelle musteelle, parantuneille tatuoinneille ja kaikelle siltä väliltä.',
    hero_cta: 'Tutustu järjestelmään', hero_cta2: 'Löydä tyyppisi',
    prod_add: 'Lisää ostoskoriin', aftercare_kicker: 'Täydennä rutiinisi',
    aftercare_title: 'RAKENNA OMASI<br><em>JÄLKIHOITO.</em>', aftercare_add: 'Lisää',
    shop_title: 'JÄRJESTELMÄ', shop_sub: 'Jokainen tuote, jokainen vaihe.',
    shop_add: 'Ostoskoriin', shop_view: 'Katso tuote',
  },
};

const LANG_FLAGS = {
  en: '🇬🇧', de: '🇩🇪', pt: '🇵🇹', ru: '🇷🇺', nl: '🇳🇱',
  sv: '🇸🇪', no: '🇳🇴', cs: '🇨🇿', hr: '🇭🇷', bs: '🇧🇦',
  kk: '🇰🇿', sr: '🇷🇸', fi: '🇫🇮'
};
const LANG_NAMES = {
  en: 'EN / GBP', de: 'Deutsch', pt: 'Português', ru: 'Русский', nl: 'Nederlands',
  sv: 'Svenska', no: 'Norsk', cs: 'Čeština', hr: 'Hrvatski', bs: 'Bosanski',
  kk: 'Қазақша', sr: 'Srpski', fi: 'Suomi'
};

function getLang() {
  return localStorage.getItem('kong-lang') || 'en';
}

function setLang(code) {
  if (!TRANSLATIONS[code]) return;
  localStorage.setItem('kong-lang', code);
  applyTranslations(code);
  // Update dropdown label
  const cur = document.getElementById('langCurrent');
  if (cur) cur.textContent = (LANG_FLAGS[code] || '') + ' ' + (LANG_NAMES[code] || code.toUpperCase());
  // Update active state
  document.querySelectorAll('.lang-opt').forEach(el => {
    el.classList.toggle('active', el.dataset.lang === code);
  });
  // Update html lang attribute
  document.documentElement.lang = code;
}

function applyTranslations(code) {
  const t = TRANSLATIONS[code] || TRANSLATIONS['en'];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) {
      if (el.dataset.i18nHtml) {
        el.innerHTML = t[key];
      } else {
        el.textContent = t[key];
      }
    }
  });
  // innerHTML keys
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    if (t[key] !== undefined) el.innerHTML = t[key];
  });
}

function initLang() {
  const lang = getLang();
  // Build dropdown items
  document.querySelectorAll('.lang-menu, #langMenu').forEach(menu => {
    menu.innerHTML = Object.keys(TRANSLATIONS).map(code =>
      `<li role="option" class="lang-opt${code===lang?' active':''}" data-lang="${code}">${LANG_FLAGS[code]||''} ${LANG_NAMES[code]||code}</li>`
    ).join('');
    menu.querySelectorAll('.lang-opt').forEach(opt => {
      opt.addEventListener('click', () => {
        setLang(opt.dataset.lang);
        const menu2 = opt.closest('.lang-menu, #langMenu');
        if (menu2) menu2.style.display = 'none';
        setTimeout(() => { if (menu2) menu2.style.display = ''; }, 200);
      });
    });
  });
  // Set initial label
  const cur = document.getElementById('langCurrent');
  if (cur) cur.textContent = (LANG_FLAGS[lang]||'') + ' ' + (LANG_NAMES[lang]||lang.toUpperCase());
  // Apply translations
  if (lang !== 'en') applyTranslations(lang);
}

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLang);
} else {
  initLang();
}
