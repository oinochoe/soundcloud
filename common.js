$(document).ready(function() {
    var c = SC.Widget($(".sc_music_player")[0]);
    var k = {
        auto_play: true,
        buying: false,
        sharing: false,
        download: false,
        show_artwork: false,
        show_playcount: false,
        show_user: false,
        single_active: false,
        start_track: 0
    };
    var b = (function() {
        var n = {};
        var o = $(".sound_cloud_player .group_playlist li");
        o.each(function(p, q) {
            var r = $(q).find("a");
            if (!n[r.data("album")]) {
                n[r.data("album")] = []
            }
            n[r.data("album")].push({
                title: r.text(),
                duration: r.data("duration"),
                album: r.data("album"),
                url: r.data("url")
            })
        });
        return n
    }
    )();
    function i(q, n) {
        var o = (q.clientX - n.offset().left);
        var r = parseInt(o / n.width() * 100);
        if (r < 0) {
            p(0)
        } else {
            if (r > 100) {
                p(100)
            } else {
                p(r)
            }
        }
        function p(s) {
            d(s);
            e(s)
        }
    }
    function e(n) {
        c.getDuration(function(p) {
            var o = Math.floor(p * (n / 100));
            c.seekTo(o)
        })
    }
    function d(p) {
        var n = $(".info_play .bar_container .bar_progress");
        var o = $(".info_play .bar_container .control_bar");
        n.width(p + "%");
        o.css("left", p + "%")
    }
    function h(n) {
        var p = $(".sound_cloud_player");
        var q = p.find(".info_play .wrap_thumb .thumb");
        var o = p.find(".info_play .cont_thumb .desc_thumb");
        var r = p.find(".info_play .txt_playtime");
        d(0);
        p.addClass("loading");
        q.find("span").removeClass("on");
        q.find("." + n.album).addClass("on");
        o.text(n.title);
        r.text(n.duration);
        $(".group_btn [data-volume]").addClass("on")
    }
    function l(o, n) {
        var p = o.parent().index();
        $(n).removeClass("on");
        $(n).eq(p).addClass("on")
    }
    function f(p) {
        var n = p.parent().index();
        var o = "feature_music tab" + (n + 1);
        $(".feature_music").attr("class", o)
    }
    function m(o) {
        var n = $(o.target);
        c.getVolume(function(q) {
            var p = q;
            if (p > 0) {
                c.setVolume(0);
                n.removeClass("on").text("볼륨 off")
            } else {
                c.setVolume(100);
                n.addClass("on").text("볼륨 on")
            }
        });
        o.preventDefault()
    }
    function g(o) {
        var n = $(o.target).data("playctrl");
        c.isPaused(function(q) {
            var p = q;
            if (p && n == "play") {
                c.play()
            } else {
                if (!p && n == "pause") {
                    c.pause()
                }
            }
        });
        o.preventDefault()
    }
    $(".info_play .bar_container").on({
        mousedown: function(o) {
            var n = $(this);
            i(o, n);
            n.addClass("hold");
            n.on("mousemove", function(p) {
                i(p, n);
                p.preventDefault()
            });
            o.preventDefault()
        },
        mouseup: function(o) {
            var n = $(this);
            n.removeClass("hold");
            n.off("mousemove");
            o.preventDefault()
        },
        mouseleave: function(o) {
            var n = $(this);
            n.removeClass("hold");
            n.off("mousemove");
            o.preventDefault()
        }
    });
    var j = $("#fansiteTab");
    j.find(".link_tab").on("click", function(o) {
        var n = $(this);
        j.find("li").removeClass("on").find(".link_tab").attr("aria-selected", "false");
        n.parent().addClass("on").find(".link_tab").attr("aria-selected", "true");
        l(n, "[data-fansitekit]");
        o.preventDefault()
    });
    $(".tab_playlist").on("click", ".link_tab", function(o) {
        var n = $(this);
        $(".tab_playlist .link_tab").attr("aria-selected", "false");
        n.attr("aria-selected", "true");
        l(n, ".group_playlist");
        f(n);
        o.preventDefault()
    });
    $("[data-playCtrl]").click(g);
    $(".group_btn [data-volume]").click(m);
    $(".group_playlist li").find("a.link_txt").on("click", function(t) {
        var s = $(".sound_cloud_player");
        var o = $(".sound_cloud_player .group_playlist li");
        var q = $(this).parent("li");
        var n = parseInt(q.index());
        var p = b[$(this).data("album")][n];
        var r = !s.hasClass("loading") && !q.hasClass("on");
        if (r) {
            c.pause();
            c.load(p.url, k);
            h(p);
            o.removeClass("on");
            q.addClass("on")
        }
        t.preventDefault()
    });
    c.bind(SC.Widget.Events.READY, function() {
        h(b.balenos[0]);
        $(".sound_cloud_player").removeClass("loading")
    });
    c.bind(SC.Widget.Events.PLAY, function(n) {
        setTimeout(function() {
            $(".sound_cloud_player").removeClass("loading")
        }, 1000);
        $("[data-playCtrl=play]").addClass("on");
        $("[data-playCtrl=pause]").removeClass("on")
    });
    c.bind(SC.Widget.Events.PAUSE, function(n) {
        $("[data-playCtrl=play]").removeClass("on");
        $("[data-playCtrl=pause]").addClass("on")
    });
    c.bind(SC.Widget.Events.FINISH, function(n) {
        $("[data-playCtrl=play]").removeClass("on");
        $("[data-playCtrl=pause]").removeClass("on")
    });
    c.bind(SC.Widget.Events.PLAY_PROGRESS, function(o) {
        var p = Math.floor(o.relativePosition * 100);
        var n = $(".info_play .bar_container").hasClass("hold");
        if (!n) {
            d(p)
        }
    })
});