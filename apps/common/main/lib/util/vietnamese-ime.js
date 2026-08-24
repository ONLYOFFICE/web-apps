/**
 * (c) Copyright Ascensio System SIA 2026
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(window, undefined) {
    'use strict';

    var STORAGE_KEY_ENABLED = 'vietnamese-ime-enabled';

    // Disabled by default to prevent unintended input mutations for international users
    var enabled = false;

    // Load persisted user preference from localStorage
    try {
        if (window.localStorage) {
            var storedEnabled = window.localStorage.getItem(STORAGE_KEY_ENABLED);
            if (storedEnabled !== null) {
                enabled = (storedEnabled === 'true');
            }
        }
    } catch (e) {}

    var vowels = {
        'a': { 0: 'a', 1: 'á', 2: 'à', 3: 'ả', 4: 'ã', 5: 'ạ', 'hat': 'â', 'hat1': 'ấ', 'hat2': 'ầ', 'hat3': 'ẩ', 'hat4': 'ẫ', 'hat5': 'ậ', 'breve': 'ă', 'breve1': 'ắ', 'breve2': 'ằ', 'breve3': 'ẳ', 'breve4': 'ẵ', 'breve5': 'ặ' },
        'e': { 0: 'e', 1: 'é', 2: 'è', 3: 'ẻ', 4: 'ẽ', 5: 'ẹ', 'hat': 'ê', 'hat1': 'ế', 'hat2': 'ề', 'hat3': 'ể', 'hat4': 'ễ', 'hat5': 'ệ' },
        'i': { 0: 'i', 1: 'í', 2: 'ì', 3: 'ỉ', 4: 'ĩ', 5: 'ị' },
        'o': { 0: 'o', 1: 'ó', 2: 'ò', 3: 'ỏ', 4: 'õ', 5: 'ọ', 'hat': 'ô', 'hat1': 'ố', 'hat2': 'ồ', 'hat3': 'ổ', 'hat4': 'ỗ', 'hat5': 'ộ', 'horn': 'ơ', 'horn1': 'ớ', 'horn2': 'ờ', 'horn3': 'ở', 'horn4': 'ỡ', 'horn5': 'ợ' },
        'u': { 0: 'u', 1: 'ú', 2: 'ù', 3: 'ủ', 4: 'ũ', 5: 'ụ', 'horn': 'ư', 'horn1': 'ứ', 'horn2': 'ừ', 'horn3': 'ử', 'horn4': 'ữ', 'horn5': 'ự' },
        'y': { 0: 'y', 1: 'ý', 2: 'ỳ', 3: 'ỷ', 4: 'ỹ', 5: 'ỵ' },
        'd': { 0: 'd', 'bar': 'đ' }
    };

    var toneMap = {
        'á': ['a', 1], 'à': ['a', 2], 'ả': ['a', 3], 'ã': ['a', 4], 'ạ': ['a', 5],
        'ấ': ['a', 1, 'hat'], 'ầ': ['a', 2, 'hat'], 'ẩ': ['a', 3, 'hat'], 'ẫ': ['a', 4, 'hat'], 'ậ': ['a', 5, 'hat'],
        'ắ': ['a', 1, 'breve'], 'ằ': ['a', 2, 'breve'], 'ẳ': ['a', 3, 'breve'], 'ẵ': ['a', 4, 'breve'], 'ặ': ['a', 5, 'breve'],
        'é': ['e', 1], 'è': ['e', 2], 'ẻ': ['e', 3], 'ẽ': ['e', 4], 'ẹ': ['e', 5],
        'ế': ['e', 1, 'hat'], 'ề': ['e', 2, 'hat'], 'ể': ['e', 3, 'hat'], 'ễ': ['e', 4, 'hat'], 'ệ': ['e', 5, 'hat'],
        'í': ['i', 1], 'ì': ['i', 2], 'ỉ': ['i', 3], 'ĩ': ['i', 4], 'ị': ['i', 5],
        'ó': ['o', 1], 'ò': ['o', 2], 'ỏ': ['o', 3], 'õ': ['o', 4], 'ọ': ['o', 5],
        'ố': ['o', 1, 'hat'], 'ồ': ['o', 2, 'hat'], 'ổ': ['o', 3, 'hat'], 'ỗ': ['o', 4, 'hat'], 'ộ': ['o', 5, 'hat'],
        'ớ': ['o', 1, 'horn'], 'ờ': ['o', 2, 'horn'], 'ở': ['o', 3, 'horn'], 'ỡ': ['o', 4, 'horn'], 'ợ': ['o', 5, 'horn'],
        'ú': ['u', 1], 'ù': ['u', 2], 'ủ': ['u', 3], 'ũ': ['u', 4], 'ụ': ['u', 5],
        'ứ': ['u', 1, 'horn'], 'ừ': ['u', 2, 'horn'], 'ử': ['u', 3, 'horn'], 'ữ': ['u', 4, 'horn'], 'ự': ['u', 5, 'horn'],
        'ý': ['y', 1], 'ỳ': ['y', 2], 'ỷ': ['y', 3], 'ỹ': ['y', 4], 'ỵ': ['y', 5],
        'â': ['a', 0, 'hat'], 'ă': ['a', 0, 'breve'],
        'ê': ['e', 0, 'hat'],
        'ô': ['o', 0, 'hat'], 'ơ': ['o', 0, 'horn'],
        'ư': ['u', 0, 'horn'],
        'đ': ['d', 0, 'bar']
    };

    function decomposeChar(c) {
        var isUpper = c === c.toUpperCase() && c !== c.toLowerCase();
        var low = c.toLowerCase();
        if (toneMap[low]) {
            var info = toneMap[low];
            var base = isUpper ? info[0].toUpperCase() : info[0];
            return { base: base, tone: info[1] || 0, mod: info[2] || null };
        }
        return { base: c, tone: 0, mod: null };
    }

    function composeChar(base, tone, mod) {
        var isUpper = base === base.toUpperCase() && base !== base.toLowerCase();
        var b = base.toLowerCase();
        if (!vowels[b]) return base;
        var key = mod ? (mod + (tone > 0 ? tone : '')) : (tone > 0 ? tone : 0);
        var res = vowels[b][key] || vowels[b][mod] || vowels[b][tone] || vowels[b][0] || base;
        return isUpper ? res.toUpperCase() : res;
    }

    function isVowel(c) {
        var low = c.toLowerCase();
        return 'aáàảãạâấầẩẫậăắằẳẵặeéèẻẽẹêếềểễệiíìỉĩịoóòỏõọôốồổỗộơớờởỡợuúùủũụưứừửữựyýỳỷỹỵ'.indexOf(low) !== -1;
    }

    function isConsonant(c) {
        var low = c.toLowerCase();
        return 'bcdfghjklmnpqrstvwxzđ'.indexOf(low) !== -1;
    }

    function applyD(word) {
        for (var i = word.length - 1; i >= 0; i--) {
            var c = word[i];
            if (c === 'd') return word.slice(0, i) + 'đ' + word.slice(i + 1);
            if (c === 'D') return word.slice(0, i) + 'Đ' + word.slice(i + 1);
            if (c === 'đ') return word.slice(0, i) + 'd' + word.slice(i + 1);
            if (c === 'Đ') return word.slice(0, i) + 'D' + word.slice(i + 1);
        }
        return null;
    }

    function applyModifier(word, targetMod) {
        for (var i = word.length - 1; i >= 0; i--) {
            var c = word[i];
            var d = decomposeChar(c);
            var b = d.base.toLowerCase();
            if (targetMod === 'hat' && (b === 'a' || b === 'e' || b === 'o')) {
                var newMod = d.mod === 'hat' ? null : 'hat';
                var nc = composeChar(d.base, d.tone, newMod);
                return word.slice(0, i) + nc + word.slice(i + 1);
            }
            if (targetMod === 'horn' && (b === 'u' || b === 'o')) {
                if (i > 0 && word[i - 1].toLowerCase() === 'u' && b === 'o') {
                    var d_u = decomposeChar(word[i - 1]);
                    var nc_u = composeChar(d_u.base, d_u.tone, 'horn');
                    var nc_o = composeChar(d.base, d.tone, 'horn');
                    return word.slice(0, i - 1) + nc_u + nc_o + word.slice(i + 1);
                }
                var newMod = d.mod === 'horn' ? null : 'horn';
                var nc = composeChar(d.base, d.tone, newMod);
                return word.slice(0, i) + nc + word.slice(i + 1);
            }
            if (targetMod === 'breve' && b === 'a') {
                var newMod = d.mod === 'breve' ? null : 'breve';
                var nc = composeChar(d.base, d.tone, newMod);
                return word.slice(0, i) + nc + word.slice(i + 1);
            }
        }
        return null;
    }

    function applyModifierSpecific(word, targetBase, targetMod) {
        for (var i = word.length - 1; i >= 0; i--) {
            var d = decomposeChar(word[i]);
            if (d.base.toLowerCase() === targetBase) {
                var newMod = d.mod === targetMod ? null : targetMod;
                var nc = composeChar(d.base, d.tone, newMod);
                return word.slice(0, i) + nc + word.slice(i + 1);
            }
        }
        return null;
    }

    function applyTelexW(word) {
        for (var i = word.length - 1; i >= 0; i--) {
            var d = decomposeChar(word[i]);
            var b = d.base.toLowerCase();
            if (b === 'u' || b === 'o') {
                if (i > 0 && word[i - 1].toLowerCase() === 'u' && b === 'o') {
                    var d_u = decomposeChar(word[i - 1]);
                    var nc_u = composeChar(d_u.base, d_u.tone, 'horn');
                    var nc_o = composeChar(d.base, d.tone, 'horn');
                    return word.slice(0, i - 1) + nc_u + nc_o + word.slice(i + 1);
                }
                var newMod = d.mod === 'horn' ? null : 'horn';
                var nc = composeChar(d.base, d.tone, newMod);
                return word.slice(0, i) + nc + word.slice(i + 1);
            }
            if (b === 'a') {
                var newMod = d.mod === 'breve' ? null : 'breve';
                var nc = composeChar(d.base, d.tone, newMod);
                return word.slice(0, i) + nc + word.slice(i + 1);
            }
        }
        return null;
    }

    function findToneVowelIndex(word) {
        var vowelIndices = [];
        for (var i = 0; i < word.length; i++) {
            if (isVowel(word[i])) vowelIndices.push(i);
        }
        if (vowelIndices.length === 0) return -1;
        if (vowelIndices.length === 1) return vowelIndices[0];

        var lastVowelIdx = vowelIndices[vowelIndices.length - 1];
        var hasEndConsonant = lastVowelIdx < word.length - 1 && isConsonant(word[word.length - 1]);

        if (hasEndConsonant) {
            return vowelIndices[vowelIndices.length - 1];
        } else {
            var vStr = vowelIndices.map(function(idx) { return word[idx].toLowerCase(); }).join('');
            if (vStr === 'oa' || vStr === 'oe' || vStr === 'uy') {
                return vowelIndices[1];
            }
            return vowelIndices[0];
        }
    }

    function applyTone(word, targetTone) {
        var targetIdx = findToneVowelIndex(word);
        if (targetIdx === -1) return null;

        var newChars = [];
        for (var i = 0; i < word.length; i++) {
            var d = decomposeChar(word[i]);
            if (isVowel(word[i])) {
                var toneToSet = (i === targetIdx) ? (d.tone === targetTone ? 0 : targetTone) : 0;
                newChars.push(composeChar(d.base, toneToSet, d.mod));
            } else {
                newChars.push(word[i]);
            }
        }
        var res = newChars.join('');
        return res === word ? null : res;
    }

    function processWord(word, key) {
        if (!word) return null;
        var lowerKey = key.toLowerCase();

        // 1. VNI input
        if (/^[1-90]$/.test(key)) {
            if (key === '1') return applyTone(word, 1);
            if (key === '2') return applyTone(word, 2);
            if (key === '3') return applyTone(word, 3);
            if (key === '4') return applyTone(word, 4);
            if (key === '5') return applyTone(word, 5);
            if (key === '0') return applyTone(word, 0);
            if (key === '6') return applyModifier(word, 'hat');
            if (key === '7') return applyModifier(word, 'horn');
            if (key === '8') return applyModifier(word, 'breve');
            if (key === '9') return applyD(word);
        }

        // 2. Telex input
        if (lowerKey === 's') return applyTone(word, 1);
        if (lowerKey === 'f') return applyTone(word, 2);
        if (lowerKey === 'r') return applyTone(word, 3);
        if (lowerKey === 'x') return applyTone(word, 4);
        if (lowerKey === 'j') return applyTone(word, 5);
        if (lowerKey === 'z') return applyTone(word, 0);
        if (lowerKey === 'a') return applyModifierSpecific(word, 'a', 'hat');
        if (lowerKey === 'e') return applyModifierSpecific(word, 'e', 'hat');
        if (lowerKey === 'o') return applyModifierSpecific(word, 'o', 'hat');
        if (lowerKey === 'w') return applyTelexW(word);
        if (lowerKey === 'd') return applyD(word);

        return null;
    }

    // Standard English Toast feedback
    var toastTimer = null;
    function showToast(text) {
        var toast = document.getElementById('vietime-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'vietime-toast';
            toast.style.cssText = 'position:fixed;top:45px;right:25px;z-index:999999;background:rgba(25,25,25,0.92);color:#fff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;padding:6px 14px;border-radius:4px;box-shadow:0 4px 16px rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.15);backdrop-filter:blur(8px);pointer-events:none;transition:opacity 0.25s ease, transform 0.25s ease;opacity:0;transform:translateY(-8px);';
            document.body.appendChild(toast);
        }
        toast.textContent = text;
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-8px)';
        }, 1100);
    }

    function handleKeyDown(e) {
        // Hotkey (Ctrl + Shift) toggles IME on/off
        if (e.ctrlKey && e.shiftKey && (e.key === 'Control' || e.key === 'Shift')) {
            enabled = !enabled;
            try {
                if (window.localStorage) {
                    window.localStorage.setItem(STORAGE_KEY_ENABLED, enabled ? 'true' : 'false');
                }
            } catch (err) {}
            showToast(enabled ? 'Vietnamese IME: ON (VNI/Telex)' : 'Vietnamese IME: OFF');
            return;
        }

        if (!enabled) return;
        if (e.ctrlKey || e.altKey || e.metaKey) return;

        var key = e.key;
        if (!key || key.length !== 1) return;

        var target = e.target || document.activeElement;
        if (!target) return;

        var isInput = target.tagName === 'TEXTAREA' || target.tagName === 'INPUT';
        var isContentEditable = target.isContentEditable;

        if (!isInput && !isContentEditable) return;

        var fullText = isInput ? target.value : target.innerText;
        var cursorPos = isInput ? target.selectionStart : fullText.length;

        var beforeCursor = fullText.slice(0, cursorPos);
        var match = beforeCursor.match(/[a-zA-Z0-9áàảãạâấầẩẫậăắằẳẵặéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠÂẤẦẨẪẬĂẮẰẲẴẶÉÈẺẼẸÊẾỀỂỄỆÍÌỈĨỊÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ]+$/);

        if (!match) return;

        var currentWord = match[0];
        var transformed = processWord(currentWord, key);

        if (transformed && transformed !== currentWord) {
            e.preventDefault();
            e.stopPropagation();

            var wordStart = cursorPos - currentWord.length;
            var afterCursor = fullText.slice(cursorPos);
            var newText = fullText.slice(0, wordStart) + transformed + afterCursor;
            var newCursor = wordStart + transformed.length;

            if (isInput) {
                target.value = newText;
                target.setSelectionRange(newCursor, newCursor);
            } else {
                target.innerText = newText;
            }

            var inputEvt = new InputEvent('input', {
                bubbles: true,
                cancelable: true,
                inputType: 'insertText',
                data: transformed
            });
            target.dispatchEvent(inputEvt);
        }
    }

    // Expose programmatic API for external plugins/controls
    window.VietnameseIME = {
        isEnabled: function() { return enabled; },
        setEnabled: function(val) {
            enabled = !!val;
            try { if (window.localStorage) window.localStorage.setItem(STORAGE_KEY_ENABLED, enabled ? 'true' : 'false'); } catch (e) {}
        }
    };

    // Register event listener
    window.addEventListener('keydown', handleKeyDown, true);

})(window);
