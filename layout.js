// レイアウト設定（layout-editor.html で書き出し）。index/editor が読む。座標系 1456 x 819。
window.LAYOUT = {
  "typography": {
    "spacing": 0.2,
    "lineHeight": 1.1
  },
  "swatches": [
    {
      "id": "green",
      "color": "#43b149"
    },
    {
      "id": "red",
      "color": "#e83817"
    },
    {
      "id": "ink",
      "color": "#231815"
    },
    {
      "id": "gray",
      "color": "#bdbdbd"
    },
    {
      "id": "white",
      "color": "#ffffff"
    }
  ],
  "motion": {
    "slideMs": 400,
    "ease": "ease-out",
    "hoverOffset": 20,
    "hoverMs": 100,
    "blinkMs": 500,
    "bounceMs": 100,
    "shakeMs": 400
  },
  "screens": {
    "title": {
      "name": "Game — Title",
      "bg": "#6f7682",
      "elements": {
        "edit": {
          "label": "EDIT ボタン",
          "type": "text",
          "text": "EDIT",
          "x": 34,
          "y": 52,
          "size": 26,
          "color": "#999999",
          "align": "left"
        },
        "indGreen": {
          "label": "下部 緑 SWAY",
          "type": "text",
          "text": "SWAY",
          "x": 34,
          "y": 790,
          "size": 30,
          "color": "#43b149",
          "align": "left",
          "swatch": "green"
        },
        "indRed": {
          "label": "下部 赤 WAYS",
          "type": "text",
          "text": "WAYS",
          "x": 1422,
          "y": 790,
          "size": 30,
          "color": "#e83817",
          "align": "right",
          "swatch": "red"
        },
        "lineL": {
          "label": "下線L",
          "type": "hline",
          "x": 210,
          "y": 776,
          "w": 418,
          "color": "#222222"
        },
        "lineR": {
          "label": "下線R",
          "type": "hline",
          "x": 828,
          "y": 776,
          "w": 418,
          "color": "#222222"
        },
        "start": {
          "label": "START/READY?",
          "type": "pill",
          "text": "READY?",
          "x": 728,
          "y": 792,
          "size": 34,
          "color": "#222222",
          "align": "center",
          "w": 230,
          "h": 78
        }
      }
    },
    "play": {
      "name": "Game — Playing",
      "bg": "#6f7682",
      "elements": {
        "exit": {
          "label": "EXIT",
          "type": "text",
          "text": "EXIT",
          "x": 34,
          "y": 52,
          "size": 26,
          "color": "#999999",
          "align": "left"
        },
        "hint": {
          "label": "HINT",
          "type": "pill",
          "text": "HINT ???",
          "x": 1422,
          "y": 50,
          "size": 28,
          "color": "#222222",
          "align": "right",
          "w": 300,
          "h": 48
        },
        "quit": {
          "label": "QUIT",
          "type": "text",
          "text": "QUIT",
          "x": 1422,
          "y": 52,
          "size": 26,
          "color": "#111111",
          "align": "right"
        },
        "timer": {
          "label": "タイマー",
          "type": "text",
          "text": "02:00",
          "x": 728,
          "y": 790,
          "size": 40,
          "color": "#111111",
          "align": "center"
        },
        "indGreen": {
          "label": "進捗 緑",
          "type": "text",
          "text": "STEP",
          "x": 34,
          "y": 790,
          "size": 30,
          "color": "#43b149",
          "align": "left",
          "swatch": "green"
        },
        "indRed": {
          "label": "進捗 赤",
          "type": "text",
          "text": "PETS",
          "x": 1422,
          "y": 790,
          "size": 30,
          "color": "#e83817",
          "align": "right",
          "swatch": "red"
        },
        "lineL": {
          "label": "下線L",
          "type": "hline",
          "x": 210,
          "y": 776,
          "w": 418,
          "color": "#222222"
        },
        "lineR": {
          "label": "下線R",
          "type": "hline",
          "x": 828,
          "y": 776,
          "w": 418,
          "color": "#222222"
        }
      }
    },
    "hint": {
      "name": "Game — Hint",
      "bg": "#ffffff",
      "elements": {
        "bar": {
          "label": "進捗バー",
          "type": "hbar",
          "x": 0,
          "y": 0,
          "w": 1456,
          "h": 8,
          "color": "#222222"
        }
      }
    },
    "clear": {
      "name": "Game — Clear",
      "bg": "#ffffff",
      "elements": {
        "clearText": {
          "label": "CLEAR!",
          "type": "text",
          "text": "CLEAR",
          "x": 728,
          "y": 794,
          "size": 42,
          "color": "#111111",
          "align": "center"
        }
      }
    },
    "gameover": {
      "name": "Game — Over",
      "bg": "#eeeeee",
      "elements": {
        "title": {
          "label": "GAME OVER",
          "type": "text",
          "text": "GAME OVER",
          "x": 728,
          "y": 380,
          "size": 64,
          "color": "#111111",
          "align": "center"
        },
        "retry": {
          "label": "RETRY",
          "type": "text",
          "text": "RETRY",
          "x": 618,
          "y": 470,
          "size": 30,
          "color": "#111111",
          "align": "center"
        },
        "exit": {
          "label": "EXIT",
          "type": "text",
          "text": "EXIT",
          "x": 838,
          "y": 470,
          "size": 30,
          "color": "#111111",
          "align": "center"
        }
      }
    },
    "editEdit": {
      "name": "Editor — EDIT",
      "bg": "#ffffff",
      "elements": {
        "title": {
          "label": "タイトル",
          "type": "text",
          "text": "ANAGRAM EDITOR",
          "x": 724,
          "y": 103,
          "size": 66,
          "color": "#231815",
          "align": "center",
          "swatch": "ink"
        },
        "exit": {
          "label": "EXIT",
          "type": "text",
          "text": "EXIT",
          "x": 34,
          "y": 52,
          "size": 26,
          "color": "#bdbdbd",
          "align": "left",
          "swatch": "gray"
        },
        "list": {
          "label": "←LIST",
          "type": "arrowTextL",
          "text": "LIST",
          "x": 1416,
          "y": 92,
          "size": 48,
          "color": "#231815",
          "align": "right",
          "gap": 58,
          "swatch": "ink"
        },
        "boxGreen": {
          "label": "緑ボックス",
          "type": "box",
          "x": 130,
          "y": 315,
          "w": 400,
          "h": 150,
          "color": "#43b149",
          "swatch": "green"
        },
        "boxRed": {
          "label": "赤ボックス",
          "type": "box",
          "x": 700,
          "y": 315,
          "w": 400,
          "h": 150,
          "color": "#e83817",
          "swatch": "red"
        },
        "swap": {
          "label": "SWAP",
          "type": "swap",
          "text": "SWAP",
          "x": 615,
          "y": 372,
          "size": 28,
          "color": "#231815",
          "align": "center",
          "swatch": "ink"
        },
        "save": {
          "label": "SAVE",
          "type": "pill",
          "text": "SAVE",
          "x": 1270,
          "y": 393,
          "size": 50,
          "color": "#231815",
          "align": "center",
          "w": 240,
          "h": 70,
          "swatch": "ink"
        },
        "importBtn": {
          "label": "IMPORT SVG",
          "type": "pill",
          "text": "IMPORT SVG",
          "x": 728,
          "y": 650,
          "size": 46,
          "color": "#231815",
          "align": "center",
          "w": 440,
          "h": 72,
          "swatch": "ink"
        }
      }
    },
    "editList": {
      "name": "Editor — LIST",
      "bg": "#ffffff",
      "elements": {
        "close": {
          "label": "CLOSE→",
          "type": "arrowTextR",
          "text": "CLOSE",
          "x": 40,
          "y": 92,
          "size": 50,
          "color": "#231815",
          "align": "left",
          "gap": 14,
          "swatch": "ink"
        },
        "grid": {
          "label": "単語リスト",
          "type": "list",
          "x": 374,
          "y": 92,
          "size": 52,
          "color": "#231815",
          "swatch": "ink"
        },
        "colEdit": {
          "label": "EDIT",
          "type": "text",
          "text": "EDIT",
          "x": 1110,
          "y": 92,
          "size": 52,
          "color": "#231815",
          "align": "left",
          "swatch": "ink"
        },
        "colSwap": {
          "label": "SWAP",
          "type": "text",
          "text": "SWAP",
          "x": 1110,
          "y": 194,
          "size": 52,
          "color": "#231815",
          "align": "left",
          "swatch": "ink"
        },
        "colDelete": {
          "label": "DELETE",
          "type": "text",
          "text": "DELETE",
          "x": 1110,
          "y": 294,
          "size": 52,
          "color": "#231815",
          "align": "left",
          "swatch": "ink"
        },
        "sort": {
          "label": "並べ替え",
          "type": "sort",
          "x": 1110,
          "y": 648,
          "size": 26,
          "color": "#231815",
          "gap": 54,
          "swatch": "ink"
        },
        "dividerL": {
          "label": "仕切り線L",
          "type": "vline",
          "x": 340
        },
        "dividerR": {
          "label": "仕切り線R",
          "type": "vline",
          "x": 1080
        }
      }
    }
  }
};

window.LY = {
  type(){ return window.LAYOUT.typography; },
  motion(){ return window.LAYOUT.motion; },
  el(screen, key){ const s=window.LAYOUT.screens[screen]; return s && s.elements[key]; }
};
