/*
 * (c) Copyright Ascensio System SIA 2010-2024
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at 20A-6 Ernesta Birznieka-Upish
 * street, Riga, Latvia, EU, LV-1050.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */

"use strict";

(function (window, undefined)
{

    var lcid_unknown = 0x0000; // Unknown
    var lcid_ar = 0x0001; // Arabic
    var lcid_bg = 0x0002; // Bulgarian
    var lcid_ca = 0x0003; // Catalan
    var lcid_zhHans = 0x0004; // Chinese, Han (Simplified variant)
    var lcid_cs = 0x0005; // Czech
    var lcid_da = 0x0006; // Danish
    var lcid_de = 0x0007; // German
    var lcid_el = 0x0008; // Modern Greek (1453-)
    var lcid_en = 0x0009; // English
    var lcid_es = 0x000a; // Spanish
    var lcid_fi = 0x000b; // Finnish
    var lcid_fr = 0x000c; // French
    var lcid_he = 0x000d; // Hebrew
    var lcid_hu = 0x000e; // Hungarian
    var lcid_is = 0x000f; // Icelandic
    var lcid_it = 0x0010; // Italian
    var lcid_ja = 0x0011; // Japanese
    var lcid_ko = 0x0012; // Korean
    var lcid_nl = 0x0013; // Dutch
    var lcid_no = 0x0014; // Norwegian
    var lcid_pl = 0x0015; // Polish
    var lcid_pt = 0x0016; // Portuguese
    var lcid_rm = 0x0017; // Romansh
    var lcid_ro = 0x0018; // Romanian
    var lcid_ru = 0x0019; // Russian
    var lcid_hr = 0x001a; // Croatian
    var lcid_sk = 0x001b; // Slovak
    var lcid_sq = 0x001c; // Albanian
    var lcid_sv = 0x001d; // Swedish
    var lcid_th = 0x001e; // Thai
    var lcid_tr = 0x001f; // Turkish
    var lcid_ur = 0x0020; // Urdu
    var lcid_id = 0x0021; // Indonesian
    var lcid_uk = 0x0022; // Ukrainian
    var lcid_be = 0x0023; // Belarusian
    var lcid_sl = 0x0024; // Slovenian
    var lcid_et = 0x0025; // Estonian
    var lcid_lv = 0x0026; // Latvian
    var lcid_lt = 0x0027; // Lithuanian
    var lcid_tg = 0x0028; // Tajik
    var lcid_fa = 0x0029; // Persian
    var lcid_vi = 0x002a; // Vietnamese
    var lcid_hy = 0x002b; // Armenian
    var lcid_az = 0x002c; // Azerbaijani
    var lcid_eu = 0x002d; // Basque
    var lcid_hsb = 0x002e; // Upper Sorbian
    var lcid_mk = 0x002f; // Macedonian
    var lcid_tn = 0x0032; // Tswana
    var lcid_xh = 0x0034; // Xhosa
    var lcid_zu = 0x0035; // Zulu
    var lcid_af = 0x0036; // Afrikaans
    var lcid_ka = 0x0037; // Georgian
    var lcid_fo = 0x0038; // Faroese
    var lcid_hi = 0x0039; // Hindi
    var lcid_mt = 0x003a; // Maltese
    var lcid_se = 0x003b; // Northern Sami
    var lcid_ga = 0x003c; // Irish
    var lcid_ms = 0x003e; // Malay (macrolanguage)
    var lcid_kk = 0x003f; // Kazakh
    var lcid_ky = 0x0040; // Kirghiz
    var lcid_sw = 0x0041; // Swahili (macrolanguage)
    var lcid_tk = 0x0042; // Turkmen
    var lcid_uz = 0x0043; // Uzbek
    var lcid_tt = 0x0044; // Tatar
    var lcid_bn = 0x0045; // Bengali
    var lcid_pa = 0x0046; // Panjabi
    var lcid_gu = 0x0047; // Gujarati
    var lcid_or = 0x0048; // Oriya
    var lcid_ta = 0x0049; // Tamil
    var lcid_te = 0x004a; // Telugu
    var lcid_kn = 0x004b; // Kannada
    var lcid_ml = 0x004c; // Malayalam
    var lcid_as = 0x004d; // Assamese
    var lcid_mr = 0x004e; // Marathi
    var lcid_sa = 0x004f; // Sanskrit
    var lcid_mn = 0x0050; // Mongolian
    var lcid_bo = 0x0051; // Tibetan
    var lcid_cy = 0x0052; // Welsh
    var lcid_km = 0x0053; // Central Khmer
    var lcid_lo = 0x0054; // Lao
    var lcid_gl = 0x0056; // Galician
    var lcid_kok = 0x0057; // Konkani (macrolanguage)
    var lcid_syr = 0x005a; // Syriac
    var lcid_si = 0x005b; // Sinhala
    var lcid_iu = 0x005d; // Inuktitut
    var lcid_am = 0x005e; // Amharic
    var lcid_tzm = 0x005f; // Central Atlas Tamazight
    var lcid_ne = 0x0061; // Nepali
    var lcid_fy = 0x0062; // Western Frisian
    var lcid_ps = 0x0063; // Pushto
    var lcid_fil = 0x0064; // Filipino
    var lcid_dv = 0x0065; // Dhivehi
    var lcid_ha = 0x0068; // Hausa
    var lcid_yo = 0x006a; // Yoruba
    var lcid_quz = 0x006b; // Cusco Quechua
    var lcid_nso = 0x006c; // Pedi
    var lcid_ba = 0x006d; // Bashkir
    var lcid_lb = 0x006e; // Luxembourgish
    var lcid_kl = 0x006f; // Kalaallisut
    var lcid_ig = 0x0070; // Igbo
    var lcid_ii = 0x0078; // Sichuan Yi
    var lcid_arn = 0x007a; // Mapudungun
    var lcid_moh = 0x007c; // Mohawk
    var lcid_br = 0x007e; // Breton
    var lcid_ug = 0x0080; // Uighur
    var lcid_mi = 0x0081; // Maori
    var lcid_oc = 0x0082; // Occitan (post 1500)
    var lcid_co = 0x0083; // Corsican
    var lcid_gsw = 0x0084; // Swiss German
    var lcid_sah = 0x0085; // Yakut
    var lcid_qut = 0x0086; //
    var lcid_rw = 0x0087; // Kinyarwanda
    var lcid_wo = 0x0088; // Wolof
    var lcid_prs = 0x008c; // Dari
    var lcid_gd = 0x0091; // Scottish Gaelic
    var lcid_arSA = 0x0401; // Arabic, Saudi Arabia
    var lcid_bgBG = 0x0402; // Bulgarian, Bulgaria
    var lcid_caES = 0x0403; // Catalan, Spain
    var lcid_zhTW = 0x0404; // Chinese, Taiwan, Province of China
    var lcid_csCZ = 0x0405; // Czech, Czech Republic
    var lcid_daDK = 0x0406; // Danish, Denmark
    var lcid_deDE = 0x0407; // German, Germany
    var lcid_elGR = 0x0408; // Modern Greek (1453-), Greece
    var lcid_enUS = 0x0409; // English, United States
    var lcid_esES_tradnl = 0x040a; // Spanish
    var lcid_fiFI = 0x040b; // Finnish, Finland
    var lcid_frFR = 0x040c; // French, France
    var lcid_heIL = 0x040d; // Hebrew, Israel
    var lcid_huHU = 0x040e; // Hungarian, Hungary
    var lcid_isIS = 0x040f; // Icelandic, Iceland
    var lcid_itIT = 0x0410; // Italian, Italy
    var lcid_jaJP = 0x0411; // Japanese, Japan
    var lcid_koKR = 0x0412; // Korean, Republic of Korea
    var lcid_nlNL = 0x0413; // Dutch, Netherlands
    var lcid_nbNO = 0x0414; // Norwegian Bokmal, Norway
    var lcid_plPL = 0x0415; // Polish, Poland
    var lcid_ptBR = 0x0416; // Portuguese, Brazil
    var lcid_rmCH = 0x0417; // Romansh, Switzerland
    var lcid_roRO = 0x0418; // Romanian, Romania
    var lcid_ruRU = 0x0419; // Russian, Russian Federation
    var lcid_hrHR = 0x041a; // Croatian, Croatia
    var lcid_skSK = 0x041b; // Slovak, Slovakia
    var lcid_sqAL = 0x041c; // Albanian, Albania
    var lcid_svSE = 0x041d; // Swedish, Sweden
    var lcid_thTH = 0x041e; // Thai, Thailand
    var lcid_trTR = 0x041f; // Turkish, Turkey
    var lcid_urPK = 0x0420; // Urdu, Pakistan
    var lcid_idID = 0x0421; // Indonesian, Indonesia
    var lcid_ukUA = 0x0422; // Ukrainian, Ukraine
    var lcid_beBY = 0x0423; // Belarusian, Belarus
    var lcid_slSI = 0x0424; // Slovenian, Slovenia
    var lcid_etEE = 0x0425; // Estonian, Estonia
    var lcid_lvLV = 0x0426; // Latvian, Latvia
    var lcid_ltLT = 0x0427; // Lithuanian, Lithuania
    var lcid_tgCyrlTJ = 0x0428; // Tajik, Cyrillic, Tajikistan
    var lcid_faIR = 0x0429; // Persian, Islamic Republic of Iran
    var lcid_viVN = 0x042a; // Vietnamese, Viet Nam
    var lcid_hyAM = 0x042b; // Armenian, Armenia
    var lcid_azLatnAZ = 0x042c; // Azerbaijani, Latin, Azerbaijan
    var lcid_euES = 0x042d; // Basque, Spain
    var lcid_wenDE = 0x042e; // Sorbian languages, Germany
    var lcid_mkMK = 0x042f; // Macedonian, The Former Yugoslav Republic of Macedonia
    var lcid_stZA = 0x0430; // Southern Sotho, South Africa
    var lcid_tsZA = 0x0431; // Tsonga, South Africa
    var lcid_tnZA = 0x0432; // Tswana, South Africa
    var lcid_venZA = 0x0433; // South Africa
    var lcid_xhZA = 0x0434; // Xhosa, South Africa
    var lcid_zuZA = 0x0435; // Zulu, South Africa
    var lcid_afZA = 0x0436; // Afrikaans, South Africa
    var lcid_kaGE = 0x0437; // Georgian, Georgia
    var lcid_foFO = 0x0438; // Faroese, Faroe Islands
    var lcid_hiIN = 0x0439; // Hindi, India
    var lcid_mtMT = 0x043a; // Maltese, Malta
    var lcid_seNO = 0x043b; // Northern Sami, Norway
    var lcid_msMY = 0x043e; // Malay (macrolanguage), Malaysia
    var lcid_kkKZ = 0x043f; // Kazakh, Kazakhstan
    var lcid_kyKG = 0x0440; // Kirghiz, Kyrgyzstan
    var lcid_swKE = 0x0441; // Swahili (macrolanguage), Kenya
    var lcid_tkTM = 0x0442; // Turkmen, Turkmenistan
    var lcid_uzLatnUZ = 0x0443; // Uzbek, Latin, Uzbekistan
    var lcid_ttRU = 0x0444; // Tatar, Russian Federation
    var lcid_bnIN = 0x0445; // Bengali, India
    var lcid_paIN = 0x0446; // Panjabi, India
    var lcid_guIN = 0x0447; // Gujarati, India
    var lcid_orIN = 0x0448; // Oriya, India
    var lcid_taIN = 0x0449; // Tamil, India
    var lcid_teIN = 0x044a; // Telugu, India
    var lcid_knIN = 0x044b; // Kannada, India
    var lcid_mlIN = 0x044c; // Malayalam, India
    var lcid_asIN = 0x044d; // Assamese, India
    var lcid_mrIN = 0x044e; // Marathi, India
    var lcid_saIN = 0x044f; // Sanskrit, India
    var lcid_mnMN = 0x0450; // Mongolian, Mongolia
    var lcid_boCN = 0x0451; // Tibetan, China
    var lcid_cyGB = 0x0452; // Welsh, United Kingdom
    var lcid_kmKH = 0x0453; // Central Khmer, Cambodia
    var lcid_loLA = 0x0454; // Lao, Lao People's Democratic Republic
    var lcid_myMM = 0x0455; // Burmese, Myanmar
    var lcid_glES = 0x0456; // Galician, Spain
    var lcid_kokIN = 0x0457; // Konkani (macrolanguage), India
    var lcid_mni = 0x0458; // Manipuri
    var lcid_sdIN = 0x0459; // Sindhi, India
    var lcid_syrSY = 0x045a; // Syriac, Syrian Arab Republic
    var lcid_siLK = 0x045b; // Sinhala, Sri Lanka
    var lcid_chrUS = 0x045c; // Cherokee, United States
    var lcid_iuCansCA = 0x045d; // Inuktitut, Unified Canadian Aboriginal Syllabics, Canada
    var lcid_amET = 0x045e; // Amharic, Ethiopia
    var lcid_tmz = 0x045f; // Tamanaku
    var lcid_neNP = 0x0461; // Nepali, Nepal
    var lcid_fyNL = 0x0462; // Western Frisian, Netherlands
    var lcid_psAF = 0x0463; // Pushto, Afghanistan
    var lcid_filPH = 0x0464; // Filipino, Philippines
    var lcid_dvMV = 0x0465; // Dhivehi, Maldives
    var lcid_binNG = 0x0466; // Bini, Nigeria
    var lcid_fuvNG = 0x0467; // Nigerian Fulfulde, Nigeria
    var lcid_haLatnNG = 0x0468; // Hausa, Latin, Nigeria
    var lcid_ibbNG = 0x0469; // Ibibio, Nigeria
    var lcid_yoNG = 0x046a; // Yoruba, Nigeria
    var lcid_quzBO = 0x046b; // Cusco Quechua, Bolivia
    var lcid_nsoZA = 0x046c; // Pedi, South Africa
    var lcid_baRU = 0x046d; // Bashkir, Russian Federation
    var lcid_lbLU = 0x046e; // Luxembourgish, Luxembourg
    var lcid_klGL = 0x046f; // Kalaallisut, Greenland
    var lcid_igNG = 0x0470; // Igbo, Nigeria
    var lcid_krNG = 0x0471; // Kanuri, Nigeria
    var lcid_gazET = 0x0472; // West Central Oromo, Ethiopia
    var lcid_tiER = 0x0473; // Tigrinya, Eritrea
    var lcid_gnPY = 0x0474; // Guarani, Paraguay
    var lcid_hawUS = 0x0475; // Hawaiian, United States
    var lcid_soSO = 0x0477; // Somali, Somalia
    var lcid_iiCN = 0x0478; // Sichuan Yi, China
    var lcid_papAN = 0x0479; // Papiamento, Netherlands Antilles
    var lcid_arnCL = 0x047a; // Mapudungun, Chile
    var lcid_mohCA = 0x047c; // Mohawk, Canada
    var lcid_brFR = 0x047e; // Breton, France
    var lcid_ugCN = 0x0480; // Uighur, China
    var lcid_miNZ = 0x0481; // Maori, New Zealand
    var lcid_ocFR = 0x0482; // Occitan (post 1500), France
    var lcid_coFR = 0x0483; // Corsican, France
    var lcid_gswFR = 0x0484; // Swiss German, France
    var lcid_sahRU = 0x0485; // Yakut, Russian Federation
    var lcid_qutGT = 0x0486; // Guatemala
    var lcid_rwRW = 0x0487; // Kinyarwanda, Rwanda
    var lcid_woSN = 0x0488; // Wolof, Senegal
    var lcid_prsAF = 0x048c; // Dari, Afghanistan
    var lcid_pltMG = 0x048d; // Plateau Malagasy, Madagascar
    var lcid_gdGB = 0x0491; // Scottish Gaelic, United Kingdom
    var lcid_arIQ = 0x0801; // Arabic, Iraq
    var lcid_zhCN = 0x0804; // Chinese, China
    var lcid_deCH = 0x0807; // German, Switzerland
    var lcid_enGB = 0x0809; // English, United Kingdom
    var lcid_esMX = 0x080a; // Spanish, Mexico
    var lcid_frBE = 0x080c; // French, Belgium
    var lcid_itCH = 0x0810; // Italian, Switzerland
    var lcid_nlBE = 0x0813; // Dutch, Belgium
    var lcid_nnNO = 0x0814; // Norwegian Nynorsk, Norway
    var lcid_ptPT = 0x0816; // Portuguese, Portugal
    var lcid_roMO = 0x0818; // Romanian, Macao
    var lcid_ruMO = 0x0819; // Russian, Macao
    var lcid_srLatnCS = 0x081a; // Serbian, Latin, Serbia and Montenegro
    var lcid_svFI = 0x081d; // Swedish, Finland
    var lcid_urIN = 0x0820; // Urdu, India
    var lcid_azCyrlAZ = 0x082c; // Azerbaijani, Cyrillic, Azerbaijan
    var lcid_dsbDE = 0x082e; // Lower Sorbian, Germany
    var lcid_seSE = 0x083b; // Northern Sami, Sweden
    var lcid_gaIE = 0x083c; // Irish, Ireland
    var lcid_msBN = 0x083e; // Malay (macrolanguage), Brunei Darussalam
    var lcid_uzCyrlUZ = 0x0843; // Uzbek, Cyrillic, Uzbekistan
    var lcid_bnBD = 0x0845; // Bengali, Bangladesh
    var lcid_paPK = 0x0846; // Panjabi, Pakistan
    var lcid_mnMongCN = 0x0850; // Mongolian, Mongolian, China
    var lcid_boBT = 0x0851; // Tibetan, Bhutan
    var lcid_sdPK = 0x0859; // Sindhi, Pakistan
    var lcid_iuLatnCA = 0x085d; // Inuktitut, Latin, Canada
    var lcid_tzmLatnDZ = 0x085f; // Central Atlas Tamazight, Latin, Algeria
    var lcid_neIN = 0x0861; // Nepali, India
    var lcid_quzEC = 0x086b; // Cusco Quechua, Ecuador
    var lcid_tiET = 0x0873; // Tigrinya, Ethiopia
    var lcid_arEG = 0x0c01; // Arabic, Egypt
    var lcid_zhHK = 0x0c04; // Chinese, Hong Kong
    var lcid_deAT = 0x0c07; // German, Austria
    var lcid_enAU = 0x0c09; // English, Australia
    var lcid_esES = 0x0c0a; // Spanish, Spain
    var lcid_frCA = 0x0c0c; // French, Canada
    var lcid_srCyrlCS = 0x0c1a; // Serbian, Cyrillic, Serbia and Montenegro
    var lcid_seFI = 0x0c3b; // Northern Sami, Finland
    var lcid_tmzMA = 0x0c5f; // Tamanaku, Morocco
    var lcid_quzPE = 0x0c6b; // Cusco Quechua, Peru
    var lcid_arLY = 0x1001; // Arabic, Libyan Arab Jamahiriya
    var lcid_zhSG = 0x1004; // Chinese, Singapore
    var lcid_deLU = 0x1007; // German, Luxembourg
    var lcid_enCA = 0x1009; // English, Canada
    var lcid_esGT = 0x100a; // Spanish, Guatemala
    var lcid_frCH = 0x100c; // French, Switzerland
    var lcid_hrBA = 0x101a; // Croatian, Bosnia and Herzegovina
    var lcid_smjNO = 0x103b; // Lule Sami, Norway
    var lcid_arDZ = 0x1401; // Arabic, Algeria
    var lcid_zhMO = 0x1404; // Chinese, Macao
    var lcid_deLI = 0x1407; // German, Liechtenstein
    var lcid_enNZ = 0x1409; // English, New Zealand
    var lcid_esCR = 0x140a; // Spanish, Costa Rica
    var lcid_frLU = 0x140c; // French, Luxembourg
    var lcid_bsLatnBA = 0x141a; // Bosnian, Latin, Bosnia and Herzegovina
    var lcid_smjSE = 0x143b; // Lule Sami, Sweden
    var lcid_arMA = 0x1801; // Arabic, Morocco
    var lcid_enIE = 0x1809; // English, Ireland
    var lcid_esPA = 0x180a; // Spanish, Panama
    var lcid_frMC = 0x180c; // French, Monaco
    var lcid_srLatnBA = 0x181a; // Serbian, Latin, Bosnia and Herzegovina
    var lcid_smaNO = 0x183b; // Southern Sami, Norway
    var lcid_arTN = 0x1c01; // Arabic, Tunisia
    var lcid_enZA = 0x1c09; // English, South Africa
    var lcid_esDO = 0x1c0a; // Spanish, Dominican Republic
    var lcid_frWest = 0x1c0c; // French
    var lcid_srCyrlBA = 0x1c1a; // Serbian, Cyrillic, Bosnia and Herzegovina
    var lcid_smaSE = 0x1c3b; // Southern Sami, Sweden
    var lcid_arOM = 0x2001; // Arabic, Oman
    var lcid_enJM = 0x2009; // English, Jamaica
    var lcid_esVE = 0x200a; // Spanish, Venezuela
    var lcid_frRE = 0x200c; // French, Reunion
    var lcid_bsCyrlBA = 0x201a; // Bosnian, Cyrillic, Bosnia and Herzegovina
    var lcid_smsFI = 0x203b; // Skolt Sami, Finland
    var lcid_arYE = 0x2401; // Arabic, Yemen
    var lcid_enCB = 0x2409; // English
    var lcid_esCO = 0x240a; // Spanish, Colombia
    var lcid_frCG = 0x240c; // French, Congo
    var lcid_srLatnRS = 0x241a; // Serbian, Latin, Serbia
    var lcid_smnFI = 0x243b; // Inari Sami, Finland
    var lcid_arSY = 0x2801; // Arabic, Syrian Arab Republic
    var lcid_enBZ = 0x2809; // English, Belize
    var lcid_esPE = 0x280a; // Spanish, Peru
    var lcid_frSN = 0x280c; // French, Senegal
    var lcid_srCyrlRS = 0x281a; // Serbian, Cyrillic, Serbia
    var lcid_arJO = 0x2c01; // Arabic, Jordan
    var lcid_enTT = 0x2c09; // English, Trinidad and Tobago
    var lcid_esAR = 0x2c0a; // Spanish, Argentina
    var lcid_frCM = 0x2c0c; // French, Cameroon
    var lcid_srLatnME = 0x2c1a; // Serbian, Latin, Montenegro
    var lcid_arLB = 0x3001; // Arabic, Lebanon
    var lcid_enZW = 0x3009; // English, Zimbabwe
    var lcid_esEC = 0x300a; // Spanish, Ecuador
    var lcid_frCI = 0x300c; // French, Cote d'Ivoire
    var lcid_srCyrlME = 0x301a; // Serbian, Cyrillic, Montenegro
    var lcid_arKW = 0x3401; // Arabic, Kuwait
    var lcid_enPH = 0x3409; // English, Philippines
    var lcid_esCL = 0x340a; // Spanish, Chile
    var lcid_frML = 0x340c; // French, Mali
    var lcid_arAE = 0x3801; // Arabic, United Arab Emirates
    var lcid_enID = 0x3809; // English, Indonesia
    var lcid_esUY = 0x380a; // Spanish, Uruguay
    var lcid_frMA = 0x380c; // French, Morocco
    var lcid_arBH = 0x3c01; // Arabic, Bahrain
    var lcid_enHK = 0x3c09; // English, Hong Kong
    var lcid_esPY = 0x3c0a; // Spanish, Paraguay
    var lcid_frHT = 0x3c0c; // French, Haiti
    var lcid_arQA = 0x4001; // Arabic, Qatar
    var lcid_enIN = 0x4009; // English, India
    var lcid_esBO = 0x400a; // Spanish, Bolivia
    var lcid_enMY = 0x4409; // English, Malaysia
    var lcid_esSV = 0x440a; // Spanish, El Salvador
    var lcid_enSG = 0x4809; // English, Singapore
    var lcid_esHN = 0x480a; // Spanish, Honduras
    var lcid_esNI = 0x4c0a; // Spanish, Nicaragua
    var lcid_esPR = 0x500a; // Spanish, Puerto Rico
    var lcid_esUS = 0x540a; // Spanish, United States
    var lcid_bsCyrl = 0x641a; // Bosnian, Cyrillic
    var lcid_bsLatn = 0x681a; // Bosnian, Latin
    var lcid_srCyrl = 0x6c1a; // Serbian, Cyrillic
    var lcid_srLatn = 0x701a; // Serbian, Latin
    var lcid_smn = 0x703b; // Inari Sami
    var lcid_azCyrl = 0x742c; // Azerbaijani, Cyrillic
    var lcid_sms = 0x743b; // Skolt Sami
    var lcid_zh = 0x7804; // Chinese
    var lcid_nn = 0x7814; // Norwegian Nynorsk
    var lcid_bs = 0x781a; // Bosnian
    var lcid_azLatn = 0x782c; // Azerbaijani, Latin
    var lcid_sma = 0x783b; // Southern Sami
    var lcid_uzCyrl = 0x7843; // Uzbek, Cyrillic
    var lcid_mnCyrl = 0x7850; // Mongolian, Cyrillic
    var lcid_iuCans = 0x785d; // Inuktitut, Unified Canadian Aboriginal Syllabics
    var lcid_zhHant = 0x7c04; // Chinese, Han (Traditional variant)
    var lcid_nb = 0x7c14; // Norwegian Bokmal
    var lcid_sr = 0x7c1a; // Serbian
    var lcid_tgCyrl = 0x7c28; // Tajik, Cyrillic
    var lcid_dsb = 0x7c2e; // Lower Sorbian
    var lcid_smj = 0x7c3b; // Lule Sami
    var lcid_uzLatn = 0x7c43; // Uzbek, Latin
    var lcid_mnMong = 0x7c50; // Mongolian, Mongolian
    var lcid_iuLatn = 0x7c5d; // Inuktitut, Latin
    var lcid_tzmLatn = 0x7c5f; // Central Atlas Tamazight, Latin
    var lcid_haLatn = 0x7c68; // Hausa, Latin


    /**
	 * @enum {number}
	 */
	var c_oUnicodeRangesLID = {
		Unknown:                                        0,
		Basic_Latin:                                    1,
		Latin_1_Supplement:                             2,
		Latin_Extended_A:                               3,
		Latin_Extended_B:                               4,
		IPA_Extensions:                                 5,
		Spacing_Modifier_Letters:                       6,
		Combining_Diacritical_Marks:                    7,
		Greek_and_Coptic:                               8,
		Cyrillic:                                       9,
		Cyrillic_Supplement:                            10,
		Armenian:                                       11,
		Hebrew:                                         12,
		Arabic:                                         13,
		Syriac:                                         14,
		Arabic_Supplement:                              15,
		Thaana:                                         16,
		NKo:                                            17,
		Samaritan:                                      18,
		Mandaic:                                        19,
		Arabic_Extended_A:                              20,
		Devanagari:                                     21,
		Bengali:                                        22,
		Gurmukhi:                                       23,
		Gujarati:                                       24,
		Oriya:                                          25,
		Tamil:                                          26,
		Telugu:                                         27,
		Kannada:                                        28,
		Malayalam:                                      29,
		Sinhala:                                        30,
		Thai:                                           31,
		Lao:                                            32,
		Tibetan:                                        33,
		Myanmar:                                        34,
		Georgian:                                       35,
		Hangul_Jamo:                                    36,
		Ethiopic:                                       37,
		Ethiopic_Supplement:                            38,
		Cherokee:                                       39,
		Unified_Canadian_Aboriginal_Syllabics:          40,
		Ogham:                                          41,
		Runic:                                          42,
		Tagalog:                                        43,
		Hanunoo:                                        44,
		Buhid:                                          45,
		Tagbanwa:                                       46,
		Khmer:                                          47,
		Mongolian:                                      48,
		Unified_Canadian_Aboriginal_Syllabics_Extended: 49,
		Limbu:                                          50,
		Tai_Le:                                         51,
		New_Tai_Lue:                                    52,
		Khmer_Symbols:                                  53,
		Buginese:                                       54,
		Tai_Tham:                                       55,
		Combining_Diacritical_Marks_Extended:           56,
		Balinese:                                       57,
		Sundanese:                                      58,
		Batak:                                          59,
		Lepcha:                                         60,
		Ol_Chiki:                                       61,
		Cyrillic_Extended_C:                            62,
		Sundanese_Supplement:                           63,
		Vedic_Extensions:                               64,
		Phonetic_Extensions:                            65,
		Phonetic_Extensions_Supplement:                 66,
		Combining_Diacritical_Marks_Supplement:         67,
		Latin_Extended_Additional:                      68,
		Greek_Extended:                                 69,
		General_Punctuation:                            70,
		Superscripts_and_Subscripts:                    71,
		Currency_Symbols:                               72,
		Combining_Diacritical_Marks_for_Symbols:        73,
		Letterlike_Symbols:                             74,
		Number_Forms:                                   75,
		Arrows:                                         76,
		Mathematical_Operators:                         77,
		Miscellaneous_Technical:                        78,
		Control_Pictures:                               79,
		Optical_Character_Recognition:                  80,
		Enclosed_Alphanumerics:                         81,
		Box_Drawing:                                    82,
		Block_Elements:                                 83,
		Geometric_Shapes:                               84,
		Miscellaneous_Symbols:                          85,
		Dingbats:                                       86,
		Miscellaneous_Mathematical_Symbols_A:           87,
		Supplemental_Arrows_A:                          88,
		Braille_Patterns:                               89,
		Supplemental_Arrows_B:                          90,
		Miscellaneous_Mathematical_Symbols_B:           91,
		Supplemental_Mathematical_Operators:            92,
		Miscellaneous_Symbols_and_Arrows:               93,
		Glagolitic:                                     94,
		Latin_Extended_C:                               95,
		Coptic:                                         96,
		Georgian_Supplement:                            97,
		Tifinagh:                                       98,
		Ethiopic_Extended:                              99,
		Cyrillic_Extended_A:                            100,
		Supplemental_Punctuation:                       101,
		CJK_Radicals_Supplement:                        102,
		Kangxi_Radicals:                                103,
		Ideographic_Description_Characters:             104,
		CJK_Symbols_and_Punctuation:                    105,
		Hiragana:                                       106,
		Katakana:                                       107,
		Bopomofo:                                       108,
		Hangul_Compatibility_Jamo:                      109,
		Kanbun:                                         110,
		Bopomofo_Extended:                              111,
		CJK_Strokes:                                    112,
		Katakana_Phonetic_Extensions:                   113,
		Enclosed_CJK_Letters_and_Months:                114,
		CJK_Compatibility:                              115,
		CJK_Unified_Ideographs_Extension:               116,
		Yijing_Hexagram_Symbols:                        117,
		CJK_Unified_Ideographs:                         118,
		Yi_Syllables:                                   119,
		Yi_Radicals:                                    120,
		Lisu:                                           121,
		Vai:                                            122,
		Cyrillic_Extended_B:                            123,
		Bamum:                                          124,
		Modifier_Tone_Letters:                          125,
		Latin_Extended_D:                               126,
		Syloti_Nagri:                                   127,
		Common_Indic_Number_Forms:                      128,
		Phags_pa:                                       129,
		Saurashtra:                                     130,
		Devanagari_Extended:                            131,
		Kayah_Li:                                       132,
		Rejang:                                         133,
		Hangul_Jamo_Extended_A:                         134,
		Javanese:                                       135,
		Myanmar_Extended_B:                             136,
		Cham:                                           137,
		Myanmar_Extended_A:                             138,
		Tai_Viet:                                       139,
		Meetei_Mayek_Extensions:                        140,
		Ethiopic_Extended_A:                            141,
		Latin_Extended_E:                               142,
		Cherokee_Supplement:                            143,
		Meetei_Mayek:                                   144,
		Hangul_Syllables:                               145,
		Hangul_Jamo_Extended_B:                         146,
		High_Surrogates:                                147,
		High_Private_Use_Surrogates:                    148,
		Low_Surrogates:                                 149,
		Private_Use_Area:                               150,
		CJK_Compatibility_Ideographs:                   151,
		Alphabetic_Presentation_Forms:                  152,
		Arabic_Presentation_Forms_A:                    153,
		Variation_Selectors:                            154,
		Vertical_Forms:                                 155,
		Combining_Half_Marks:                           156,
		CJK_Compatibility_Forms:                        157,
		Small_Form_Variants:                            158,
		Arabic_Presentation_Forms_B:                    159,
		Halfwidth_and_Fullwidth_Forms:                  160,
		Specials:                                       161,
		Linear_B_Syllabary:                             162,
		Linear_B_Ideograms:                             163,
		Aegean_Numbers:                                 164,
		Ancient_Greek_Numbers:                          165,
		Ancient_Symbols:                                166,
		Phaistos_Disc:                                  167,
		Lycian:                                         168,
		Carian:                                         169,
		Coptic_Epact_Numbers:                           170,
		Old_Italic:                                     171,
		Gothic:                                         172,
		Old_Permic:                                     173,
		Ugaritic:                                       174,
		Old_Persian:                                    175,
		Deseret:                                        176,
		Shavian:                                        177,
		Osmanya:                                        178,
		Osage:                                          179,
		Elbasan:                                        180,
		Caucasian_Albanian:                             181,
		Linear_A:                                       182,
		Cypriot_Syllabary:                              183,
		Imperial_Aramaic:                               184,
		Palmyrene:                                      185,
		Nabataean:                                      186,
		Hatran:                                         187,
		Phoenician:                                     188,
		Lydian:                                         189,
		Meroitic_Hieroglyphs:                           190,
		Meroitic_Cursive:                               191,
		Kharoshthi:                                     192,
		Old_South_Arabian:                              193,
		Old_North_Arabian:                              194,
		Manichaean:                                     195,
		Avestan:                                        196,
		Inscriptional_Parthian:                         197,
		Inscriptional_Pahlavi:                          198,
		Psalter_Pahlavi:                                199,
		Old_Turkic:                                     200,
		Old_Hungarian:                                  201,
		Rumi_Numeral_Symbols:                           202,
		Brahmi:                                         203,
		Kaithi:                                         204,
		Sora_Sompeng:                                   205,
		Chakma:                                         206,
		Mahajani:                                       207,
		Sharada:                                        208,
		Sinhala_Archaic_Numbers:                        209,
		Khojki:                                         210,
		Multani:                                        211,
		Khudawadi:                                      212,
		Grantha:                                        213,
		Newa:                                           214,
		Tirhuta:                                        215,
		Siddham:                                        216,
		Modi:                                           217,
		Mongolian_Supplement:                           218,
		Takri:                                          219,
		Ahom:                                           220,
		Warang_Citi:                                    221,
		Pau_Cin_Hau:                                    222,
		Bhaiksuki:                                      223,
		Marchen:                                        224,
		Cuneiform:                                      225,
		Cuneiform_Numbers_and_Punctuation:              226,
		Early_Dynastic_Cuneiform:                       227,
		Egyptian_Hieroglyphs:                           228,
		Anatolian_Hieroglyphs:                          229,
		Bamum_Supplement:                               230,
		Mro:                                            231,
		Bassa_Vah:                                      232,
		Pahawh_Hmong:                                   233,
		Miao:                                           234,
		Ideographic_Symbols_and_Punctuation:            235,
		Tangut:                                         236,
		Tangut_Components:                              237,
		Kana_Supplement:                                238,
		Duployan:                                       239,
		Shorthand_Format_Controls:                      240,
		Byzantine_Musical_Symbols:                      241,
		Musical_Symbols:                                242,
		Ancient_Greek_Musical_Notation:                 243,
		Tai_Xuan_Jing_Symbols:                          244,
		Counting_Rod_Numerals:                          245,
		Mathematical_Alphanumeric_Symbols:              246,
		Sutton_SignWriting:                             247,
		Glagolitic_Supplement:                          248,
		Mende_Kikakui:                                  249,
		Adlam:                                          250,
		Arabic_Mathematical_Alphabetic_Symbols:         251,
		Mahjong_Tiles:                                  252,
		Domino_Tiles:                                   253,
		Playing_Cards:                                  254,
		Enclosed_Alphanumeric_Supplement:               255,
		Enclosed_Ideographic_Supplement:                256,
		Miscellaneous_Symbols_and_Pictographs:          257,
		Emoticons:                                      258,
		Ornamental_Dingbats:                            259,
		Transport_and_Map_Symbols:                      260,
		Alchemical_Symbols:                             261,
		Geometric_Shapes_Extended:                      262,
		Supplemental_Arrows_C:                          263,
		Supplemental_Symbols_and_Pictographs:           264,
		CJK_Unified_Ideographs_Extension_B:             265,
		CJK_Unified_Ideographs_Extension_C:             266,
		CJK_Unified_Ideographs_Extension_D:             267,
		CJK_Unified_Ideographs_Extension_E:             268,
		CJK_Compatibility_Ideographs_Supplement:        269,
		Tags:                                           270,
		Variation_Selectors_Supplement:                 271,
		Supplementary_Private_Use_Area_A:               272,
		Supplementary_Private_Use_Area_B:               273
	};

	/**
	 * @enum {number}
	 */
	var c_oCodePagesOS2_1 = {
		Latin_1:        0,
		Latin_2:        1,
		Cyrillic:       2,
		Greek:          3,
		Turkish:        4,
		Hebrew:         5,
		Arabic:         6,
		Windows_Baltic: 7,
		Vietnamese:     8,

		Thai:                16,
		JIS_Japan:           17,
		Chinese_Simplified:  18,
		Korean_Wansung:      19,
		Chinese_Traditional: 20,
		Korean_Johab:        21,

		Macintosh_Character_Set_US_Roman: 29,
		OEM_Character_Set:                30,
		Symbol_Character_Set:             31
	};

	/**
	 * @enum {number}
	 */
	var c_oCodePagesOS2_2 = {
		IBM_Greek:              48 - 32,
		MS_DOS_Russian:         49 - 32,
		MS_DOS_Nordic:          50 - 32,
		Arabic:                 51 - 32,
		MS_DOS_Canadian_French: 52 - 32,
		Hebrew:                 53 - 32,
		MS_DOS_Icelandic:       54 - 32,
		MS_DOS_Portuguese:      55 - 32,
		IBM_Turkish:            56 - 32,
		IBM_Cyrillic:           57 - 32,
		Latin_2:                58 - 32,
		MS_DOS_Baltic:          59 - 32,
		Greek_437:              60 - 32,
		Arabic_708:             61 - 32,
		WE_Latin_1:             62 - 32,
		US:                     63 - 32
	};

	/**
	 * @enum {number}
	 */
	var c_oUnicodeRangeOS2_1 = {
		Basic_Latin:                 0,
		Latin_1_Supplement:          1,
		Latin_Extended_A:            2,
		Latin_Extended_B:            3,
		IPA_Extensions:              4,
		Spacing_Modifier_Letters:    5,
		Combining_Diacritical_Marks: 6,
		Greek_and_Coptic:            7,
		Coptic:                      8,
		Cyrillic:                    9,
		Armenian:                    10,
		Hebrew:                      11,
		Vai:                         12,
		Arabic:                      13,
		NKo:                         14,
		Devanagari:                  15,
		Bengali:                     16,
		Gurmukhi:                    17,
		Gujarati:                    18,
		Oriya:                       19,
		Tamil:                       20,
		Telugu:                      21,
		Kannada:                     22,
		Malayalam:                   23,
		Thai:                        24,
		Lao:                         25,
		Georgian:                    26,
		Balinese:                    27,
		Hangul_Jamo:                 28,
		Latin_Extended_Additional:   29,
		Greek_Extended:              30,
		General_Punctuation:         31
	};

	/**
	 * @enum {number}
	 */
	var c_oUnicodeRangeOS2_2 = {
		Superscripts_And_Subscripts:             32 - 32,
		Currency_Symbols:                        33 - 32,
		Combining_Diacritical_Marks_For_Symbols: 34 - 32,
		Letterlike_Symbols:                      35 - 32,
		Number_Forms:                            36 - 32,
		Arrows:                                  37 - 32,
		Mathematical_Operators:                  38 - 32,
		Miscellaneous_Technical:                 39 - 32,
		Control_Pictures:                        40 - 32,
		Optical_Character_Recognition:           41 - 32,
		Enclosed_Alphanumerics:                  42 - 32,
		Box_Drawing:                             43 - 32,
		Block_Elements:                          44 - 32,
		Geometric_Shapes:                        45 - 32,
		Miscellaneous_Symbols:                   46 - 32,
		Dingbats:                                47 - 32,
		CJK_Symbols_And_Punctuation:             48 - 32,
		Hiragana:                                49 - 32,
		Katakana:                                50 - 32,
		Bopomofo:                                51 - 32,
		Hangul_Compatibility_Jamo:               52 - 32,
		Phags_pa:                                53 - 32,
		Enclosed_CJK_Letters_And_Months:         54 - 32,
		CJK_Compatibility:                       55 - 32,
		Hangul_Syllables:                        56 - 32,
		Non_Plane:                               57 - 32,
		Phoenician:                              58 - 32,
		CJK_Unified_Ideographs:                  59 - 32,
		Private_Use_Area_plane_0:                60 - 32,
		CJK_Strokes:                             61 - 32,
		Alphabetic_Presentation_Forms:           62 - 32,
		Arabic_Presentation_Forms_A:             63 - 32
	};

	/**
	 * @enum {number}
	 */
	var c_oUnicodeRangeOS2_3 = {
		Combining_Half_Marks:                  64 - 64,
		Vertical_Forms:                        65 - 64,
		Small_Form_Variants:                   66 - 64,
		Arabic_Presentation_Forms_B:           67 - 64,
		Halfwidth_And_Fullwidth_Forms:         68 - 64,
		Specials:                              69 - 64,
		Tibetan:                               70 - 64,
		Syriac:                                71 - 64,
		Thaana:                                72 - 64,
		Sinhala:                               73 - 64,
		Myanmar:                               74 - 64,
		Ethiopic:                              75 - 64,
		Cherokee:                              76 - 64,
		Unified_Canadian_Aboriginal_Syllabics: 77 - 64,
		Ogham:                                 78 - 64,
		Runic:                                 79 - 64,
		Khmer:                                 80 - 64,
		Mongolian:                             81 - 64,
		Braille_Patterns:                      82 - 64,
		Yi_Syllables:                          83 - 64,
		Tagalog:                               84 - 64,
		Old_Italic:                            85 - 64,
		Gothic:                                86 - 64,
		Deseret:                               87 - 64,
		Byzantine_Musical_Symbols:             88 - 64,
		Mathematical_Alphanumeric_Symbols:     89 - 64,
		Private_Use_plane_15:                  90 - 64,
		Variation_Selectors:                   91 - 64,
		Tags:                                  92 - 64,
		Limbu:                                 93 - 64,
		Tai_Le:                                94 - 64,
		New_Tai_Lue:                           95 - 64
	};

	/**
	 * @enum {number}
	 */
	var c_oUnicodeRangeOS2_4 = {
		Buginese:                96 - 96,
		Glagolitic:              97 - 96,
		Tifinagh:                98 - 96,
		Yijing_Hexagram_Symbols: 99 - 96,
		Syloti_Nagri:            100 - 96,
		Linear_B_Syllabary:      101 - 96,
		Ancient_Greek_Numbers:   102 - 96,
		Ugaritic:                103 - 96,
		Old_Persian:             104 - 96,
		Shavian:                 105 - 96,
		Osmanya:                 106 - 96,
		Cypriot_Syllabary:       107 - 96,
		Kharoshthi:              108 - 96,
		Tai_Xuan_Jing_Symbols:   109 - 96,
		Cuneiform:               110 - 96,
		Counting_Rod_Numerals:   111 - 96,
		Sundanese:               112 - 96,
		Lepcha:                  113 - 96,
		Ol_Chiki:                114 - 96,
		Saurashtra:              115 - 96,
		Kayah_Li:                116 - 96,
		Rejang:                  117 - 96,
		Cham:                    118 - 96,
		Ancient_Symbols:         119 - 96,
		Phaistos_Disc:           120 - 96,
		Carian:                  121 - 96,
		Domino_Tiles:            122 - 96
	};

	/**
	 * @param {_start} start range value
	 * @param {_end} end range value
	 * @param {_name} not used range name
	 * @param {_lid} language id for ooxml format
	 * @param {_picks} in os/2 font table: [ulUnicodeRange1, ulUnicodeRange2, ulUnicodeRange3, ulUnicodeRange4, ulCodePageRange1, ulCodePageRange2];
	 */
	function CRange(_start, _end, _name, _lid, _picks)
	{
		this.Start = _start;
		this.End = _end;
		this.Name = _name;
		this.Lid = _lid;
		this.Param = _picks;
	};

	var c_oUnicodeRanges = [
		new CRange(0x0020, 0x007E, c_oUnicodeRangesLID.Basic_Latin, lcid_enUS, [(1 << c_oUnicodeRangeOS2_1.Basic_Latin), 0, 0, 0, (1 << c_oCodePagesOS2_1.Latin_1), 0]),
		new CRange(0x00A0, 0x00FF, c_oUnicodeRangesLID.Latin_1_Supplement, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.Basic_Latin) | (1 << c_oUnicodeRangeOS2_1.Latin_1_Supplement), 0, 0, 0, (1 << c_oCodePagesOS2_1.Latin_1), 0]),
		new CRange(0x0100, 0x017F, c_oUnicodeRangesLID.Latin_Extended_A, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.Basic_Latin) | (1 << c_oUnicodeRangeOS2_1.Latin_Extended_A), 0, 0, 0, (1 << c_oCodePagesOS2_1.Latin_1) | (1 << c_oCodePagesOS2_1.Latin_2) | (1 << c_oCodePagesOS2_1.Turkish) | (1 << c_oCodePagesOS2_1.Windows_Baltic), 0]),
		new CRange(0x0180, 0x024F, c_oUnicodeRangesLID.Latin_Extended_B, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.Basic_Latin) | (1 << c_oUnicodeRangeOS2_1.Latin_Extended_B), 0, 0, 0, (1 << c_oCodePagesOS2_1.Latin_1) | (1 << c_oCodePagesOS2_1.Latin_2) | (1 << c_oCodePagesOS2_1.Turkish) | (1 << c_oCodePagesOS2_1.Windows_Baltic), 0]),
		new CRange(0x0250, 0x02AF, c_oUnicodeRangesLID.IPA_Extensions, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.IPA_Extensions), 0, 0, 0, 0, 0]),
		new CRange(0x02B0, 0x02FF, c_oUnicodeRangesLID.Spacing_Modifier_Letters, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.Spacing_Modifier_Letters), 0, 0, 0, 0, 0]),
		new CRange(0x0300, 0x036F, c_oUnicodeRangesLID.Combining_Diacritical_Marks, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.Combining_Diacritical_Marks), 0, 0, 0, 0, 0]),
		new CRange(0x0370, 0x03FF, c_oUnicodeRangesLID.Greek_and_Coptic, lcid_elGR, [(1 << c_oUnicodeRangeOS2_1.Greek_and_Coptic), 0, 0, 0, (1 << c_oCodePagesOS2_1.Greek), 0]),
		new CRange(0x0400, 0x04FF, c_oUnicodeRangesLID.Cyrillic, lcid_ruRU, [(1 << c_oUnicodeRangeOS2_1.Cyrillic), 0, 0, 0, (1 << c_oCodePagesOS2_1.Cyrillic), 0]),
		new CRange(0x0500, 0x052F, c_oUnicodeRangesLID.Cyrillic_Supplement, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.Cyrillic), 0, 0, 0, (1 << c_oCodePagesOS2_1.Cyrillic), 0]),
		new CRange(0x0530, 0x058F, c_oUnicodeRangesLID.Armenian, lcid_hyAM, [(1 << c_oUnicodeRangeOS2_1.Armenian), 0, 0, 0, 0, 0]),
		new CRange(0x0590, 0x05FF, c_oUnicodeRangesLID.Hebrew, lcid_heIL, [(1 << c_oUnicodeRangeOS2_1.Hebrew), 0, 0, 0, (1 << c_oCodePagesOS2_1.Hebrew), (1 << c_oCodePagesOS2_2.Hebrew)]),
		new CRange(0x0600, 0x06FF, c_oUnicodeRangesLID.Arabic, lcid_ar, [(1 << c_oUnicodeRangeOS2_1.Arabic), 0, 0, 0, (1 << c_oCodePagesOS2_1.Arabic), (1 << c_oCodePagesOS2_2.Arabic) | (1 << c_oCodePagesOS2_2.Arabic_708)]),
		new CRange(0x0700, 0x074F, c_oUnicodeRangesLID.Syriac, lcid_syrSY, [(1 << c_oUnicodeRangeOS2_1.Arabic), 0, 0, 0, (1 << c_oCodePagesOS2_1.Arabic), (1 << c_oCodePagesOS2_2.Arabic) | (1 << c_oCodePagesOS2_2.Arabic_708)]),
		new CRange(0x0750, 0x077F, c_oUnicodeRangesLID.Arabic_Supplement, lcid_ar, [(1 << c_oUnicodeRangeOS2_1.Arabic), 0, 0, 0, (1 << c_oCodePagesOS2_1.Arabic), (1 << c_oCodePagesOS2_2.Arabic) | (1 << c_oCodePagesOS2_2.Arabic_708)]),
		new CRange(0x0780, 0x07BF, c_oUnicodeRangesLID.Thaana, lcid_dvMV, [(1 << c_oUnicodeRangeOS2_1.Arabic), 0, 0, 0, (1 << c_oCodePagesOS2_1.Arabic), (1 << c_oCodePagesOS2_2.Arabic) | (1 << c_oCodePagesOS2_2.Arabic_708)]),
		new CRange(0x07C0, 0x07FF, c_oUnicodeRangesLID.NKo, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.NKo), 0, 0, 0, 0, 0]),
		new CRange(0x0800, 0x083F, c_oUnicodeRangesLID.Samaritan, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.Hebrew), 0, 0, 0, (1 << c_oCodePagesOS2_1.Hebrew), 0]),
		new CRange(0x0840, 0x085F, c_oUnicodeRangesLID.Mandaic, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.Arabic), 0, 0, 0, (1 << c_oCodePagesOS2_1.Arabic), (1 << c_oCodePagesOS2_2.Arabic) | (1 << c_oCodePagesOS2_2.Arabic_708)]),
		new CRange(0x08A0, 0x08FF, c_oUnicodeRangesLID.Arabic_Extended_A, lcid_ar, [(1 << c_oUnicodeRangeOS2_1.Arabic), 0, 0, 0, (1 << c_oCodePagesOS2_1.Arabic), (1 << c_oCodePagesOS2_2.Arabic) | (1 << c_oCodePagesOS2_2.Arabic_708)]),
		new CRange(0x0900, 0x097F, c_oUnicodeRangesLID.Devanagari, lcid_hiIN, [(1 << c_oUnicodeRangeOS2_1.Devanagari), 0, 0, 0, 0, 0]),
		new CRange(0x0980, 0x09FF, c_oUnicodeRangesLID.Bengali, lcid_bnIN, [(1 << c_oUnicodeRangeOS2_1.Bengali), 0, 0, 0, 0, 0]),
		new CRange(0x0A00, 0x0A7F, c_oUnicodeRangesLID.Gurmukhi, lcid_paIN, [(1 << c_oUnicodeRangeOS2_1.Gurmukhi), 0, 0, 0, 0, 0]),
		new CRange(0x0A80, 0x0AFF, c_oUnicodeRangesLID.Gujarati, lcid_guIN, [(1 << c_oUnicodeRangeOS2_1.Gujarati), 0, 0, 0, 0, 0]),
		new CRange(0x0B00, 0x0B7F, c_oUnicodeRangesLID.Oriya, lcid_orIN, [(1 << c_oUnicodeRangeOS2_1.Oriya), 0, 0, 0, 0, 0]),
		new CRange(0x0B80, 0x0BFF, c_oUnicodeRangesLID.Tamil, lcid_taIN, [(1 << c_oUnicodeRangeOS2_1.Tamil), 0, 0, 0, 0, 0]),
		new CRange(0x0C00, 0x0C7F, c_oUnicodeRangesLID.Telugu, lcid_teIN, [(1 << c_oUnicodeRangeOS2_1.Telugu), 0, 0, 0, 0, 0]),
		new CRange(0x0C80, 0x0CFF, c_oUnicodeRangesLID.Kannada, lcid_knIN, [(1 << c_oUnicodeRangeOS2_1.Kannada), 0, 0, 0, 0, 0]),
		new CRange(0x0D00, 0x0D7F, c_oUnicodeRangesLID.Malayalam, lcid_mlIN, [(1 << c_oUnicodeRangeOS2_1.Malayalam), 0, 0, 0, 0, 0]),
		new CRange(0x0D80, 0x0DFF, c_oUnicodeRangesLID.Sinhala, lcid_siLK, [0, 0, (1 << c_oUnicodeRangeOS2_3.Sinhala), 0, 0, 0]),
		new CRange(0x0E00, 0x0E7F, c_oUnicodeRangesLID.Thai, lcid_thTH, [(1 << c_oUnicodeRangeOS2_1.Thai), 0, 0, 0, (1 << c_oCodePagesOS2_1.Thai), 0]),
		new CRange(0x0E80, 0x0EFF, c_oUnicodeRangesLID.Lao, lcid_loLA, [(1 << c_oUnicodeRangeOS2_1.Lao), 0, 0, 0, 0, 0]),
		new CRange(0x0F00, 0x0FFF, c_oUnicodeRangesLID.Tibetan, lcid_boBT, [0, 0, (1 << c_oUnicodeRangeOS2_3.Tibetan), 0, 0, 0]),
		new CRange(0x1000, 0x109F, c_oUnicodeRangesLID.Myanmar, lcid_myMM, [0, 0, (1 << c_oUnicodeRangeOS2_3.Myanmar), 0, 0, 0]),
		new CRange(0x10A0, 0x10FF, c_oUnicodeRangesLID.Georgian, lcid_kaGE, [(1 << c_oUnicodeRangeOS2_1.Georgian), 0, 0, 0, 0, 0]),
		new CRange(0x1100, 0x11FF, c_oUnicodeRangesLID.Hangul_Jamo, lcid_koKR, [(1 << c_oUnicodeRangeOS2_1.Hangul_Jamo), 0, 0, 0, (1 << c_oCodePagesOS2_1.Korean_Wansung), 0]),
		new CRange(0x1200, 0x137F, c_oUnicodeRangesLID.Ethiopic, lcid_gazET, [0, 0, (1 << c_oUnicodeRangeOS2_3.Ethiopic), 0, 0, 0]),
		new CRange(0x1380, 0x139F, c_oUnicodeRangesLID.Ethiopic_Supplement, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.Ethiopic), 0, 0, 0]),
		new CRange(0x13A0, 0x13FF, c_oUnicodeRangesLID.Cherokee, lcid_chrUS, [0, 0, (1 << c_oUnicodeRangeOS2_3.Cherokee), 0, 0, 0]),
		new CRange(0x1400, 0x167F, c_oUnicodeRangesLID.Unified_Canadian_Aboriginal_Syllabics, lcid_iuCansCA, [0, 0, (1 << c_oUnicodeRangeOS2_3.Unified_Canadian_Aboriginal_Syllabics), 0, 0, 0]),
		new CRange(0x1680, 0x169F, c_oUnicodeRangesLID.Ogham, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.Ogham), 0, 0, 0]),
		new CRange(0x16A0, 0x16FF, c_oUnicodeRangesLID.Runic, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.Runic), 0, 0, 0]),
		new CRange(0x1700, 0x171F, c_oUnicodeRangesLID.Tagalog, lcid_filPH, [0, 0, (1 << c_oUnicodeRangeOS2_3.Tagalog), 0, 0, 0]),
		new CRange(0x1720, 0x173F, c_oUnicodeRangesLID.Hanunoo, lcid_filPH, [0, 0, (1 << c_oUnicodeRangeOS2_3.Tagalog), 0, 0, 0]),
		new CRange(0x1740, 0x175F, c_oUnicodeRangesLID.Buhid, lcid_filPH, [0, 0, (1 << c_oUnicodeRangeOS2_3.Tagalog), 0, 0, 0]),
		new CRange(0x1760, 0x177F, c_oUnicodeRangesLID.Tagbanwa, lcid_filPH, [0, 0, (1 << c_oUnicodeRangeOS2_3.Tagalog), 0, 0, 0]),
		new CRange(0x1780, 0x17FF, c_oUnicodeRangesLID.Khmer, lcid_kmKH, [0, 0, (1 << c_oUnicodeRangeOS2_3.Khmer), 0, 0, 0]),
		new CRange(0x1800, 0x18AF, c_oUnicodeRangesLID.Mongolian, lcid_mnMN, [0, 0, (1 << c_oUnicodeRangeOS2_3.Mongolian), 0, 0, 0]),
		new CRange(0x18B0, 0x18FF, c_oUnicodeRangesLID.Unified_Canadian_Aboriginal_Syllabics_Extended, lcid_iuCansCA, [0, 0, (1 << c_oUnicodeRangeOS2_3.Unified_Canadian_Aboriginal_Syllabics), 0, 0, 0]),
		new CRange(0x1900, 0x194F, c_oUnicodeRangesLID.Limbu, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.Limbu), 0, 0, 0]),
		new CRange(0x1950, 0x197F, c_oUnicodeRangesLID.Tai_Le, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.Tai_Le), 0, 0, 0]),
		new CRange(0x1980, 0x19DF, c_oUnicodeRangesLID.New_Tai_Lue, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.New_Tai_Lue), 0, 0, 0]),
		new CRange(0x19E0, 0x19FF, c_oUnicodeRangesLID.Khmer_Symbols, lcid_kmKH, [0, 0, (1 << c_oUnicodeRangeOS2_3.Khmer), 0, 0, 0]),
		new CRange(0x1A00, 0x1A1F, c_oUnicodeRangesLID.Buginese, lcid_unknown,  [0, 0, (1 << c_oUnicodeRangeOS2_3.Buginese), 0, 0, 0]),
		new CRange(0x1A20, 0x1AAF, c_oUnicodeRangesLID.Tai_Tham, lcid_thTH, [0, 0, (1 << c_oUnicodeRangeOS2_3.Tai_Le), 0, 0, 0]),
		new CRange(0x1AB0, 0x1AFF, c_oUnicodeRangesLID.Combining_Diacritical_Marks_Extended, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.Combining_Diacritical_Marks), 0, 0, 0, 0, 0]),
		new CRange(0x1B00, 0x1B7F, c_oUnicodeRangesLID.Balinese, lcid_idID, [(1 << c_oUnicodeRangeOS2_1.Balinese), 0, 0, 0, 0, 0]),
		new CRange(0x1B80, 0x1BBF, c_oUnicodeRangesLID.Sundanese, lcid_idID, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Sundanese), 0, 0]),
		new CRange(0x1BC0, 0x1BFF, c_oUnicodeRangesLID.Batak, lcid_idID, []),
		new CRange(0x1C00, 0x1C4F, c_oUnicodeRangesLID.Lepcha, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Lepcha), 0, 0]),
		new CRange(0x1C50, 0x1C7F, c_oUnicodeRangesLID.Ol_Chiki, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Ol_Chiki), 0, 0]),
		new CRange(0x1C80, 0x1C8F, c_oUnicodeRangesLID.Cyrillic_Extended_C, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.Cyrillic), 0, 0, 0, 0, 0]),
		new CRange(0x1CC0, 0x1CCF, c_oUnicodeRangesLID.Sundanese_Supplement, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Sundanese), 0, 0]),
		new CRange(0x1CD0, 0x1CFF, c_oUnicodeRangesLID.Vedic_Extensions, lcid_unknown, []),
		new CRange(0x1D00, 0x1D7F, c_oUnicodeRangesLID.Phonetic_Extensions, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.IPA_Extensions), 0, 0, 0, 0, 0]),
		new CRange(0x1D80, 0x1DBF, c_oUnicodeRangesLID.Phonetic_Extensions_Supplement, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.IPA_Extensions), 0, 0, 0, 0, 0]),
		new CRange(0x1DC0, 0x1DFF, c_oUnicodeRangesLID.Combining_Diacritical_Marks_Supplement, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.Combining_Diacritical_Marks), 0, 0, 0, 0, 0]),
		new CRange(0x1E00, 0x1EFF, c_oUnicodeRangesLID.Latin_Extended_Additional, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.Latin_Extended_Additional), 0, 0, 0, (1 << c_oCodePagesOS2_1.Vietnamese), 0]),
		new CRange(0x1F00, 0x1FFF, c_oUnicodeRangesLID.Greek_Extended, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.Greek_Extended), 0, 0, 0, 0, 0]),
		new CRange(0x2000, 0x206F, c_oUnicodeRangesLID.General_Punctuation, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.Punctuation), 0, 0, 0, 0, 0]),
		new CRange(0x2070, 0x209F, c_oUnicodeRangesLID.Superscripts_and_Subscripts, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Superscripts_And_Subscripts), 0, 0, 0, 0]),
		new CRange(0x20A0, 0x20CF, c_oUnicodeRangesLID.Currency_Symbols, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Currency_Symbols), 0, 0, 0, 0]),
		new CRange(0x20D0, 0x20FF, c_oUnicodeRangesLID.Combining_Diacritical_Marks_for_Symbols, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Combining_Diacritical_Marks_For_Symbols), 0, 0, 0, 0]),
		new CRange(0x2100, 0x214F, c_oUnicodeRangesLID.Letterlike_Symbols, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Letterlike_Symbols), 0, 0, 0, 0]),
		new CRange(0x2150, 0x218F, c_oUnicodeRangesLID.Number_Forms, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Number_Forms), 0, 0, 0, 0]),
		new CRange(0x2190, 0x21FF, c_oUnicodeRangesLID.Arrows, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Arrows), 0, 0, 0, 0]),
		new CRange(0x2200, 0x22FF, c_oUnicodeRangesLID.Mathematical_Operators, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Mathematical_Operators), 0, 0, 0, 0]),
		new CRange(0x2300, 0x23FF, c_oUnicodeRangesLID.Miscellaneous_Technical, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Miscellaneous_Technical), 0, 0, 0, 0]),
		new CRange(0x2400, 0x243F, c_oUnicodeRangesLID.Control_Pictures, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Control_Pictures), 0, 0, 0, 0]),
		new CRange(0x2440, 0x245F, c_oUnicodeRangesLID.Optical_Character_Recognition, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Optical_Character_Recognition), 0, 0, 0, 0]),
		new CRange(0x2460, 0x24FF, c_oUnicodeRangesLID.Enclosed_Alphanumerics, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Enclosed_Alphanumerics), 0, 0, 0, 0]),
		new CRange(0x2500, 0x257F, c_oUnicodeRangesLID.Box_Drawing, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Box_Drawing), 0, 0, 0, 0]),
		new CRange(0x2580, 0x259F, c_oUnicodeRangesLID.Block_Elements, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Block_Elements), 0, 0, 0, 0]),
		new CRange(0x25A0, 0x25FF, c_oUnicodeRangesLID.Geometric_Shapes, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Geometric_Shapes), 0, 0, 0, 0]),
		new CRange(0x2600, 0x26FF, c_oUnicodeRangesLID.Miscellaneous_Symbols, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Miscellaneous_Symbols), 0, 0, 0, 0]),
		new CRange(0x2700, 0x27BF, c_oUnicodeRangesLID.Dingbats, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Dingbats), 0, 0, 0, 0]),
		new CRange(0x27C0, 0x27EF, c_oUnicodeRangesLID.Miscellaneous_Mathematical_Symbols_A, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Mathematical_Operators), 0, 0, 0, 0]),
		new CRange(0x27F0, 0x27FF, c_oUnicodeRangesLID.Supplemental_Arrows_A, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Arrows), 0, 0, 0, 0]),
		new CRange(0x2800, 0x28FF, c_oUnicodeRangesLID.Braille_Patterns, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.Braille_Patterns), 0, 0, 0]),
		new CRange(0x2900, 0x297F, c_oUnicodeRangesLID.Supplemental_Arrows_B, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Arrows), 0, 0, 0, 0]),
		new CRange(0x2980, 0x29FF, c_oUnicodeRangesLID.Miscellaneous_Mathematical_Symbols_B, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Mathematical_Operators), 0, 0, 0, 0]),
		new CRange(0x2A00, 0x2AFF, c_oUnicodeRangesLID.Supplemental_Mathematical_Operators, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Mathematical_Operators), 0, 0, 0, 0]),
		new CRange(0x2B00, 0x2BFF, c_oUnicodeRangesLID.Miscellaneous_Symbols_and_Arrows, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Arrows), 0, 0, 0, 0]),
		new CRange(0x2C00, 0x2C5F, c_oUnicodeRangesLID.Glagolitic, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_2.Glagolitic), 0, 0]),
		new CRange(0x2C60, 0x2C7F, c_oUnicodeRangesLID.Latin_Extended_C, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.Latin_Extended_Additional), 0, 0, 0, 0, 0]),
		new CRange(0x2C80, 0x2CFF, c_oUnicodeRangesLID.Coptic, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.Coptic), 0, 0, 0, 0, 0]),
		new CRange(0x2D00, 0x2D2F, c_oUnicodeRangesLID.Georgian_Supplement, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.Georgian), 0, 0, 0, 0, 0]),
		new CRange(0x2D30, 0x2D7F, c_oUnicodeRangesLID.Tifinagh, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Tifinagh), 0, 0]),
		new CRange(0x2D80, 0x2DDF, c_oUnicodeRangesLID.Ethiopic_Extended, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.Ethiopic), 0, 0, 0]),
		new CRange(0x2DE0, 0x2DFF, c_oUnicodeRangesLID.Cyrillic_Extended_A, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.Cyrillic), 0, 0, 0, (1 << c_oCodePagesOS2_1.Cyrillic), 0]),
		new CRange(0x2E00, 0x2E7F, c_oUnicodeRangesLID.Supplemental_Punctuation, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.General_Punctuation), 0, 0, 0, 0, 0]),
		new CRange(0x2E80, 0x2EFF, c_oUnicodeRangesLID.CJK_Radicals_Supplement, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.CJK_Unified_Ideographs), 0, 0, 0, 0]),
		new CRange(0x2F00, 0x2FDF, c_oUnicodeRangesLID.Kangxi_Radicals, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.CJK_Unified_Ideographs), 0, 0, 0, 0]),
		new CRange(0x2FF0, 0x2FFF, c_oUnicodeRangesLID.Ideographic_Description_Characters, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.CJK_Unified_Ideographs), 0, 0, 0, 0]),
		new CRange(0x3000, 0x303F, c_oUnicodeRangesLID.CJK_Symbols_and_Punctuation, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.CJK_Symbols_And_Punctuation), 0, 0, (1 << c_oCodePagesOS2_1.JIS_Japan) | (1 << c_oCodePagesOS2_1.OEM_Character_Set), 0]),
		new CRange(0x3040, 0x309F, c_oUnicodeRangesLID.Hiragana, lcid_jaJP, [0, (1 << c_oUnicodeRangeOS2_2.Hiragana), 0, 0, 0, 0]),
		new CRange(0x30A0, 0x30FF, c_oUnicodeRangesLID.Katakana, lcid_jaJP, [0, (1 << c_oUnicodeRangeOS2_2.Katakana), 0, 0, 0, 0]),
		new CRange(0x3100, 0x312F, c_oUnicodeRangesLID.Bopomofo, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Bopomofo), 0, 0, 0, 0]),
		new CRange(0x3130, 0x318F, c_oUnicodeRangesLID.Hangul_Compatibility_Jamo, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Hangul_Compatibility_Jamo), 0, 0, (1 << c_oCodePagesOS2_1.Korean_Wansung), 0]),
		new CRange(0x3190, 0x319F, c_oUnicodeRangesLID.Kanbun, lcid_zhCN, [0, (1 << c_oUnicodeRangeOS2_2.CJK_Unified_Ideographs), 0, 0, 0, 0]),
		new CRange(0x31A0, 0x31BF, c_oUnicodeRangesLID.Bopomofo_Extended, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Bopomofo), 0, 0, 0, 0]),
		new CRange(0x31C0, 0x31EF, c_oUnicodeRangesLID.CJK_Strokes, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.CJK_Strokes), 0, 0, 0, 0]),
		new CRange(0x31F0, 0x31FF, c_oUnicodeRangesLID.Katakana_Phonetic_Extensions, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Katakana), 0, 0, 0, 0]),
		new CRange(0x3200, 0x32FF, c_oUnicodeRangesLID.Enclosed_CJK_Letters_and_Months, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Enclosed_CJK_Letters_And_Months), 0, 0, 0, 0]),
		new CRange(0x3300, 0x33FF, c_oUnicodeRangesLID.CJK_Compatibility, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.CJK_Compatibility), 0, 0, 0, 0]),
		new CRange(0x3400, 0x4DBF, c_oUnicodeRangesLID.CJK_Unified_Ideographs_Extension, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.CJK_Unified_Ideographs), 0, 0, (1 << c_oCodePagesOS2_1.Chinese_Simplified) | (1 << c_oCodePagesOS2_1.Chinese_Traditional), 0]),
		new CRange(0x4DC0, 0x4DFF, c_oUnicodeRangesLID.Yijing_Hexagram_Symbols, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Yijing_Hexagram_Symbols), (1 << c_oCodePagesOS2_1.Chinese_Simplified) | (1 << c_oCodePagesOS2_1.Chinese_Traditional), 0]),
		new CRange(0x4E00, 0x9FFF, c_oUnicodeRangesLID.CJK_Unified_Ideographs, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.CJK_Unified_Ideographs), 0, 0, (1 << c_oCodePagesOS2_1.Chinese_Simplified) | (1 << c_oCodePagesOS2_1.Chinese_Traditional) | (1 << c_oCodePagesOS2_1.JIS_Japan) | (1 << c_oCodePagesOS2_1.OEM_Character_Set), 0]),
		new CRange(0xA000, 0xA48F, c_oUnicodeRangesLID.Yi_Syllables, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.Yi_Syllables), 0, 0, 0]),
		new CRange(0xA490, 0xA4CF, c_oUnicodeRangesLID.Yi_Radicals, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.Yi_Radicals), 0, 0, 0]),
		new CRange(0xA4D0, 0xA4FF, c_oUnicodeRangesLID.Lisu, lcid_unknown, []),
		new CRange(0xA500, 0xA63F, c_oUnicodeRangesLID.Vai, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.Vai), 0, 0, 0, 0, 0]),
		new CRange(0xA640, 0xA69F, c_oUnicodeRangesLID.Cyrillic_Extended_B, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.Cyrillic), 0, 0, 0, (1 << c_oCodePagesOS2_1.Cyrillic), 0]),
		new CRange(0xA6A0, 0xA6FF, c_oUnicodeRangesLID.Bamum, lcid_unknown, []),
		new CRange(0xA700, 0xA71F, c_oUnicodeRangesLID.Modifier_Tone_Letters, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.Spacing_Modifier_Letters), 0, 0, 0, 0, 0]),
		new CRange(0xA720, 0xA7FF, c_oUnicodeRangesLID.Latin_Extended_D, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.Latin_Extended_Additional), 0, 0, 0, 0, 0]),
		new CRange(0xA800, 0xA82F, c_oUnicodeRangesLID.Syloti_Nagri, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Syloti_Nagri), 0, 0]),
		new CRange(0xA830, 0xA83F, c_oUnicodeRangesLID.Common_Indic_Number_Forms, lcid_unknown, []),
		new CRange(0xA840, 0xA87F, c_oUnicodeRangesLID.Phags_pa, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Phags_pa), 0, 0, 0, 0]),
		new CRange(0xA880, 0xA8DF, c_oUnicodeRangesLID.Saurashtra, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Saurashtra), 0, 0]),
		new CRange(0xA8E0, 0xA8FF, c_oUnicodeRangesLID.Devanagari_Extended, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.Devanagari), 0, 0, 0, 0, 0]),
		new CRange(0xA900, 0xA92F, c_oUnicodeRangesLID.Kayah_Li, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Kayah_Li), 0, 0]),
		new CRange(0xA930, 0xA95F, c_oUnicodeRangesLID.Rejang, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Rejang), 0, 0]),
		new CRange(0xA960, 0xA97F, c_oUnicodeRangesLID.Hangul_Jamo_Extended_A, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.Hangul_Jamo), 0, 0, 0, 0, 0]),
		new CRange(0xA980, 0xA9DF, c_oUnicodeRangesLID.Javanese, lcid_idID, []),
		new CRange(0xA9E0, 0xA9FF, c_oUnicodeRangesLID.Myanmar_Extended_B, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.Myanmar), 0, 0, 0]),
		new CRange(0xAA00, 0xAA5F, c_oUnicodeRangesLID.Cham, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Cham), 0, 0]),
		new CRange(0xAA60, 0xAA7F, c_oUnicodeRangesLID.Myanmar_Extended_A, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.Myanmar), 0, 0, 0]),
		new CRange(0xAA80, 0xAADF, c_oUnicodeRangesLID.Tai_Viet, lcid_unknown, []),
		new CRange(0xAAE0, 0xAAFF, c_oUnicodeRangesLID.Meetei_Mayek_Extensions, lcid_unknown, []),
		new CRange(0xAB00, 0xAB2F, c_oUnicodeRangesLID.Ethiopic_Extended_A, lcid_unknown, []),
		new CRange(0xAB30, 0xAB6F, c_oUnicodeRangesLID.Latin_Extended_E, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.Latin_Extended_Additional), 0, 0, 0, 0, 0]),
		new CRange(0xAB70, 0xABBF, c_oUnicodeRangesLID.Cherokee_Supplement, lcid_unknown, []),
		new CRange(0xABC0, 0xABFF, c_oUnicodeRangesLID.Meetei_Mayek, lcid_unknown, []),
		new CRange(0xAC00, 0xD7AF, c_oUnicodeRangesLID.Hangul_Syllables, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Hangul_Syllables), 0, 0, (1 << c_oCodePagesOS2_1.Korean_Wansung), 0]),
		new CRange(0xD7B0, 0xD7FF, c_oUnicodeRangesLID.Hangul_Jamo_Extended_B, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.Hangul_Jamo), 0, 0, 0, 0, 0]),
		new CRange(0xD800, 0xDB7F, c_oUnicodeRangesLID.High_Surrogates, lcid_unknown, []),
		new CRange(0xDB80, 0xDBFF, c_oUnicodeRangesLID.High_Private_Use_Surrogates, lcid_unknown, []),
		new CRange(0xDC00, 0xDFFF, c_oUnicodeRangesLID.Low_Surrogates, lcid_unknown, []),
		new CRange(0xE000, 0xF8FF, c_oUnicodeRangesLID.Private_Use_Area, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Private_Use_Area_plane_0), 0, 0, 0, 0]),
		new CRange(0xF900, 0xFAFF, c_oUnicodeRangesLID.CJK_Compatibility_Ideographs, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.CJK_Compatibility_Ideographs), 0, 0, (1 << c_oCodePagesOS2_1.Chinese_Simplified) | (1 << c_oCodePagesOS2_1.Chinese_Traditional), 0]),
		new CRange(0xFB00, 0xFB4F, c_oUnicodeRangesLID.Alphabetic_Presentation_Forms, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Alphabetic_Presentation_Forms), 0, 0, 0, 0]),
		new CRange(0xFB50, 0xFDFF, c_oUnicodeRangesLID.Arabic_Presentation_Forms_A, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Arabic_Presentation_Forms_A), 0, 0, (1 << c_oCodePagesOS2_1.Arabic), (1 << c_oCodePagesOS2_2.Arabic) | (1 << c_oCodePagesOS2_2.Arabic_708)]),
		new CRange(0xFE00, 0xFE0F, c_oUnicodeRangesLID.Variation_Selectors, lcid_unknown,  [0, 0, (1 << c_oUnicodeRangeOS2_3.Variation_Selectors), 0, 0, 0]),
		new CRange(0xFE10, 0xFE1F, c_oUnicodeRangesLID.Vertical_Forms, lcid_unknown,  [0, 0, (1 << c_oUnicodeRangeOS2_3.Vertical_Forms), 0, 0, 0]),
		new CRange(0xFE20, 0xFE2F, c_oUnicodeRangesLID.Combining_Half_Marks, lcid_unknown,  [0, 0, (1 << c_oUnicodeRangeOS2_3.Combining_Half_Marks), 0, 0, 0]),
		new CRange(0xFE30, 0xFE4F, c_oUnicodeRangesLID.CJK_Compatibility_Forms, lcid_unknown,  [0, 0, (1 << c_oUnicodeRangeOS2_3.Vertical_Forms), 0, 0, 0]),
		new CRange(0xFE50, 0xFE6F, c_oUnicodeRangesLID.Small_Form_Variants, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.Small_Form_Variants), 0, 0, 0]),
		new CRange(0xFE70, 0xFEFF, c_oUnicodeRangesLID.Arabic_Presentation_Forms_B, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.Arabic_Presentation_Forms_B), 0, (1 << c_oCodePagesOS2_1.Arabic), (1 << c_oCodePagesOS2_2.Arabic) | (1 << c_oCodePagesOS2_2.Arabic_708)]),
		new CRange(0xFF00, 0xFFEF, c_oUnicodeRangesLID.Halfwidth_and_Fullwidth_Forms, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.Halfwidth_And_Fullwidth_Forms), 0, (1 << c_oCodePagesOS2_1.Korean_Wansung) | (1 << c_oCodePagesOS2_1.Chinese_Simplified) | (1 << c_oCodePagesOS2_1.Chinese_Traditional) | (1 << c_oCodePagesOS2_1.JIS_Japan) | (1 << c_oCodePagesOS2_1.OEM_Character_Set), 0]),
		new CRange(0xFFF0, 0xFFFF, c_oUnicodeRangesLID.Specials, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.Specials), 0, 0, 0]),
		new CRange(0x10000, 0x1007F, c_oUnicodeRangesLID.Linear_B_Syllabary, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Linear_B_Syllabary), 0, 0]),
		new CRange(0x10080, 0x100FF, c_oUnicodeRangesLID.Linear_B_Ideograms, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Linear_B_Syllabary), 0, 0]),
		new CRange(0x10100, 0x1013F, c_oUnicodeRangesLID.Aegean_Numbers, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Linear_B_Syllabary), 0, 0]),
		new CRange(0x10140, 0x1018F, c_oUnicodeRangesLID.Ancient_Greek_Numbers, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Ancient_Greek_Numbers), 0, 0]),
		new CRange(0x10190, 0x101CF, c_oUnicodeRangesLID.Ancient_Symbols, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Ancient_Symbols), 0, 0]),
		new CRange(0x101D0, 0x101FF, c_oUnicodeRangesLID.Phaistos_Disc, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Phaistos_Disc), 0, 0]),
		new CRange(0x10280, 0x1029F, c_oUnicodeRangesLID.Lycian, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Carian), 0, 0]),
		new CRange(0x102A0, 0x102DF, c_oUnicodeRangesLID.Carian, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Carian), 0, 0]),
		new CRange(0x102E0, 0x102FF, c_oUnicodeRangesLID.Coptic_Epact_Numbers, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.Coptic), 0, 0, 0, 0, 0]),
		new CRange(0x10300, 0x1032F, c_oUnicodeRangesLID.Old_Italic, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.Old_Italic), 0, 0, 0]),
		new CRange(0x10330, 0x1034F, c_oUnicodeRangesLID.Gothic, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.Gothic), 0, 0, 0]),
		new CRange(0x10350, 0x1037F, c_oUnicodeRangesLID.Old_Permic, lcid_unknown, []),
		new CRange(0x10380, 0x1039F, c_oUnicodeRangesLID.Ugaritic, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Ugaritic), 0, 0]),
		new CRange(0x103A0, 0x103DF, c_oUnicodeRangesLID.Old_Persian, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Old_Persian), 0, 0]),
		new CRange(0x10400, 0x1044F, c_oUnicodeRangesLID.Deseret, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.Deseret), 0, 0, 0]),
		new CRange(0x10450, 0x1047F, c_oUnicodeRangesLID.Shavian, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Shavian), 0, 0]),
		new CRange(0x10480, 0x104AF, c_oUnicodeRangesLID.Osmanya, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Osmanya), 0, 0]),
		new CRange(0x104B0, 0x104FF, c_oUnicodeRangesLID.Osage, lcid_unknown, []),
		new CRange(0x10500, 0x1052F, c_oUnicodeRangesLID.Elbasan, lcid_unknown, []),
		new CRange(0x10530, 0x1056F, c_oUnicodeRangesLID.Caucasian_Albanian, lcid_unknown, []),
		new CRange(0x10600, 0x1077F, c_oUnicodeRangesLID.Linear_A, lcid_unknown, []),
		new CRange(0x10800, 0x1083F, c_oUnicodeRangesLID.Cypriot_Syllabary, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Cypriot_Syllabary), 0, 0]),
		new CRange(0x10840, 0x1085F, c_oUnicodeRangesLID.Imperial_Aramaic, lcid_unknown, []),
		new CRange(0x10860, 0x1087F, c_oUnicodeRangesLID.Palmyrene, lcid_unknown, []),
		new CRange(0x10880, 0x108AF, c_oUnicodeRangesLID.Nabataean, lcid_unknown, []),
		new CRange(0x108E0, 0x108FF, c_oUnicodeRangesLID.Hatran, lcid_unknown, []),
		new CRange(0x10900, 0x1091F, c_oUnicodeRangesLID.Phoenician, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Phoenician), 0, 0, 0, 0]),
		new CRange(0x10920, 0x1093F, c_oUnicodeRangesLID.Lydian, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Carian), 0, 0]),
		new CRange(0x10980, 0x1099F, c_oUnicodeRangesLID.Meroitic_Hieroglyphs, lcid_unknown, []),
		new CRange(0x109A0, 0x109FF, c_oUnicodeRangesLID.Meroitic_Cursive, lcid_unknown, []),
		new CRange(0x10A00, 0x10A5F, c_oUnicodeRangesLID.Kharoshthi, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Kharoshthi), 0, 0]),
		new CRange(0x10A60, 0x10A7F, c_oUnicodeRangesLID.Old_South_Arabian, lcid_unknown, []),
		new CRange(0x10A80, 0x10A9F, c_oUnicodeRangesLID.Old_North_Arabian, lcid_unknown, []),
		new CRange(0x10AC0, 0x10AFF, c_oUnicodeRangesLID.Manichaean, lcid_unknown, []),
		new CRange(0x10B00, 0x10B3F, c_oUnicodeRangesLID.Avestan, lcid_unknown, []),
		new CRange(0x10B40, 0x10B5F, c_oUnicodeRangesLID.Inscriptional_Parthian, lcid_unknown, []),
		new CRange(0x10B60, 0x10B7F, c_oUnicodeRangesLID.Inscriptional_Pahlavi, lcid_unknown, []),
		new CRange(0x10B80, 0x10BAF, c_oUnicodeRangesLID.Psalter_Pahlavi, lcid_unknown, []),
		new CRange(0x10C00, 0x10C4F, c_oUnicodeRangesLID.Old_Turkic, lcid_unknown, []),
		new CRange(0x10C80, 0x10CFF, c_oUnicodeRangesLID.Old_Hungarian, lcid_unknown, []),
		new CRange(0x10E60, 0x10E7F, c_oUnicodeRangesLID.Rumi_Numeral_Symbols, lcid_unknown, []),
		new CRange(0x11000, 0x1107F, c_oUnicodeRangesLID.Brahmi, lcid_unknown, []),
		new CRange(0x11080, 0x110CF, c_oUnicodeRangesLID.Kaithi, lcid_unknown, []),
		new CRange(0x110D0, 0x110FF, c_oUnicodeRangesLID.Sora_Sompeng, lcid_unknown, []),
		new CRange(0x11100, 0x1114F, c_oUnicodeRangesLID.Chakma, lcid_unknown, []),
		new CRange(0x11150, 0x1117F, c_oUnicodeRangesLID.Mahajani, lcid_unknown, []),
		new CRange(0x11180, 0x111DF, c_oUnicodeRangesLID.Sharada, lcid_unknown, []),
		new CRange(0x111E0, 0x111FF, c_oUnicodeRangesLID.Sinhala_Archaic_Numbers, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.Sinhala), 0, 0, 0]),
		new CRange(0x11200, 0x1124F, c_oUnicodeRangesLID.Khojki, lcid_unknown, []),
		new CRange(0x11280, 0x112AF, c_oUnicodeRangesLID.Multani, lcid_unknown, []),
		new CRange(0x112B0, 0x112FF, c_oUnicodeRangesLID.Khudawadi, lcid_unknown, []),
		new CRange(0x11300, 0x1137F, c_oUnicodeRangesLID.Grantha, lcid_unknown, []),
		new CRange(0x11400, 0x1147F, c_oUnicodeRangesLID.Newa, lcid_unknown, []),
		new CRange(0x11480, 0x114DF, c_oUnicodeRangesLID.Tirhuta, lcid_unknown, []),
		new CRange(0x11580, 0x115FF, c_oUnicodeRangesLID.Siddham, lcid_unknown, []),
		new CRange(0x11600, 0x1165F, c_oUnicodeRangesLID.Modi, lcid_unknown, []),
		new CRange(0x11660, 0x1167F, c_oUnicodeRangesLID.Mongolian_Supplement, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.Mongolian), 0, 0, 0]),
		new CRange(0x11680, 0x116CF, c_oUnicodeRangesLID.Takri, lcid_unknown, []),
		new CRange(0x11700, 0x1173F, c_oUnicodeRangesLID.Ahom, lcid_unknown, []),
		new CRange(0x118A0, 0x118FF, c_oUnicodeRangesLID.Warang_Citi, lcid_unknown, []),
		new CRange(0x11AC0, 0x11AFF, c_oUnicodeRangesLID.Pau_Cin_Hau, lcid_unknown, []),
		new CRange(0x11C00, 0x11C6F, c_oUnicodeRangesLID.Bhaiksuki, lcid_unknown, []),
		new CRange(0x11C70, 0x11CBF, c_oUnicodeRangesLID.Marchen, lcid_unknown, []),
		new CRange(0x12000, 0x123FF, c_oUnicodeRangesLID.Cuneiform, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Cuneiform), 0, 0]),
		new CRange(0x12400, 0x1247F, c_oUnicodeRangesLID.Cuneiform_Numbers_and_Punctuation, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Cuneiform), 0, 0]),
		new CRange(0x12480, 0x1254F, c_oUnicodeRangesLID.Early_Dynastic_Cuneiform, lcid_unknown, []),
		new CRange(0x13000, 0x1342F, c_oUnicodeRangesLID.Egyptian_Hieroglyphs, lcid_unknown, []),
		new CRange(0x14400, 0x1467F, c_oUnicodeRangesLID.Anatolian_Hieroglyphs, lcid_unknown, []),
		new CRange(0x16800, 0x16A3F, c_oUnicodeRangesLID.Bamum_Supplement, lcid_unknown, []),
		new CRange(0x16A40, 0x16A6F, c_oUnicodeRangesLID.Mro, lcid_unknown, []),
		new CRange(0x16AD0, 0x16AFF, c_oUnicodeRangesLID.Bassa_Vah, lcid_unknown, []),
		new CRange(0x16B00, 0x16B8F, c_oUnicodeRangesLID.Pahawh_Hmong, lcid_unknown, []),
		new CRange(0x16F00, 0x16F9F, c_oUnicodeRangesLID.Miao, lcid_zhCN, []),
		new CRange(0x16FE0, 0x16FFF, c_oUnicodeRangesLID.Ideographic_Symbols_and_Punctuation, lcid_unknown, []),
		new CRange(0x17000, 0x187FF, c_oUnicodeRangesLID.Tangut, lcid_unknown, []),
		new CRange(0x18800, 0x18AFF, c_oUnicodeRangesLID.Tangut_Components, lcid_unknown, []),
		new CRange(0x1B000, 0x1B0FF, c_oUnicodeRangesLID.Kana_Supplement, lcid_unknown, []),
		new CRange(0x1BC00, 0x1BC9F, c_oUnicodeRangesLID.Duployan, lcid_unknown, []),
		new CRange(0x1BCA0, 0x1BCAF, c_oUnicodeRangesLID.Shorthand_Format_Controls, lcid_unknown, []),
		new CRange(0x1D000, 0x1D0FF, c_oUnicodeRangesLID.Byzantine_Musical_Symbols, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.Byzantine_Musical_Symbols), 0, 0, 0]),
		new CRange(0x1D100, 0x1D1FF, c_oUnicodeRangesLID.Musical_Symbols, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.Byzantine_Musical_Symbols), 0, 0, 0]),
		new CRange(0x1D200, 0x1D24F, c_oUnicodeRangesLID.Ancient_Greek_Musical_Notation, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.Byzantine_Musical_Symbols), 0, 0, 0]),
		new CRange(0x1D300, 0x1D35F, c_oUnicodeRangesLID.Tai_Xuan_Jing_Symbols, lcid_unknown, []),
		new CRange(0x1D360, 0x1D37F, c_oUnicodeRangesLID.Counting_Rod_Numerals, lcid_unknown, []),
		new CRange(0x1D400, 0x1D7FF, c_oUnicodeRangesLID.Mathematical_Alphanumeric_Symbols, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.Mathematical_Alphanumeric_Symbols), 0, 0, 0]),
		new CRange(0x1D800, 0x1DAAF, c_oUnicodeRangesLID.Sutton_SignWriting, lcid_unknown, []),
		new CRange(0x1E000, 0x1E02F, c_oUnicodeRangesLID.Glagolitic_Supplement, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Glagolitic), 0, 0]),
		new CRange(0x1E800, 0x1E8DF, c_oUnicodeRangesLID.Mende_Kikakui, lcid_unknown, []),
		new CRange(0x1E900, 0x1E95F, c_oUnicodeRangesLID.Adlam, lcid_unknown, []),
		new CRange(0x1EE00, 0x1EEFF, c_oUnicodeRangesLID.Arabic_Mathematical_Alphabetic_Symbols, lcid_unknown, []),
		new CRange(0x1F000, 0x1F02F, c_oUnicodeRangesLID.Mahjong_Tiles, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Domino_Tiles), 0, 0]),
		new CRange(0x1F030, 0x1F09F, c_oUnicodeRangesLID.Domino_Tiles, lcid_unknown, [0, 0, 0, (1 << c_oUnicodeRangeOS2_4.Domino_Tiles), 0, 0]),
		new CRange(0x1F0A0, 0x1F0FF, c_oUnicodeRangesLID.Playing_Cards, lcid_unknown, []),
		new CRange(0x1F100, 0x1F1FF, c_oUnicodeRangesLID.Enclosed_Alphanumeric_Supplement, lcid_unknown, []),
		new CRange(0x1F200, 0x1F2FF, c_oUnicodeRangesLID.Enclosed_Ideographic_Supplement, lcid_unknown, []),
		new CRange(0x1F300, 0x1F5FF, c_oUnicodeRangesLID.Miscellaneous_Symbols_and_Pictographs, lcid_unknown, []),
		new CRange(0x1F600, 0x1F64F, c_oUnicodeRangesLID.Emoticons, lcid_unknown, []),
		new CRange(0x1F650, 0x1F67F, c_oUnicodeRangesLID.Ornamental_Dingbats, lcid_unknown, []),
		new CRange(0x1F680, 0x1F6FF, c_oUnicodeRangesLID.Transport_and_Map_Symbols, lcid_unknown, []),
		new CRange(0x1F700, 0x1F77F, c_oUnicodeRangesLID.Alchemical_Symbols, lcid_unknown, []),
		new CRange(0x1F780, 0x1F7FF, c_oUnicodeRangesLID.Geometric_Shapes_Extended, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Geometric_Shapes), 0, 0, 0, 0]),
		new CRange(0x1F800, 0x1F8FF, c_oUnicodeRangesLID.Supplemental_Arrows_C, lcid_unknown, [0, (1 << c_oUnicodeRangeOS2_2.Arrows), 0, 0, 0, 0]),
		new CRange(0x1F900, 0x1F9FF, c_oUnicodeRangesLID.Supplemental_Symbols_and_Pictographs, lcid_unknown, []),
		new CRange(0x20000, 0x2A6DF, c_oUnicodeRangesLID.CJK_Unified_Ideographs_Extension_B, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.CJK_Unified_Ideographs), 0, (1 << c_oCodePagesOS2_1.Chinese_Simplified) | (1 << c_oCodePagesOS2_1.Chinese_Traditional), 0]),
		new CRange(0x2A700, 0x2B73F, c_oUnicodeRangesLID.CJK_Unified_Ideographs_Extension_C, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.CJK_Unified_Ideographs), 0, (1 << c_oCodePagesOS2_1.Chinese_Simplified) | (1 << c_oCodePagesOS2_1.Chinese_Traditional), 0]),
		new CRange(0x2B740, 0x2B81F, c_oUnicodeRangesLID.CJK_Unified_Ideographs_Extension_D, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.CJK_Unified_Ideographs), 0, (1 << c_oCodePagesOS2_1.Chinese_Simplified) | (1 << c_oCodePagesOS2_1.Chinese_Traditional), 0]),
		new CRange(0x2B820, 0x2CEAF, c_oUnicodeRangesLID.CJK_Unified_Ideographs_Extension_E, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.CJK_Unified_Ideographs), 0, (1 << c_oCodePagesOS2_1.Chinese_Simplified) | (1 << c_oCodePagesOS2_1.Chinese_Traditional), 0]),
		new CRange(0x2F800, 0x2FA1F, c_oUnicodeRangesLID.CJK_Compatibility_Ideographs_Supplement, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.CJK_Strokes), 0, (1 << c_oCodePagesOS2_1.Chinese_Simplified) | (1 << c_oCodePagesOS2_1.Chinese_Traditional), 0]),
		new CRange(0xE0000, 0xE007F, c_oUnicodeRangesLID.Tags, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.Tags), 0, 0, 0]),
		new CRange(0xE0100, 0xE01EF, c_oUnicodeRangesLID.Variation_Selectors_Supplement, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.Variation_Selectors), 0, 0, 0]),
		new CRange(0xF0000, 0xFFFFF, c_oUnicodeRangesLID.Supplementary_Private_Use_Area_A, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.Private_Use_plane_15), 0, 0, 0]),
		new CRange(0x100000, 0x10FFFF, c_oUnicodeRangesLID.Supplementary_Private_Use_Area_B, lcid_unknown, [0, 0, (1 << c_oUnicodeRangeOS2_3.Private_Use_plane_15), 0, 0, 0])
	];

	function getRangeBySymbol(_char, _array)
	{
		// search range by symbol
		var _start = 0;
		var _end = _array.length - 1;

		var _center = 0;
		var _range = null;

		if (_start >= _end)
			return null;

		while (_start < _end)
		{
			var _center = (_start + _end) >> 1;
			var _range = _array[_center];

			if (_range.Start > _char)
				_end = _center - 1;
			else if (_range.End < _char)
				_start = _center + 1;
			else
				return _array[_center];
		}

		if (_start > _end)
			return null;

		_range = _array[_start];
		if (_range.Start > _char || _range.End < _char)
			return null;

		return _array[_start];
	}

	window.getSupportedFonts = function(_char)
	{
		var _range = getRangeBySymbol(_char, c_oUnicodeRanges);
		return window.getSupportedFontsByRange(_range);
	};

	window.getSupportedFontsByRange = function(_range)
	{
		if (null == _range)
			return [];

		var _system_fonts = AscFonts.g_fontApplication.g_fontSelections.List;
		var _count = _system_fonts.length;

		var _retArray = [];

		for (var j = 0; j < _count; j++)
		{
			var _select = _system_fonts[j];

			var _param = _range.Param;

			if (_param[0] != (_select.m_ulUnicodeRange1 & _param[0]))
				continue;

			if (_param[1] != (_select.m_ulUnicodeRange2 & _param[1]))
				continue;

			if (_param[2] != (_select.m_ulUnicodeRange3 & _param[2]))
				continue;

			if (_param[3] != (_select.m_ulUnicodeRange4 & _param[3]))
				continue;

			if (_range.Name == c_oUnicodeRangesLID.CJK_Unified_Ideographs)
			{
				if (0 == (_select.m_ulCodePageRange1 & _param[4]))
					continue;
			}
			else
			{
				if (_param[4] != (_select.m_ulCodePageRange1 & _param[4]))
					continue;
			}

			if (_param[5] != (_select.m_ulCodePageRange2 & _param[5]))
				continue;

			_retArray.push(_select.m_wsFontName);
		}

		return _retArray;
	};

	window.getSupportedRangesByFont = function(_select)
	{
		var _ret = [];
		for(var i = 0; i < c_oUnicodeRanges.length; ++i)
		{
			var _range = c_oUnicodeRanges[i];
            var _param = _range.Param;
            if (_param[0] != (_select.m_ulUnicodeRange1 & _param[0]))
                continue;

            if (_param[1] != (_select.m_ulUnicodeRange2 & _param[1]))
                continue;

            if (_param[2] != (_select.m_ulUnicodeRange3 & _param[2]))
                continue;

            if (_param[3] != (_select.m_ulUnicodeRange4 & _param[3]))
                continue;

            /*if (_range.Name == c_oUnicodeRangesLID.CJK_Unified_Ideographs)
            {
                if (0 == (_select.m_ulCodePageRange1 & _param[4]))
                    continue;
            }
            else
            {
                if (_param[4] != (_select.m_ulCodePageRange1 & _param[4]))
                    continue;
            }*/

			
			if (_param[4] != (_select.m_ulCodePageRange1 & _param[4]))
				continue;
			
            if (_param[5] != (_select.m_ulCodePageRange2 & _param[5]))
                continue;
            _ret.push(_range);
		}
		
		if(_ret.length === 0)
		{
			_ret.push(new CRange(0x0020, 0x007E, c_oUnicodeRangesLID.Basic_Latin, lcid_enUS, [(1 << c_oUnicodeRangeOS2_1.Basic_Latin), 0, 0, 0, (1 << c_oCodePagesOS2_1.Latin_1), 0]));
			_ret.push(new CRange(0x00A0, 0x00FF, c_oUnicodeRangesLID.Latin_1_Supplement, lcid_unknown, [(1 << c_oUnicodeRangeOS2_1.Basic_Latin) | (1 << c_oUnicodeRangeOS2_1.Latin_1_Supplement), 0, 0, 0, (1 << c_oCodePagesOS2_1.Latin_1), 0]));			            
		}
		return _ret;
	};
})(window);