!(function (t, e) {
  "object" == typeof exports && "object" == typeof module
    ? (module.exports = e())
    : "function" == typeof define && define.amd
    ? define([], e)
    : "object" == typeof exports
    ? (exports.rexvirtualjoystickplugin = e())
    : (t.rexvirtualjoystickplugin = e());
})(window, function () {
  return (function (t) {
    var e = {};
    function s(r) {
      if (e[r]) return e[r].exports;
      var i = (e[r] = { i: r, l: !1, exports: {} });
      return t[r].call(i.exports, i, i.exports, s), (i.l = !0), i.exports;
    }
    return (
      (s.m = t),
      (s.c = e),
      (s.d = function (t, e, r) {
        s.o(t, e) || Object.defineProperty(t, e, { enumerable: !0, get: r });
      }),
      (s.r = function (t) {
        "undefined" != typeof Symbol &&
          Symbol.toStringTag &&
          Object.defineProperty(t, Symbol.toStringTag, { value: "Module" }),
          Object.defineProperty(t, "__esModule", { value: !0 });
      }),
      (s.t = function (t, e) {
        if ((1 & e && (t = s(t)), 8 & e)) return t;
        if (4 & e && "object" == typeof t && t && t.__esModule) return t;
        var r = Object.create(null);
        if (
          (s.r(r),
          Object.defineProperty(r, "default", { enumerable: !0, value: t }),
          2 & e && "string" != typeof t)
        )
          for (var i in t)
            s.d(
              r,
              i,
              function (e) {
                return t[e];
              }.bind(null, i)
            );
        return r;
      }),
      (s.n = function (t) {
        var e =
          t && t.__esModule
            ? function () {
                return t.default;
              }
            : function () {
                return t;
              };
        return s.d(e, "a", e), e;
      }),
      (s.o = function (t, e) {
        return Object.prototype.hasOwnProperty.call(t, e);
      }),
      (s.p = ""),
      s((s.s = 361))
    );
  })({
    135: function (t, e, s) {
      "use strict";
      var r = {};
      e.a = function (t, e, s) {
        switch (
          (void 0 === s ? (s = {}) : !0 === s && (s = r),
          (s.left = !1),
          (s.right = !1),
          (s.up = !1),
          (s.down = !1),
          (t = (t + 360) % 360),
          e)
        ) {
          case 0:
            t < 180 ? (s.down = !0) : (s.up = !0);
            break;
          case 1:
            t > 90 && t <= 270 ? (s.left = !0) : (s.right = !0);
            break;
          case 2:
            t > 45 && t <= 135
              ? (s.down = !0)
              : t > 135 && t <= 225
              ? (s.left = !0)
              : t > 225 && t <= 315
              ? (s.up = !0)
              : (s.right = !0);
            break;
          case 3:
            t > 22.5 && t <= 67.5
              ? ((s.down = !0), (s.right = !0))
              : t > 67.5 && t <= 112.5
              ? (s.down = !0)
              : t > 112.5 && t <= 157.5
              ? ((s.down = !0), (s.left = !0))
              : t > 157.5 && t <= 202.5
              ? (s.left = !0)
              : t > 202.5 && t <= 247.5
              ? ((s.left = !0), (s.up = !0))
              : t > 247.5 && t <= 292.5
              ? (s.up = !0)
              : t > 292.5 && t <= 337.5
              ? ((s.up = !0), (s.right = !0))
              : (s.right = !0);
        }
        return s;
      };
    },
    136: function (t, e, s) {
      "use strict";
      e.a = { "up&down": 0, "left&right": 1, "4dir": 2, "8dir": 3 };
    },
    141: function (t, e, s) {
      "use strict";
      var r = s(65),
        i = s(43),
        n = s.n(i),
        o = s(136),
        h = s(135);
      const u = Phaser.Utils.Objects.GetValue,
        a = Phaser.Math.Distance.Between,
        c = Phaser.Math.Angle.Between;
      var d = class extends r.a {
        constructor(t) {
          super(), this.resetFromJSON(t);
        }
        resetFromJSON(t) {
          void 0 == this.start && (this.start = {}),
            void 0 == this.end && (this.end = {}),
            this.setEnable(u(t, "enable", !0)),
            this.setMode(u(t, "dir", "8dir")),
            this.setDistanceThreshold(u(t, "forceMin", 16));
          var e = u(t, "start.x", null),
            s = u(t, "start.y", null),
            r = u(t, "end.x", null),
            i = u(t, "end.y", null);
          return this.setVector(e, s, r, i), this;
        }
        toJSON() {
          return {
            enable: this.enable,
            dir: this.dirMode,
            forceMin: this.forceMin,
            start: { x: this.start.x, y: this.start.y },
            end: { x: this.end.x, y: this.end.y },
          };
        }
        setMode(t) {
          return "string" == typeof t && (t = o.a[t]), (this.dirMode = t), this;
        }
        setEnable(t) {
          if ((t = void 0 == t || !!t) !== this.enable)
            return !1 === t && this.clearVector(), (this.enable = t), this;
        }
        setDistanceThreshold(t) {
          return t < 0 && (t = 0), (this.forceMin = t), this;
        }
        clearVector() {
          return (
            (this.start.x = 0),
            (this.start.y = 0),
            (this.end.x = 0),
            (this.end.y = 0),
            this.clearAllKeysState(),
            this
          );
        }
        setVector(t, e, s, r) {
          if ((this.clearVector(), !this.enable)) return this;
          if (null === t) return this;
          if (
            (void 0 === s && ((s = t), (t = 0), (r = e), (e = 0)),
            (this.start.x = t),
            (this.start.y = e),
            (this.end.x = s),
            (this.end.y = r),
            this.forceMin > 0 && this.force < this.forceMin)
          )
            return this;
          var i = Object(h.a)(this.angle, this.dirMode, !0);
          for (var n in i) i[n] && this.setKeyState(n, !0);
          return this;
        }
        get forceX() {
          return this.end.x - this.start.x;
        }
        get forceY() {
          return this.end.y - this.start.y;
        }
        get force() {
          return a(this.start.x, this.start.y, this.end.x, this.end.y);
        }
        get rotation() {
          return c(this.start.x, this.start.y, this.end.x, this.end.y);
        }
        get angle() {
          return n()(this.rotation);
        }
        get octant() {
          var t = 0;
          return (
            this.rightKeyDown
              ? (t = this.downKeyDown ? 45 : 0)
              : this.downKeyDown
              ? (t = this.leftKeyDown ? 135 : 90)
              : this.leftKeyDown
              ? (t = this.upKeyDown ? 225 : 180)
              : this.upKeyDown && (t = this.rightKeyDown ? 315 : 270),
            t
          );
        }
      };
      const l = Phaser.Events.EventEmitter,
        y = Phaser.Utils.Objects.GetValue,
        b = Phaser.Geom.Circle,
        f = Phaser.Geom.Circle.Contains;
      var p = class extends d {
        constructor(t, e) {
          super(e),
            (this.events = new l()),
            (this.scene = t.scene),
            (this.gameObject = t),
            (this.radius = y(e, "radius", 100)),
            t.setInteractive(
              new b(t.displayOriginX, t.displayOriginY, this.radius),
              f
            ),
            this.boot();
        }
        resetFromJSON(t) {
          return super.resetFromJSON(t), (this.pointer = void 0), this;
        }
        toJSON() {
          var t = super.toJSON();
          return (t.radius = this.radius), t;
        }
        boot() {
          this.gameObject.on("pointerdown", this.onKeyDownStart, this),
            this.gameObject.on("pointerover", this.onKeyDownStart, this),
            this.scene.input.on("pointermove", this.onKeyDown, this),
            this.scene.input.on("pointerup", this.onKeyUp, this),
            this.gameObject.on("destroy", this.destroy, this);
        }
        shutdown() {
          this.scene &&
            (this.scene.input.off("pointermove", this.onKeyDown, this),
            this.scene.input.off("pointerup", this.onKeyUp, this)),
            this.events.destroy(),
            (this.pointer = void 0),
            (this.scene = void 0),
            (this.gameObject = void 0),
            (this.events = void 0);
        }
        destroy() {
          this.shutdown();
        }
        onKeyDownStart(t) {
          t.isDown &&
            void 0 === this.pointer &&
            ((this.pointer = t), this.onKeyDown(t));
        }
        onKeyDown(t) {
          if (this.pointer === t) {
            var e = this.gameObject,
              s = t;
            this.setVector(e.x, e.y, s.x, s.y), this.events.emit("update");
          }
        }
        onKeyUp(t) {
          this.pointer === t &&
            ((this.pointer = void 0),
            this.clearVector(),
            this.events.emit("update"));
        }
        on() {
          var t = this.events;
          return t.on.apply(t, arguments), this;
        }
        once() {
          var t = this.events;
          return t.once.apply(t, arguments), this;
        }
      };
      e.a = p;
    },
    219: function (t, e, s) {
      "use strict";
      var r = s(141);
      const i = Phaser.Utils.Objects.GetValue;
      var n = class {
        constructor(t, e) {
          (this.scene = t),
            (this.base = void 0),
            (this.thumb = void 0),
            (this.touchCursor = void 0),
            (this.radius = i(e, "radius", 100)),
            this.addBase(i(e, "base", void 0), e),
            this.addThumb(i(e, "thumb", void 0));
          var s = i(e, "x", 0),
            r = i(e, "y", 0);
          this.base.setPosition(s, r),
            this.thumb.setPosition(s, r),
            i(e, "fixed", !0) && this.setScrollFactor(0),
            this.boot();
        }
        createCursorKeys() {
          return this.touchCursor.createCursorKeys();
        }
        get forceX() {
          return this.touchCursor.forceX;
        }
        get forceY() {
          return this.touchCursor.forceY;
        }
        get force() {
          return this.touchCursor.force;
        }
        get rotation() {
          return this.touchCursor.rotation;
        }
        get angle() {
          return this.touchCursor.angle;
        }
        get up() {
          return this.touchCursor.upKeyDown;
        }
        get down() {
          return this.touchCursor.downKeyDown;
        }
        get left() {
          return this.touchCursor.leftKeyDown;
        }
        get right() {
          return this.touchCursor.rightKeyDown;
        }
        get noKey() {
          return this.touchCursor.noKeyDown;
        }
        get pointerX() {
          return this.touchCursor.end.x;
        }
        get pointerY() {
          return this.touchCursor.end.y;
        }
        get pointer() {
          return this.touchCursor.pointer;
        }
        setPosition(t, e) {
          return (this.x = t), (this.y = e), this;
        }
        set x(t) {
          this.base.x = t;
        }
        set y(t) {
          this.base.y = t;
        }
        get x() {
          return this.base.x;
        }
        get y() {
          return this.base.y;
        }
        setVisible(t) {
          this.visible = t;
        }
        toggleVisible() {
          this.visible = !this.visible;
        }
        get visible() {
          return this.base.visible;
        }
        set visible(t) {
          (this.base.visible = t), (this.thumb.visible = t);
        }
        setEnable(t) {
          return (this.enable = t), this;
        }
        toggleEnabl() {
          this.enable = !this.enable;
        }
        get enable() {
          return this.touchCursor.enable;
        }
        set enable(t) {
          this.touchCursor.setEnable(t);
        }
        on() {
          var t = this.touchCursor.events;
          return t.on.apply(t, arguments), this;
        }
        once() {
          var t = this.touchCursor.events;
          return t.once.apply(t, arguments), this;
        }
        setVisible(t) {
          return (this.visible = t), this;
        }
        addBase(t, e) {
          return (
            this.base && this.base.destroy(),
            void 0 === t &&
              (t = this.scene.add
                .circle(0, 0, this.radius)
                .setStrokeStyle(3, 255)),
            (this.touchCursor = new r.a(t, e)),
            (this.base = t),
            this
          );
        }
        addThumb(t) {
          return (
            this.thumb && this.thumb.destroy(),
            void 0 === t &&
              (t = this.scene.add.circle(0, 0, 40).setStrokeStyle(3, 65280)),
            (this.thumb = t),
            this
          );
        }
        setScrollFactor(t) {
          this.base.setScrollFactor(t), this.thumb.setScrollFactor(t);
        }
        boot() {
          this.touchCursor.on("update", this.update, this);
        }
        destroy() {
          this.base.destroy(),
            this.thumb.destroy(),
            (this.base = void 0),
            (this.thumb = void 0),
            (this.touchCursor = void 0);
        }
        update() {
          var t = this.touchCursor;
          if (t.anyKeyDown)
            if (t.force > this.radius) {
              var e = t.rotation;
              (this.thumb.x = t.start.x + Math.cos(e) * this.radius),
                (this.thumb.y = t.start.y + Math.sin(e) * this.radius);
            } else (this.thumb.x = t.end.x), (this.thumb.y = t.end.y);
          else (this.thumb.x = this.base.x), (this.thumb.y = this.base.y);
          return this;
        }
      };
      e.a = n;
    },
    361: function (t, e, s) {
      "use strict";
      s.r(e);
      var r = s(219);
      e.default = class extends Phaser.Plugins.BasePlugin {
        constructor(t) {
          super(t);
        }
        start() {
          this.game.events.once("destroy", this.destroy, this);
        }
        add(t, e) {
          return new r.a(t, e);
        }
      };
    },
    43: function (t, e) {
      var s = 180 / Math.PI;
      t.exports = function (t) {
        return t * s;
      };
    },
    65: function (t, e, s) {
      "use strict";
      const r = Phaser.Input.Keyboard.Key;
      var i = {
        altKey: !1,
        ctrlKey: !1,
        shiftKey: !1,
        metaKey: !1,
        location: 0,
      };
      e.a = class {
        constructor() {
          (this.cursorKeys = {
            up: new r(),
            down: new r(),
            left: new r(),
            right: new r(),
          }),
            (this.noKeyDown = !0);
        }
        createCursorKeys() {
          return this.cursorKeys;
        }
        setKeyState(t, e) {
          var s = this.cursorKeys[t];
          return s.enabled
            ? (e && (this.noKeyDown = !1),
              s.isDown !== e &&
                ((i.timeDown = Date.now()), e ? s.onDown(i) : s.onUp(i)),
              this)
            : this;
        }
        clearAllKeysState() {
          for (var t in ((this.noKeyDown = !0), this.cursorKeys))
            this.setKeyState(t, !1);
          return this;
        }
        getKeyState(t) {
          return this.cursorKeys[t];
        }
        get upKeyDown() {
          return this.cursorKeys.up.isDown;
        }
        get downKeyDown() {
          return this.cursorKeys.down.isDown;
        }
        get leftKeyDown() {
          return this.cursorKeys.left.isDown;
        }
        get rightKeyDown() {
          return this.cursorKeys.right.isDown;
        }
        get anyKeyDown() {
          return !this.noKeyDown;
        }
      };
    },
  }).default;
});
