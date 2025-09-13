const Emojis = {
  ACTIVE_DEVELOPER: '<:active_developer_badge:1413765917304684656>',
  HOUSE_BRAVERY: '<:hypesquad_bravery:1413765944974508103>',
  HOUSE_BRILLIANCE: '<:hypesquad_brilliance:1413765956617900122>',
  HOUSE_BALANCE: '<:hypesquad_balance:1413765931330572400>',
  EARLY_VERIFIED_DEVELOPER:
    '<:early_verified_bot_developer:1413766026184622131>',
  PARTNERED_SERVER_OWNER: '<:partnered_server_owner:1413766013291597854>',
  HYPESQUAD_EVENTS: '<:hypesquad_events:1413765969158864956>',
  BUGHUNTER_LEVEL_1: '<:bug_hunter_lv1:1413766079502614548>',
  BUGHUNTER_LEVEL_2: '<:bug_hunter_lv2:1413766093365051423>',
  EARLY_SUPPORTER: '<:early_supporter:1413766039266656286>',
  VERIFIED_BOT: '<:verified:1413775694160203876>',
  QUEST: '<:quest:1413766133378580570>',
  DISCORD_EMPLOYEE: '<:staff:1413766118723813468>',
  NITRO: '<:nitro:1413766055167393872>',
  LEGACY_NAME: '<:legacy_name:1413765901748146276>',
  CERTIFIED_MODERATOR: '<:certified_moderator:1413765998313607210>',
  DISCORD_CERTIFIED_MODERATOR:
    '<:moderator_programs_alumni:1413765984229261416>',
  VERIFIED_DARK: '<:verified_dark:1413775708727148625>',
  ONLINE: '<:online:1413765808475345008>',
  IDLE: '<:idle:1413765833628319764>',
  DND: '<:dnd:1413765823348084878>',
  OFFLINE: '<:offline:1413765845527560233>',
  DOWNLOAD: '<:download:1413765650664394832>',
  OWNER: '<:owner:1413765670197395597>',
  NEW_MEMBER: '<:new_member:1413765687637180587>',
  SPAMMER: '<:spam_active:1413765705668497529>',
  LOADING: '<a:loading:1413765760484114574>',
  LOCK: '<:securityactions:1413765726422175754>',
  UNLOCK: '<:securityactions_cansel:1413765741538181160>',
  POLLS: '<:polls:1413765623284240454>',

  BOOST_LV1: '<:1levelboost:1413765773423280279>',
  BOOST_LV2: '<:2levelboost:1413765783502458941>',
  BOOST_LV3: '<:3levelboost:1413765797633065000>',
  BOOST_1: '<:1boost:1414052111100153906>',
  NONE_BOOST: '<:none_boost:1414051781880844409>',
  USER: '<:user:1414048103228510328>',
  BOT: '<:bot:1414048092000354425>',
  BAN: '<:ban:1414049464028758056>',
  EMOJI: '<:emoji:1414049477945331723>',
  CHANNEL: '<:channel:1414049509570515046>',
  ID: '<:id:1414049492562608147>',
  SETTING: '<:setting:1414049454436384850>',
  BIRTHDAY: '<:birthday:1414050526940762143>',

  TWITTER: '<:twitter:1415551185980756170>',
  SEARCH: '<:search:1415550439671468053>',
  GHOST: '<:ghost:1415550424534220912>',
  REPLY: '<:reply:1415550413704396940>',
  SUGGEST: '<:suggest:1415550400995659806>',
};

function getBadgeEmojis(flagsArray = []) {
  return flagsArray.map((flag) => Emojis[flag] || null).filter(Boolean);
}

function getServerEmoji(key, boostCount = null) {
  if (key === 'BOOST') {
    if (boostCount >= 14) return Emojis.BOOST_LV3;
    if (boostCount >= 6) return Emojis.BOOST_LV2;
    if (boostCount >= 2) return Emojis.BOOST_LV1;
    if (boostCount === 1) return Emojis.BOOST_1;
    if (boostCount === 0) return Emojis.NONE_BOOST;

    return null;
  }

  return Emojis[key] || null;
}

module.exports = { getBadgeEmojis, getServerEmoji };
