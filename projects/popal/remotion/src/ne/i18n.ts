// Язык ролика «Didn't Want To Anyway» / «Не очень-то и хотелось»: NeClip выставляет setLang() перед отрисовкой кадра.
export type Lang = 'en' | 'ru';
let LANG: Lang = 'en';
export const setLang = (l: Lang) => { LANG = l; };
export const lang = () => LANG;
const D: Record<string, [string, string]> = {
  sadie: ['SADIE SINK', 'СЭДИ СИНК'], onTv: ['on TV', 'в кино'], vini: ['VINÍCIUS JR.', 'ВИНИСИУС ЖУНИОР'], atHome: ['at home', 'дома'],
  diom: ['YAN DIOMANDE', 'ЯН ДИОМАНДЕ'], newSign: ['new signing', 'новичок клуба'], home: ['HOME', 'ХОЗЯЕВА'], away: ['AWAY', 'ГОСТИ'],
  subst: ["SUBSTITUTION · 71'", "ЗАМЕНА · 71'"], viniShort: ['VINÍCIUS JR.', 'ВИНИСИУС ЖУНИОР'],
  title1: ["Didn't want to", 'Не очень-то'], title2: ['anyway.', 'и хотелось.'], parody: ['Parody. All events are fictional.', 'Пародия. Все события вымышлены.'],
  earlier: ['EARLIER…', 'ЧУТЬ РАНЬШЕ…'], after: ['AFTER THE MATCH', 'ПОСЛЕ МАТЧА'],
  msg: ['Wanna see a real superhero? Bernabéu, Saturday.', 'Хочешь увидеть настоящего супергероя? «Бернабеу», суббота.'], reply: ['No, thanks.', 'Нет, спасибо.'],
  typing: ['typing…', 'печатает…'], active: ['Active now', 'в сети'], seen: ['Seen', 'Просмотрено'], message: ['Message…', 'Сообщение…'],
  b1: ['FOOTBALL', 'ФУТБОЛ'], b2: ['GOAL!', 'ГОЛ!'], b3: ['MATCHDAY', 'МАТЧ ДНЯ'], b4: ['ON AIR', 'В ЭФИРЕ'],
};
export const T = (k: keyof typeof D | string) => (D[k] ?? [k, k])[LANG === 'ru' ? 1 : 0];
