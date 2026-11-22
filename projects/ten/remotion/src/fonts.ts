import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';
loadFont({ family: 'Mont', url: staticFile('fonts/Montserrat-VF.ttf'), weight: '100 900' });
loadFont({ family: 'JBM', url: staticFile('fonts/JetBrainsMono-VF.ttf'), weight: '100 800' });
// заставка в духе Solo Leveling: острый антиквенный титр + узкий гротеск (Google Fonts, OFL)
loadFont({ family: 'CormSC', url: staticFile('fonts/CormorantSC-Bold.ttf'), weight: '700' });
loadFont({ family: 'Oswald', url: staticFile('fonts/Oswald-VF.ttf'), weight: '200 700' });
loadFont({ family: 'Russo', url: staticFile('fonts/RussoOne.ttf'), weight: '400' });
