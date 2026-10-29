/**
 * Ikinyarwanda. Typed as `Dict`, so TypeScript reports any key that is missing.
 *
 * Note on `q` in examples: it is the text sent to the analysis engine, not shown
 * to visitors. Keep it in the language the question router understands.
 *
 * Legal pages (privacy, terms) should be reviewed by a native speaker and a lawyer.
 */
import type { Dict, DocPage, DocsPage, Example } from "./en";

export const rw: Dict = {
  common: {
    brand: "Mboni",
    brandHome: "Ahabanza ha Mboni",
    language: "Ururimi",
    startChatting: "Tangira kuganira",
    exploreData: "Reba amakuru",
    readDocs: "Soma imfashanyigisho",
    demoBadge: "Amakuru ya NISR",
    onThisPage: "Kuri uru rupapuro",
    lastUpdated: "Ivugururwa rya nyuma",
    nisrBuilt: "Ryakozwe ku bw’irushanwa rya NISR Big Data Hackathon 2026",
    nisrFull: "Ikigo cy’Igihugu cy’Ibarurishamibare cy’u Rwanda",
  },

  footer: {
    tagline:
      "Baza ibibazo ku ibarurishamibare ry’u Rwanda ubone ibishushanyo, imbonerahamwe n’amakarita ushobora kugenzura.",
    rights: "© 2026 Mboni",
    groups: [
      {
        title: "Igikoresho",
        links: [
          { href: "/docs", label: "Imfashanyigisho" },
          { href: "/methodology", label: "Uburyo dukoresha" },
          { href: "/ai-transparency", label: "Ubusobanuro kuri AI" },
        ],
      },
      {
        title: "Ibyerekeye twe",
        links: [
          { href: "/about", label: "Abo turi bo" },
          { href: "/contact", label: "Twandikire" },
        ],
      },
      {
        title: "Amategeko",
        links: [
          { href: "/privacy", label: "Politiki y’ubuzima bwite" },
          { href: "/terms", label: "Amabwiriza yo gukoresha" },
          { href: "/accessibility", label: "Kugerwaho n’abantu bose" },
        ],
      },
    ],
  },

  home: {
    metaTitle: "Baza ibibazo ku ibarurishamibare ry’u Rwanda",
    hero: {
      title: "Baza ibibazo ku ibarurishamibare ry’u Rwanda",
      lead: "Urashaka guhitamo umwuga, gutangiza ubucuruzi, cyangwa kwigira ku byahise by’u Rwanda? Baza mu magambo yoroshye. Mboni rikwereka ibyo imibare ivuga, hamwe n’aho amakuru yavuye ushobora kugenzura.",
      primary: "Tangira kuganira",
      secondary: "Reba amakuru",
      sceneLabel:
        "Igishushanyo cy’imisozi y’icyatsi y’u Rwanda, ibirunga n’imigano mu rukerera",
    },
    paths: {
      title: "Icyo wakoresha Mboni",
      lead: "Hitamo uko ubayeho kurusha ibindi. Buri cyose gifungura umwanya urimo ibishushanyo, imbonerahamwe n’amakarita.",
      tryLabel: "Gerageza iki kibazo",
      items: [
        {
          key: "career",
          title: "Hitamo umwuga cyangwa amasomo",
          body: "Gereranya amasomo ukoresheje imibare y’abiyandikisha, abarangiza, abakorera akazi n’imishahara, ubundi urebe ubumenyi bujyanye n’ubwoko bw’imirimo.",
          hint: "Rikwereka ibimenyetso n’ibyo wunguka cyangwa ukwiye kwitondera. Ntirikwizeza akazi kandi ntirifata icyemezo mu mwanya wawe.",
          examples: [
            {
              label:
                "Ni ayahe masomo atuma abarangije imibare ikoreshwa babona akazi?",
              q: "Which study programme is best for an applied mathematics graduate?",
            },
            {
              label:
                "Imirimo yahindutse ite mu nzego zitandukanye uko imyaka yagiye ihita?",
              q: "Show employment trends by sector",
            },
            {
              label: "Ni he ubushomeri bw’urubyiruko buri hejuru cyane?",
              q: "Which districts have the highest youth NEET rate?",
            },
          ] as Example[],
        },
        {
          key: "business",
          title: "Tangiza cyangwa ongera ubucuruzi",
          body: "Reba umubare w’ibigo by’ubucuruzi mu nzego no mu turere, uko ubukungu bwo mu gace buhinduka, n’uko abaturage n’ingo bimeze.",
          hint: "Umubare w’ubucuruzi gusa ntiwemeza ko ahantu hazagenda neza. Reba n’abakiriya n’ibiciro.",
          examples: [
            {
              label: "Erekana ibigo by’ubucuruzi ukurikije urwego n’akarere",
              q: "Show establishments by sector and district",
            },
            {
              label: "Ni utuhe turere dufite ubukene buri hejuru?",
              q: "Which districts have the highest poverty rate?",
            },
          ] as Example[],
        },
        {
          key: "farming",
          title: "Teganya ubuhinzi n’ibiribwa",
          body: "Gereranya umusaruro w’ibihingwa mu turere no mu bihembwe, ubirebane n’ibipimo by’ibiribwa.",
          hint: "Umusaruro w’ahahise werekana uko byagenze, ntuvuga ibizaba mu murima wawe.",
          examples: [
            {
              label: "Ni ibihe bihingwa byeze cyane mu turere?",
              q: "Which crops have the highest yield by district?",
            },
          ] as Example[],
        },
        {
          key: "past",
          title: "Wigire ku mateka y’u Rwanda",
          body: "Kurikirana ikimenyetso icyo ari cyo cyose uko imyaka ihita, gereranya uturere, kandi urebe aho amakuru adahagije.",
          hint: "Ibintu bibiri byiyongera icyarimwe ntibyemeza ko kimwe cyateye ikindi.",
          examples: [
            {
              label: "Erekana uko abaturage biyongereye uko imyaka ihita",
              q: "Show population trend over the years",
            },
            {
              label: "Gereranya uturere ku bijyanye n’akazi kadahagije",
              q: "Compare districts on underemployment",
            },
          ] as Example[],
        },
      ],
    },
    ask: {
      title: "Cyangwa baza ikibazo cyawe",
      label: "Ikibazo cyawe",
      placeholder:
        "Urugero: Ni utuhe turere dufite ubushomeri bw’urubyiruko buri hejuru?",
      button: "Baza",
    },
    how: {
      title: "Uko ikibazo gihinduka umwanya w’mboni",
      lead: "Nta mabwiriza yo kwandika, nta mbonerahamwe ugomba gukora. Intambwe enye.",
      steps: [
        {
          t: "Baza",
          d: "Andika ikibazo cyawe mu magambo yoroshye, cyangwa ukoreshe ijwi niba ubishaka.",
        },
        {
          t: "Kubara",
          d: "Porogaramu y’ibarurishamibare ibara imibare. AI ntihimba imibare.",
        },
        {
          t: "Reba",
          d: "Ubona ibishushanyo, imbonerahamwe, amakarita n’ibisobanuro bigufi ku rupapuro rumwe.",
        },
        {
          t: "Genzura ubike",
          d: "Fungura aho amakuru yavuye n’imbogamizi zayo, uhindure imiterere, ubundi ubike mboni kugira ngo uzarifungure ukundi.",
        },
      ],
    },
    data: {
      title: "Sura amakuru ashingiyeho ibisubizo",
      lead: "Mboni rishingiye ku nzego z’ingenzi z’ibarurishamibare ry’iterambere ry’u Rwanda.",
      topics: [
        {
          t: "Umurimo n’akazi",
          d: "Abafite akazi, abashomeri n’abafite akazi kadahagije, ukurikije imyaka, igitsina n’akarere.",
        },
        {
          t: "Uburezi n’ubumenyi",
          d: "Abiga, abarangiza, ibizamini n’amahugurwa y’imyuga.",
        },
        {
          t: "Ubuhinzi n’ibiribwa",
          d: "Umusaruro w’ibihingwa, ifumbire n’ibindi bikoresho, n’ubwizigame bw’ibiribwa.",
        },
        {
          t: "Ubukene n’ingo",
          d: "Imibereho y’ingo n’uko abantu babayeho mu duce dutandukanye.",
        },
        {
          t: "Serivisi z’imari",
          d: "Uko abantu bagerwaho na serivisi z’imari n’uko bazikoresha.",
        },
        {
          t: "Ubuzima n’abaturage",
          d: "Imiterere y’abaturage n’ibipimo by’ubuzima by’abaturage muri rusange.",
        },
        {
          t: "Ibikorwa by’ubucuruzi",
          d: "Ibigo by’ubucuruzi ukurikije urwego n’aho biherereye, n’uko bihinduka.",
        },
        {
          t: "Kugerwaho na serivisi",
          d: "Amashanyarazi, amazi, isuku n’itumanaho, aho byapimwe.",
        },
      ],
      mapTitle: "Uturere 30, ikarita imwe",
      mapLead:
        "Buri kibazo gishingiye ku gace kigaragazwa kuri uru rubuga rw’uturere, rugabanyije mu ntara. Amakuru ntareshya mu turere twose, bityo hari uturere dushobora kuba tutagaragara mu gisubizo.",
      mapLabel: "Uturere tw’u Rwanda dushyizwe mu ntara",
    },
    trust: {
      title: "Imibare ushobora kugenzura",
      items: [
        {
          t: "Buri mubare ufite aho wavuye",
          d: "Imibare iva gusa mu bisubizo by’mboni. Aho amakuru yavuye, uburyo yabazwemo n’imbogamizi biba iruhande rw’umwanya wose.",
        },
        {
          t: "Ubishyira uko ubishaka",
          d: "Hindura ingano, uko bikurikirana n’ubwoko bw’igishushanyo, ubike impinduka. Igisubizo nyirizina ntigihinduka.",
        },
        {
          t: "Cyakozwe ku bw’abantu bose",
          d: "Gukoresha ikibaho gusa, incamake zisomwa n’ibyuma bisoma, imbonerahamwe kuri buri gishushanyo, ibara ryerekana neza, n’ijwi riri ku bushake.",
        },
      ],
      links:
        "Soma [imfashanyigisho](/docs) cyangwa [uburyo dukoresha](/methodology).",
    },
    cta: {
      title: "Tangira n’ikibazo kimwe",
      lead: "Baza ku mwuga, igitekerezo cy’ubucuruzi, igihingwa cyangwa akarere, urebe icyo ibarurishamibare ry’u Rwanda rivuga.",
    },
  },

  contact: {
    metaTitle: "Twandikire",
    title: "Twandikire",
    lead: "Ibibazo, ibyo gukosora, ibyifuzo by’amakuru cyangwa ibibazo byo kugerwaho. Dusoma byose.",
    name: "Izina",
    email: "Imeri",
    message: "Ubutumwa",
    placeholder: "Twagufasha iki?",
    send: "Ohereza ubutumwa",
    minHint: "Andika nibura inyuguti 10 kugira ngo wohereze.",
    sentTitle: "Ubutumwa bwoherejwe",
    sentBody: "Murakoze. Tuzagusubiza kuri aderesi watanze.",
    failed: "Ubutumwa bwawe ntibwashoboye koherezwa.",
    namePlaceholder: "Andika izina ryawe ryuzuye",
    emailPlaceholder: "Andika imeri yawe",
  },

  voice: {
    unsupported:
      "Gukoresha ijwi ntibishoboka muri iyi porogaramu yo gusura. Andika ikibazo cyawe.",
    start: "Baza ukoresheje ijwi",
    stop: "Hagarika ijwi",
    listening: "Ndumva… amagambo yawe agaragara mu kibanza cy’ikibazo.",
    blocked: "Ntiwemeye ko mikoro ikoreshwa. Ushobora kwandika ikibazo cyawe.",
    stopped: "Ijwi ryahagaze. Ushobora kwandika ikibazo cyawe.",
  },

  about: {
    metaTitle: "Abo turi bo",
    title: "Ibyerekeye Mboni",
    intro:
      "Mboni ni igikoresho gifasha abantu gusobanukirwa ibarurishamibare rusange ry’u Rwanda no kurikoresha mu byemezo bifatika ku mwuga, ubucuruzi, ubuhinzi no gutegura iterambere ry’abaturage.",
    sections: [
      {
        h: "Impamvu twaryubatse",
        p: [
          "Ibarurishamibare ryemewe rigirira akamaro iyo abantu bashobora kurisura batiriwe bandika amabwiriza cyangwa bategereje raporo. Chatbot isubiza mu gika kimwe. Ikibaho kidahinduka gisubiza ikibazo kimwe. Mboni ryubaka umwanya wo gukoreramo ubibaza, kijyanye n’ikibazo wabajije, hanyuma rikakibika.",
          "Intego si ugufata icyemezo mu mwanya wawe. Ni ukwerekana icyo ibimenyetso bihari bivuga, gereranya amahitamo, gusobanura icyo wunguka n’icyo utakaza, no kwerekana ibibazo bikwiye gusuzumwa neza.",
        ],
      },
      {
        h: "Ababifashamo",
        ul: [
          "**Abanyeshuri n’abarangije amashuri** bashaka kumenya inzira z’amasomo n’imyuga.",
          "**Abashaka akazi n’abahindura umwuga** bareba uko akazi kameze n’ubumenyi bukenewe.",
          "**Abashoramari n’abafite ubucuruzi buto** basuzuma ibikorwa by’ubukungu byo mu gace mbere yo gutegura.",
          "**Abahinzi n’amakoperative** bagereranya uko umusaruro uhagaze n’ingaruka zishoboka.",
          "**Ingo n’imiryango ikorera mu baturage** ishaka gusobanukirwa ubukene no kugerwaho na serivisi.",
          "**Abashakashatsi, abarimu n’abanyamakuru** basura amakuru rusange kandi bakayasobanura neza.",
          "**Abafatanyabikorwa mu iterambere n’inzego za Leta** bagereranya uko uturere tumeze n’ibikenewe mu igenamigambi.",
        ],
      },
      {
        h: "Icyatuma ritandukana",
        ul: [
          "**Ibisubizo n’uburyo bigaragazwa biratandukanye.** Moteri y’mboni ni yo ibara ibisubizo. Igikoresho gitegura gusa kivuga uko bigaragazwa. Guhindura ubwoko bw’igishushanyo cyangwa imiterere ntibihindura umubare.",
          "**Nta kode yakozwe na AI ikoreshwa.** AI itanga ibisobanuro bifite imiterere ihamye. Igikoresho kirabigenzura hanyuma kikabishushanya n’ibikoresho byacyo.",
          "**Akazi karabikwa.** Buri sesengura ribikwa n’imiterere yaryo, aho amakuru yavuye n’amateka y’impinduka.",
          "**Cyakozwe ngo abantu bose bagikoreshe.** Gukoresha ikibaho, incamake zisomwa n’ibyuma, imbonerahamwe z’amakuru, ibara ryerekana neza n’ijwi riri ku bushake; kwandika buri gihe birashoboka.",
        ],
      },
      {
        h: "Amahame twiyemeje",
        ul: [
          "Ntituzahimba amakuru, imibare, aho yavuye cyangwa urugero rw’icyizere.",
          "Tugaragaza isoko, igihe, aho amakuru ageze, ibipimo n’ibisobanuro igihe bizwi.",
          "Tuvuga neza igihe amakuru abura, ashaje, ari make cyane cyangwa adashobora kugereranywa.",
          "Dutandukanya imibare yabonetse, iyabazwe n’iteganyagihe.",
          "Tuvuga isano hagati y’ibintu, ntabwo tuvuga icyabiteye keretse igenzura rihagije ribyemeje.",
          "Turinda ubuzima bwite: ntituzafasha kumenya abantu bashingiye ku makuru arambuye.",
        ],
      },
      {
        h: "Aho bigeze",
        p: [
          "Iri sesengura ryakozwe ku bw’irushanwa rya NISR Big Data Hackathon 2026, rikoresha amakuru ya NISR n’andi makuru rusange. Ni umushinga wigenga, si serivisi ya NISR yemewe.",
          "Inyungu zivugwa kuri uru rubuga ni izo twifuza, ntabwo ari ingaruka zapimwe. Ntawavuga ko Mboni ryongereye akazi, ryazamuye umusaruro cyangwa ryahinduye politiki hatabayeho isuzuma rikwiye.",
          "Soma [imfashanyigisho](/docs), [uburyo dukoresha](/methodology) na [ubusobanuro kuri AI](/ai-transparency), cyangwa [utwandikire](/contact).",
        ],
      },
    ],
  } as DocPage,

  docs: {
    metaTitle: "Imfashanyigisho",
    title: "Imfashanyigisho",
    intro:
      "Uko ubaza ibibazo, usoma umwanya w’mboni, no gukoresha Mboni mu kugira inama ku mwuga, gutangiza ubucuruzi no kwigira ku makuru y’u Rwanda.",
    updated: "Ukwakira 2026",
    ctaTitle: "Witeguye kugerageza?",
    ctaBody: "Baza ikibazo cya mbere ufungure umwanya w’mboni.",
    sections: [
      {
        id: "start",
        h: "Gutangira",
        p: [
          "Mboni rigufasha kubaza ibibazo ku ibarurishamibare ry’u Rwanda mu magambo yoroshye. Risubiza rikuzanira umwanya w’mboni urimo ibishushanyo, imbonerahamwe, amakarita n’ibisobanuro bigufi, hamwe n’aho amakuru yavuye iruhande.",
          "Rifasha cyane ku bwoko butatu bw’ibibazo: guhitamo umwuga cyangwa amasomo, gutangiza cyangwa kwagura ubucuruzi, no kwigira ku byo amakuru y’u Rwanda yerekana ku byahise.",
        ],
        ol: [
          "Kanda [Tangira kuganira](/workspace) winjire cyangwa ufungure konti.",
          "Andika ikibazo, cyangwa uhitemo kimwe mu bibazo by’ingero biri ku rupapuro rwa mbere.",
          "Soma umwanya w’mboni, ufungure aho amakuru yavuye n’imbogamizi zayo, ubundi ubike niba ushaka kuzagaruka.",
        ],
      },
      {
        id: "questions",
        h: "Kubaza neza",
        p: [
          "Mboni rikora neza iyo ubajije ikibazo cyihariye kivuga ingingo, ahantu cyangwa igihe. Amagambo yoroshye arahagije.",
        ],
        ul: [
          "**Kiragutse cyane:** “Mbwira ku kazi.” **Ni byiza kuvuga:** “Imirimo yahindutse ite mu nzego zitandukanye uko imyaka yagiye ihita?”",
          "**Kiragutse cyane:** “Ubuhinzi ni bwiza?” **Ni byiza kuvuga:** “Ni ibihe bihingwa byeze cyane mu turere?”",
          "**Kiragutse cyane:** “Nafungura iduka he?” **Ni byiza kuvuga:** “Erekana ibigo by’ubucuruzi ukurikije urwego n’akarere.”",
        ],
      },
      {
        id: "unclear",
        h: "Iyo ikibazo kitumvikanye",
        p: [
          "Ibibazo bicyurwa hakurikijwe amategeko, ntibikekwa. Iyo ikibazo kidasobanutse, umwanya w’mboni uvuga icyo wumvise cyangwa ukakusaba kugabanya. Gerageza ikibazo kigufi kivuga ingingo imwe kandi, niba ubishoboye, ahantu cyangwa igihe kimwe.",
        ],
      },
      {
        id: "career",
        h: "Inama ku mwuga n’amasomo",
        p: [
          "Koresha Mboni urenze umubare umwe w’ingenzi. Rishobora kugereranya amasomo ukoresheje imibare y’abiyandikisha, abarangiza, abakorera akazi n’imishahara, no guhuza ubumenyi nk’imibare ikoreshwa n’inzego, imirimo n’ahantu.",
          "Ushobora no gusura imibare y’akazi n’akazi kadahagije ukurikije imyaka, igitsina, akarere n’urwego, n’urubyiruko rudakora, ruticaye mu ishuri cyangwa mu mahugurwa, aho amakuru abishobora.",
          "**Ibyo ritazakora:** kwizeza ko umwuga uzakuzanira akazi, gufata imyanya y’akazi yamamajwe nk’isoko ry’umurimo ryose, cyangwa kukubwira amahitamo akubereye kurusha ayandi. Urutonde rwerekana uko amahitamo agereranywa ku bipimo watoranyije. Icyemezo ni icyawe.",
        ],
      },
      {
        id: "business",
        h: "Gutangiza cyangwa kwagura ubucuruzi",
        p: [
          "Mbere yo gutegura ubucuruzi, bifasha gusobanukirwa ubukungu bwo mu gace. Mboni rishobora kwerekana umubare w’ibigo by’ubucuruzi ukurikije urwego n’akarere, uko wahindutse, n’uko ibipimo by’abaturage, ubukene no kugerwaho na serivisi bimeze hafi yaho.",
          "**Ibyo ritazakora:** umubare w’ubucuruzi n’abaturage gusa ntibyerekana ko ahantu hakwiye ubucuruzi. Ugikeneye amakuru agezweho ku bakiriya, abo mupiganwa, ubukode, ibiciro, amabwiriza n’abaguzi.",
        ],
      },
      {
        id: "agriculture",
        h: "Ubuhinzi n’ubwizigame bw’ibiribwa",
        p: [
          "Gereranya umusaruro w’ibihingwa mu turere no mu bihembwe, ubirebane n’ibipimo by’ubwizigame bw’ibiribwa.",
          "**Ibyo ritazakora:** ibyahise ntibishobora kukubwira igihingwa ugomba guhinga. Ikirere, ubutaka, amazi, ibiciro, ibikoresho, amasoko n’uburambe bwawe byose bifite uruhare. Iteganyagihe ryose rivugwa nk’ikigereranyo, ntabwo ari isezerano.",
        ],
      },
      {
        id: "past",
        h: "Kwigira ku mateka y’u Rwanda",
        p: [
          "Ibibazo byinshi mu by’ukuri bivuga ku mpinduka. Saba ikimenyetso uko imyaka ihita urebe icyerekezo cyacyo, gereranya uturere, cyangwa urebe uko ibimenyetso byinshi bigendana.",
          "Ibimenyetso bibiri byiyongera icyarimwe bivugwa nk’isano gusa. Mboni ntirivuga ko kimwe cyateye ikindi. Iteganyagihe ry’akazi mu nzego rikoresha icyerekezo kigororotse n’ibipimo by’iteganyagihe bya 95%, byageragerejwe ku myaka itakoreshejwe mu kwiga.",
        ],
      },
      {
        id: "results",
        h: "Gusoma igisubizo",
        ul: [
          "**Imibare y’ingenzi** itanga imibare nyamukuru y’ikibazo cyawe.",
          "**Ibishushanyo** byerekana ibyerekezo, uko ibintu bigabanyijwe cyangwa ibigereranyo. Buri gishushanyo gifite incamake y’inyandiko n’imbonerahamwe y’imibare nyayo.",
          "**Amakarita** ashushanya uturere ku ikarita y’uduce tungana, kugira ngo buri karere kagaragare neza.",
          "**Ibisobanuro** bivuga uko ibintu bimeze nyamukuru mu mvugo yoroshye.",
          "**Aho amakuru yavuye n’imbogamizi** bivuga aho amakuru yavuye, ibyabazwe, n’aho bigarukira ugomba kwibuka.",
          "**Isoko ry’amakuru** rivuga ikusanyamakuru ryakoreshejwe, igihe ryerekeyeho n’ibyo rikubiyemo.",
        ],
      },
      {
        id: "workspace",
        h: "Guhindura no kubika",
        ul: [
          "Hindura ingano n’uko ibice bikurikirana, ukoresheje utubuto aho kurura.",
          "Hindura ubwoko bw’igishushanyo. Imibare ntihinduka.",
          "Buri sesengura ribikwa n’imiterere yaryo n’amateka y’impinduka. Rifungure uri mu Mateka, cyangwa urisibe aho.",
        ],
      },
      {
        id: "access",
        h: "Ururimi, ijwi no kugerwaho",
        p: [
          "Hinduranya hagati y’Icyongereza n’Ikinyarwanda ukoresheje akabuto k’ururimi. Menu y’imiterere ifite ibara ry’umunsi cyangwa ry’ijoro, ingano y’inyandiko, ibara ryerekana neza no kugabanya ibigenda.",
          "Ijwi riri ku bushake. Ikoranabuhanga ryumva ijwi ryo muri porogaramu yo gusura rishobora kutumva Ikinyarwanda, bityo kwandika birashoboka buri gihe. Reba [ibyerekeye kugerwaho](/accessibility).",
        ],
      },
      {
        id: "data",
        h: "Amakuru dufite n’aho ageze",
        p: [
          "Mboni rishingiye ku makuru ya NISR n’andi masoko rusange. Aho gutangirira: [urubuga rwa NISR](https://www.statistics.gov.rw/), [NISR Microdata Catalog](https://microdatabk.statistics.gov.rw/catalog/), [Rwanda Data Sharing Platform](https://data.gov.rw/datasets), [NISR PxWeb](https://pxweb.statistics.gov.rw/pxweb/en/) na [NISR Big Data Hackathon 2026](https://www.statistics.gov.rw/about/hackathon/2026-hackathon-competition).",
          "Buri gisubizo kivuga ikusanyamakuru cyakoresheje, hamwe n’igihe, ibipimo n’ibisobanuro aho bizwi. Mbere yo kugereranya amakusanyamakuru abiri, banza urebe ibisobanuro byayo.",
          "U Rwanda rufite uturere 30 mu ntara eshanu, ariko si buri kusanyamakuru ririmo utwo turere twose. Ibyo ririmo bitandukana ukurikije isoko, umwaka n’ikimenyetso.",
        ],
      },
      {
        id: "limits",
        h: "Ibyo Mboni ritazakora",
        ul: [
          "Ntirisimbura inama z’inzobere, ibarurishamibare ryemewe cyangwa ubushakashatsi bwo mu kibaya.",
          "Ntiriteganya amafaranga, uburenganzira cyangwa imibereho y’umuntu umwe rishingiye ku mibare y’itsinda.",
          "Ntirishyira abaturage ku rutonde rw’agaciro cyangwa ngo rifate icyemezo cy’aho inkunga ijya.",
          "Si serivisi y’ubuvuzi kandi ntiritanga inama z’ubuzima z’umuntu ku giti cye.",
          "Ntirivuga ko porogaramu yateye umusaruro runaka keretse igenzura rihagije ribyemeje.",
        ],
      },
      {
        id: "faq",
        h: "Ibibazo bikunze kubazwa",
        qa: [
          [
            "Iyi ni serivisi ya NISR yemewe?",
            "Oya. Mboni ni umushinga wigenga wakozwe ku bw’irushanwa rya NISR Big Data Hackathon 2026, ukoresha amakuru ya NISR n’andi makuru rusange. Ntiriyoborwa na NISR.",
          ],
          [
            "Imibare ni iy’ukuri?",
            "Yego. Bibarwa hakoreshejwe amakuru ya NISR n’andi makuru rusange, ntabwo bihimbwa. Buri gisubizo kivuga aho amakuru yavuye, igihe n’ibyo kirimo kugira ngo ubigereranye n’umwimerere. Soma [uburyo dukoresha](/methodology).",
          ],
          [
            "Nakwishingikiriza ku gisubizo mu cyemezo nyacyo?",
            "Koresha ibisubizo nk’ibimenyetso n’inyongera, si cyo cyonyine ushingiraho. Genzura aho amakuru yavuye, igihe n’imbogamizi, wongereho amakuru agezweho yo mu gace kawe mbere yo gufata icyemezo.",
          ],
          [
            "AI ihimba imibare?",
            "Oya. Porogaramu y’ibarurishamibare ni yo ibara imibare yose. AI iri ku bushake itanga gusa icyifuzo cy’uko umwanya utegurwa, hanyuma icyo cyifuzo kikagenzurwa ugereranyije n’igisubizo nyakuri. Reba [ubusobanuro kuri AI](/ai-transparency).",
          ],
          [
            "Nshobora kuyikoresha mu Kinyarwanda?",
            "Imbuga yose iboneka mu Kinyarwanda. Ibibazo bicyurwa hakurikijwe amategeko, bityo amagambo magufi kandi yihariye ni yo akora neza, kandi ubwirwa niba ikibazo kitumvikanye.",
          ],
          [
            "Nasiba amakuru yanjye nte?",
            "Siba mboni iryo ari ryo ryose uri mu Mateka. Kugira ngo konti yawe isibwe, saba unyuze ku [rupapuro rwo kutwandikira](/contact).",
          ],
        ],
      },
    ],
  } as DocsPage,

  methodology: {
    metaTitle: "Uburyo dukoresha",
    title: "Uburyo dukoresha n’aho amakuru aturuka",
    intro:
      "Uko Mboni ryohereza ibibazo muri porogaramu y’mboni ry’ibarurishamibare, no kuvuga ikusanyamakuru buri gisubizo gikomokaho.",
    sections: [
      {
        h: "Kuva ku kibazo ukagera ku gisubizo",
        ol: [
          "Ikibazo cyanditse mu rurimi rusanzwe cyoherezwa kuri moteri ikwiye (icyemezo n’umwuga, guteranya mu matsinda, regression, cyangwa iteganyagihe).",
          "Serivisi y’mboni yo muri Python ifata amakusanyamakuru yateguwe ashingiye kuri NISR n’andi masoko rusange.",
          "Porogaramu y’ibarurishamibare n’amategeko y’ibyemezo ibara igisubizo. Buri gisubizo kivuga isoko yacyo.",
          "Igikoresho gitegura gishingiye ku mategeko gihindura igisubizo `PresentationSpec` (ibishushanyo, imbonerahamwe, amakarita, imibare y’ingenzi, ibisobanuro). Imiterere ntihindura imibare.",
          "Byose bibikwa nka artifact (ikibazo, igisubizo, aho amakuru yavuye, spec, impinduka) kandi bishobora gufungurwa bitahindutse.",
        ],
      },
      {
        h: "Moteri",
        ul: [
          "**Ibyemezo ku mwuga n’amasomo.** Igereranya amasomo yitwa n’imibare y’abiyandikisha, abarangiza, abakorera akazi n’imishahara, ihuza ubumenyi nk’imibare ikoreshwa n’inzego, imirimo n’ahantu bishoboka. Ibisubizo byerekana uko amahitamo agereranywa ku bipimo bihari. Si ibimenyetso by’ibyo umukoresha runaka akeneye.",
          "**Ibibazo rusange ku makusanyamakuru.** Ihuza ibipimo bishyigikiwe mu makusanyamakuru 12 ya CSV, ishobora gukora incamake y’ingingo, kugereranya cyangwa gushyira ku rutonde uturere n’ibyiciro, gutoranya ahantu hitwa, no kwerekana ibyerekezo by’amateka iyo imyaka isabwe ihari. Ibibazo ku musaruro w’ibihingwa bikoresha imbonerahamwe NISR yatangaje.",
          "**Ikibazo A: akazi kadahagije mu turere (guteranya mu matsinda).** K-means (k=3) ku bipimo byahujwe: akazi kadahagije, ubushomeri, urubyiruko rudakora kandi ruticaye mu ishuri (NEET), umugabane w’ubuhinzi, umugabane w’akazi gahamye n’umugabane w’abize ayisumbuye no hejuru. Itanga amatsinda y’uturere n’ibiranga buri tsinda.",
          "**Ikibazo B: ibiteganya NEET mu rubyiruko (regression).** Panel OLS ku bipimo by’akarere ku mwaka hamwe na year fixed effects, ridge n’igenzura rya leave-one-district-out. Itanga coefficients, R² na R² ihinduye, Q² na RMSE, n’uburemere bw’ibiranga. Coefficients zerekana isano, ntizerekana icyabiteye, kandi n ni nto.",
          "**Ikibazo C: ibyerekezo by’akazi mu nzego n’iteganyagihe.** Icyerekezo kigororotse kuri buri rwego n’ibipimo by’iteganyagihe bya 95%, byageragerejwe ku myaka itakoreshejwe.",
          "**Icyemezo n’umwuga.** Ikora ibigereranyo bifite uburemere ku bipimo bihari. Sisitemu ishyira amahitamo ku rutonde kandi ntifata icyemezo cya nyuma.",
        ],
      },
      {
        h: "Aho amakuru aturuka",
        p: [
          "Amakusanyamakuru ava kuri izi mbuga: [urubuga rwa NISR](https://www.statistics.gov.rw/), [NISR Microdata Catalog](https://microdatabk.statistics.gov.rw/catalog/), [Rwanda Data Sharing Platform](https://data.gov.rw/datasets) na [NISR PxWeb](https://pxweb.statistics.gov.rw/pxweb/en/). Buri gisubizo kivuga ikusanyamakuru nyirizina cyakoresheje.",
          "Ibisubizo ku musaruro w’ibihingwa bikoresha [imbonerahamwe rusange ya NISR y’umusaruro ukurikije akarere n’igihingwa](https://pxweb.statistics.gov.rw/pxweb/en/NISR%20Statistical%20Databases/Agriculture/Crop%20area,%20production%20and%20yield%20for%20major%20crops/yield.px). Irimo ibyabonetse mu gihembwe A na B ariko ntivuga umwaka ishingiyeho. Reba `model/README.md` ubone ibisobanuro.",
        ],
      },
      {
        h: "Aho bigarukira n’amahame",
        ul: [
          "**Amakuru yabuze:** ibitabonetse biva mu mibare aho kubifata nka zeru. Imbonerahamwe ya NISR y’umusaruro w’ibihingwa ntivuga umwaka ishingiyeho.",
          "**Gukorera mu mucyo:** buri gisubizo kivuga amasoko, ibyakozwe, imbogamizi n’impinduka.",
          "**Gutandukanya ibikorwa:** moteri zibara imibare. Moteri y’ururimi, iyo ikoreshejwe, itegura imiterere kandi igasobanura gusa. Ntabwo ihimba ibarurishamibare.",
          "**Gusubiramo ibisubizo:** ibisubizo by’mboni ntibihinduka. Impinduka mu mibereho y’igaragazwa zibikwa ukwazo.",
          "**Ibikubiyemo:** ibyo amakuru akubiyemo biratandukana ukurikije isoko, umwaka n’ikimenyetso, bityo igisubizo gishobora kutarimo uturere twose.",
        ],
      },
    ],
  } as DocPage,

  ai: {
    metaTitle: "Ubusobanuro kuri AI",
    title: "Ubusobanuro kuri AI",
    intro:
      "Icyo porogaramu y’mboni ibara, aho AI iri ku bushake ikoreshwa, n’aho amakuru aturuka.",
    sections: [
      {
        h: "Icyo sisitemu ikora yonyine",
        p: [
          "Serivisi ya Python ikoresha kohereza ibibazo hakurikijwe amategeko na porogaramu y’ibarurishamibare: K-means, panel OLS, ibyerekezo bigororotse n’amategeko y’ibyemezo afite uburemere. Si neural network yatojwe cyangwa chatbot. Igikoresho cya AI gitegura kiri ku bushake gishobora gutanga *icyifuzo cy’uko bigaragazwa*: ibice byo kwerekana n’uko bitegurwa. Ntikibara ibarurishamibare.",
        ],
      },
      {
        h: "Aho amakuru aturuka",
        p: [
          "Amakuru ashingirwaho mu mboni ni aya NISR n’andi makuru rusange. Mboni ribara ibisubizo ribishingiye kuri yo kandi rikagaragaza buri soko, kugira ngo ugereranye umubare n’umwimerere. Ibisubizo ni imibare Mboni ryabaze, si ibitangazwa na NISR.",
        ],
      },
      {
        h: "Ibyo sisitemu itakora",
        ul: [
          "**Igikoresho gitegura kiri ku bushake ntikibara.** Imikorere y’ibarurishamibare ikorerwa muri serivisi y’mboni ya Python. Igikoresho gitegura gitanga gusa ibyifuzo by’imiterere.",
          "**Si igicuruzwa cya NISR cyemewe.** Ibisubizo bibarwa na Mboni bishingiye ku makuru rusange, ntibitangazwa na NISR.",
          "**Nta kuvuga icyateye ikindi.** Moteri zivuga isano, urugero ibiteganya NEET. Imbuga yerekana aho bigarukira kandi ntifata isano nk’icyateye ikindi.",
          "**Nta byemezo bya nyuma.** Ku guhitamo igihingwa n’umwuga, sisitemu ishyira amahitamo ku rutonde ifite ibimenyetso, kandi ntikwerekana ihitamo rimwe “ryiza cyane”.",
          "**Ibisohoka bigenzurwa cyane.** Imiterere iyo ari yo yose AI itanze igomba kuba ihuye na schema ya `PresentationSpec` n’igisubizo nyakuri. Ibitemewe birahakanwa bigasimbuzwa igikoresho gitegura gishingiye ku mategeko.",
        ],
      },
      {
        h: "Uko wabigenzura",
        ul: [
          "**Aho amakuru yavuye n’imbogamizi:** buri mwanya w’mboni uvuga amasoko y’amakuru, ibyakozwe, aho bigarukira, n’ibyiciro by’mboni n’iby’igikoresho gitegura.",
          "**Gukurikiranwa:** igisubizo cy’mboni ntigihinduka. Impinduka mu igaragazwa zibikwa ukwazo.",
          "**Gusuzumwa:** ibishushanyo bifite imbonerahamwe z’amakuru. Ushobora gutunganya imiterere mu mwanya w’mboni.",
          "**Kohereza bisobanutse:** sisitemu ivuga icyo yumvise. Ibyifuzo bidasobanutse bihakanwa aho gukekwa.",
        ],
      },
      {
        h: "Inyandiko ku miterere ya sisitemu",
        p: [
          "Serivisi y’mboni ikora ukwayo (`model/`, FastAPI). API ya Express yohereza ibibazo kuri yo, kandi muri production uburyo bwo gukorera mu gihe itaboneka burahagarikwa. Aho amakuru yavuye n’aho agarukira bigaragara mu gice cy’aho amakuru yavuye mu mwanya w’mboni.",
        ],
      },
    ],
  } as DocPage,

  accessibility: {
    metaTitle: "Kugerwaho n’abantu bose",
    title: "Itangazo ryo kugerwaho n’abantu bose",
    intro:
      "Mboni ryateguwe kugira ngo abantu bafite ubushobozi butandukanye bashobore gukoresha buri gice cyaryo.",
    updated: "Ukwakira 2026",
    sections: [
      {
        h: "Ibyo twashyizemo",
        ul: [
          "**Ikibaho:** byose bikora nta mbeba, hari akarango kerekana aho uri n’ihuza ryo gusimbuka. Guhindura ingano no gukurikirana bifite utubuto aho kurura.",
          "**Ibyuma bisoma ecran:** imitwe n’uduce bifite ubusobanuro, ibigenzura bifite amazina, incamake y’inyandiko kuri buri gishushanyo n’imbonerahamwe y’amakuru inyuma ya buri gishushanyo n’ikarita.",
          "**Kureba:** amabara y’umunsi n’ijoro, uburyo bw’ibara ryerekana neza, ingano y’inyandiko igera kuri 130%, n’ibishushanyo bitishingikiriza ku ibara gusa.",
          "**Kumva:** nta kintu gisaba ijwi. Inyandiko z’ijwi ziragaragara, kandi gusoma mu ijwi bigaragaza inyandiko imwe kuri ecran. Ubutumwa bw’amakuru ni ubwo kureba.",
          "**Ibigenda:** uburyo ibintu bigenda bukurikiza igenamiterere rya sisitemu yawe, kandi hari akabuto ko kugabanya ibigenda muri menu y’imiterere.",
          "**Ijwi riri ku bushake:** kwandika birashoboka buri gihe.",
          "**Ururimi:** imbuga iboneka mu Cyongereza no mu Kinyarwanda.",
        ],
      },
      {
        h: "Aho bigarukira",
        p: [
          "Ikarita y’uturere ni ikarita y’uduce tungana, si iy’ahantu nyakuri, kugira ngo buri karere kagaragare kandi gakoreshwe neza. Ikoranabuhanga ryumva ijwi ryo muri porogaramu yo gusura ntiribonekamo muri buri porogaramu kandi rishobora kutumva Ikinyarwanda.",
        ],
      },
      {
        h: "Tubwire inzitizi",
        p: [
          "Niba hari ikitagukorera, [twandikire](/contact) utubwire icyo wageragezaga gukora n’ikoranabuhanga ryunganira ukoresha. Ibibazo byo kugerwaho tubifata nk’amakosa agomba gukosorwa.",
        ],
      },
    ],
  } as DocPage,

  privacy: {
    metaTitle: "Politiki y’ubuzima bwite",
    title: "Politiki y’ubuzima bwite",
    intro: "Amakuru Mboni ikusanya, impamvu, n’amahitamo ufite.",
    updated: "Ukwakira 2026",
    notice:
      "Icyitonderwa ku bayobozi: uyu mwandiko ni icyitegererezo. Ugomba gusuzumwa hakurikijwe Itegeko N° 058/2021 ryerekeye kurinda amakuru y’umuntu ku giti cye n’ubuzima bwite, n’andi mategeko abigenga, mbere yo gutangira.",
    sections: [
      {
        h: "Ibyo dukusanya",
        ul: [
          "**Amakuru ya konti:** izina ryawe, aderesi ya imeri n’ijambobanga ribitse mu buryo bwizewe (hashed). Niba uyongeyeho, ifoto y’umwirondoro.",
          "**Ibikorwa byawe:** ibibazo ubaza, ibisubizo by’mboni, imiterere y’imyanya y’mboni n’impinduka ubika.",
          "**Ubutumwa bwo kutwandikira:** ibyo wohereza unyuze mu ifishi yo kutwandikira.",
          "**Amakuru ya tekiniki:** cookie y’igihe ukoresha (session), aderesi ya IP n’ubwoko bwa porogaramu usuramo, bikoreshwa kugira ngo ukomeze kuba winjiye no kurinda serivisi.",
        ],
      },
      {
        h: "Uko tuyakoresha",
        p: [
          "Gukora konti yawe, gukora no kubika amasesengura yawe, kohereza imeri z’ingenzi (kwemeza no guhindura ijambobanga), gusubiza ubutumwa bwawe, no kurinda serivisi. Ntitugurisha amakuru y’umuntu ku giti cye kandi ntitwerekana ibyamamazwa.",
        ],
      },
      {
        h: "Ijwi",
        p: [
          "Ijwi riri ku bushake. Kumva ijwi bikorwa na serivisi ya porogaramu yawe yo gusura, ishobora kohereza amajwi ku muntu wayikoze. Mboni ryakira gusa inyandiko igaragara mu kibazo. Ushobora kwandika buri gihe.",
        ],
      },
      {
        h: "Ibikorwa bya AI",
        p: [
          "Niba igikoresho cya AI gitegura kiri ku bushake gikoreshwa, cyakira gusa imiterere y’igisubizo cy’mboni (amazina y’amakusanyamakuru n’inkingi, ibice bihari), kandi ntikigera cyakira amakuru ya konti yawe. Reba [ubusobanuro kuri AI](/ai-transparency).",
        ],
      },
      {
        h: "Abatanga serivisi",
        p: [
          "Dukoresha abatanga serivisi mu kohereza imeri (Brevo), kubika amafoto y’umwirondoro (ImageKit) no kwakira urubuga. Bakoresha amakuru gusa kugira ngo batange izo serivisi.",
        ],
      },
      {
        h: "Cookies n’amahitamo",
        p: [
          "Dukoresha cookie imwe y’ingenzi y’igihe ukoresha. Amahitamo yawe y’imiterere (ibara, ingano y’inyandiko, ibara ryerekana neza, ibigenda) n’ururimi wahisemo bibikwa muri porogaramu yawe yo gusura. Ntidukoresha cookies z’ibyamamazwa cyangwa zikurikirana ku mbuga nyinshi.",
        ],
      },
      {
        h: "Igihe tubika n’uburenganzira bwawe",
        p: [
          "Ushobora gusiba mboni iryo ari ryo ryose ribitswe uri mu Mateka. Ushobora kudusaba kukwereka, gukosora, kohereza cyangwa gusiba amakuru yawe bwite, cyangwa gufunga konti yawe, unyuze ku [rupapuro rwo kutwandikira](/contact). Igihe cyarangiye n’ibimenyetso byo kwemeza bisibwa buri munsi mu buryo bwikora.",
        ],
      },
      {
        h: "Impinduka",
        p: [
          "Nitugira icyo duhindura muri iyi politiki gifite icyo gisobanuye, tuzabivuga kuri uru rupapuro kandi duhindure itariki iri hejuru.",
        ],
      },
    ],
  } as DocPage,

  terms: {
    metaTitle: "Amabwiriza yo gukoresha",
    title: "Amabwiriza yo gukoresha",
    intro: "Amategeko agenga imikoreshereze y’Mboni.",
    updated: "Ukwakira 2026",
    notice:
      "Icyitonderwa ku bayobozi: uyu mwandiko ni icyitegererezo. Umunyamategeko agomba kuwusuzuma no kuwuzuza (izina ry’ukora, amategeko agenga, urukiko) mbere yo gutangira.",
    sections: [
      {
        h: "Gukoresha serivisi",
        p: [
          "Ushobora gukoresha Mboni mu gusura amakuru rusange no gukora no kubika imyanya y’mboni. Wemera gutanga amakuru nyayo ya konti, kurinda ijambobanga ryawe, kandi ntukoreshe serivisi nabi, urugero ugerageza kuyihungabanya, kuyirenza urugero, cyangwa kohereza ibinyuranyije n’amategeko.",
        ],
      },
      {
        h: "Amakuru n’ukuri",
        p: [
          "Ibisubizo bibarwa hakoreshejwe amakuru ya NISR n’andi makuru rusange kandi si ibarurishamibare ryemewe rya NISR. Bishingira ku isoko, uburyo bugaragara muri buri mwanya n’imbogamizi zihandikwa. Zigenzure mbere yo kwishingikiriza ku mubare.",
        ],
      },
      {
        h: "Igaragazwa rifashijwe na AI",
        p: [
          "Sisitemu ya AI ishobora gutanga icyifuzo cy’uko umwanya utegurwa. Ntibara imibare igaragara. Ni wowe ukomeza kubazwa uko usobanura kandi ugakoresha ibisubizo. Reba [ubusobanuro kuri AI](/ai-transparency).",
        ],
      },
      {
        h: "Ibyo ushyiraho",
        p: [
          "Ukomeza kuba nyir’ibibazo ubaza n’impinduka ukora. Uduha uburenganzira bwo kubibika no kubikwereka kugira ngo dutange serivisi. Amakusanyamakuru y’ibanze akomeza kugengwa n’impushya z’abayatangaje, zigaragazwa kuri buri soko.",
        ],
      },
      {
        h: "Kuboneka kwa serivisi",
        p: [
          "Twihatira ko serivisi iboneka ariko ntitwizeza ko itazahagarara. Dushobora guhindura cyangwa gukuraho ibikorwa, kandi tuzagerageza kubibamenyesha iyo impinduka igira ingaruka ku byabitswe.",
        ],
      },
      {
        h: "Inshingano",
        p: [
          "Mu rugero amategeko yemera, abayobora serivisi ntibazaryozwa ibihombo biturutse ku byemezo byafashwe hakoreshejwe serivisi. Nta kintu kiri hano kigabanya inshingano zitagabanywa n’amategeko.",
        ],
      },
      {
        h: "Gusiba konti yawe",
        p: [
          "Ushobora guhagarika gukoresha serivisi igihe cyose ukadusaba gusiba konti yawe unyuze ku [rupapuro rwo kutwandikira](/contact). Dushobora guhagarika konti zica aya mabwiriza.",
        ],
      },
    ],
  } as DocPage,

  mboniPrompt: {
    ariaLabel: "Baza Mboni",
    title: "Mboni yagufasha iki?",
    placeholder: "Baza ikibazo ku mibare y'u Rwanda...",
    inputLabel: "Ikibazo cyawe kuri Mboni",
    send: "Ohereza ikibazo",
    moreExamples: "Ibindi",
    fewerExamples: "Gabanya",
  },

  auth: {
    panel: {
      title: "Baza ibibazo ku ibarurishamibare ry’u Rwanda",
      body: "Injira ubike amasesengura yawe, uyafungure igihe cyose, kandi urebe aho buri mubare waturutse.",
      points: [
        "Hitamo umwuga cyangwa amasomo",
        "Tangiza cyangwa ongera ubucuruzi",
        "Wigire ku mateka y’u Rwanda",
      ],
      sceneLabel:
        "Igishushanyo cy’imisozi y’icyatsi y’u Rwanda, ibirunga n’imigano mu rukerera",
    },
    modes: {
      login: {
        h: "Injira",
        cta: "Injira",
        sub: "Murakaza neza. Komereza aho wari ugeze.",
      },
      signup: {
        h: "Fungura konti",
        cta: "Fungura konti",
        sub: "Bika ibibazo n’amasesengura byawe kugira ngo uzabigarukeho.",
      },
      forgot: {
        h: "Subiza ijambobanga",
        cta: "Ohereza ihuza ryo gusubiza",
        sub: "Andika imeri yawe tukwoherereze ihuza ryo guhitamo ijambobanga rishya.",
      },
      reset: {
        h: "Hitamo ijambobanga rishya",
        cta: "Bika ijambobanga rishya",
        sub: "Hitamo ijambobanga rishya rifite nibura inyuguti 10.",
      },
    },

    fields: {
      name: "Izina",
      email: "Imeri",
      password: "Ijambobanga",
      newPassword: "Ijambobanga rishya",
      pwHint: "Nibura inyuguti 10.",
      show: "Erekana ijambobanga",
      hide: "Hisha ijambobanga",
      phName: "Andika izina ryawe ryuzuye",
      phEmail: "Andika imeri yawe",
      phPassword: "Andika ijambobanga ryawe",
      phNewPassword: "Hitamo ijambobanga",
    },
    links: {
      forgot: "Wibagiwe ijambobanga?",
      newHere: "Uri mushya hano?",
      create: "Fungura konti",
      already: "Usanzwe ufite konti?",
      signIn: "Injira",
      back: "Subira ku kwinjira",
      home: "Subira ahabanza",
    },
    done: { title: "Reba imeri yawe", back: "Subira ku kwinjira" },
    messages: {
      confirmEmailFirst:
        "Banza wemeze imeri yawe. Twakoherereje ihuza igihe wafunguraga konti.",
      badCredentials: "Imeri n’ijambobanga ntibihuye.",
      createFailed: "Ntitwashoboye gufungura konti yawe.",
      signupDone:
        "Konti yafunguwe. Reba muri imeri yawe ihuza ryo kwemeza imeri, hanyuma winjire.",
      forgotDone:
        "Niba iyo aderesi ifite konti, ihuza ryo gusubiza ririmo kuza.",
      missingToken:
        "Iri huza ryo gusubiza nta kimenyetso rifite. Saba irindi rishya.",
      resetExpired: "Iri huza ryo gusubiza ryararangiye. Saba irindi rishya.",
      network:
        "Ntitwashoboye kugera kuri seriveri. Reba umuyoboro wawe ukongera ugerageze.",
    },
  },

  header: {
    homeLabel: "Ahabanza ha Mboni",
    logoAlt: "Ikirango cya Mboni",
    navMain: "Ibikuru",
    navMobile: "Kuri telefone",
    newAnalysis: "Isesengura rishya",
    history: "Amateka",
    settings: "Igenamiterere",
    about: "Abo turi bo",
    methodology: "Uburyo dukoresha",
    contact: "Twandikire",
    signOut: "Sohoka",
    signIn: "Injira",
    createAccount: "Fungura konti",
    openMenu: "Fungura menu",
    closeMenu: "Funga menu",
  },
};
