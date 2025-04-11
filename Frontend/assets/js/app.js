!(function (e) {
  "use strict";
  e("#side-menu").metisMenu(),
    e("#vertical-menu-btn").on("click", function (t) {
      t.preventDefault(),
        e("body").toggleClass("sidebar-enable"),
        992 <= e(window).width()
          ? e("body").toggleClass("vertical-collpsed")
          : e("body").removeClass("vertical-collpsed");
    }),
    e("#sidebar-menu a").each(function () {
      var t = window.location.href.split(/[?#]/)[0];
      this.href == t &&
        (e(this).addClass("active"),
        e(this).parent().addClass("mm-active"),
        e(this).parent().parent().addClass("mm-show"),
        e(this).parent().parent().prev().addClass("mm-active"),
        e(this).parent().parent().parent().addClass("mm-active"),
        e(this).parent().parent().parent().parent().addClass("mm-show"),
        e(this)
          .parent()
          .parent()
          .parent()
          .parent()
          .parent()
          .addClass("mm-active"));
    }),
    e(".navbar-nav a").each(function () {
      var t = window.location.href.split(/[?#]/)[0];
      this.href == t &&
        (e(this).addClass("active"),
        e(this).parent().addClass("active"),
        e(this).parent().parent().addClass("active"),
        e(this).parent().parent().parent().parent().addClass("active"),
        e(this).parent().parent().parent().parent().parent().addClass("active"),
        e(this)
          .parent()
          .parent()
          .parent()
          .parent()
          .parent()
          .parent()
          .addClass("active"),
        e(this)
          .parent()
          .parent()
          .parent()
          .parent()
          .parent()
          .parent()
          .parent()
          .addClass("active"));
    }),
    e(".right-bar-toggle").on("click", function (t) {
      e("body").toggleClass("right-bar-enabled");
    }),
    e(document).on("click", "body", function (t) {
      0 < e(t.target).closest(".right-bar-toggle, .right-bar").length ||
        e("body").removeClass("right-bar-enabled");
    }),
    e(".dropdown-menu a.dropdown-toggle").on("click", function (t) {
      return (
        e(this).next().hasClass("show") ||
          e(this)
            .parents(".dropdown-menu")
            .first()
            .find(".show")
            .removeClass("show"),
        e(this).next(".dropdown-menu").toggleClass("show"),
        !1
      );
    }),
    Waves.init();
})(jQuery);
var bodyElem = document.documentElement,
  lightDarkBtn =
    (bodyElem.hasAttribute("data-bs-theme") &&
    "light" == bodyElem.getAttribute("data-bs-theme")
      ? sessionStorage.setItem("data-layout-mode", "light")
      : "dark" == bodyElem.getAttribute("data-bs-theme") &&
        sessionStorage.setItem("data-layout-mode", "dark"),
    null == sessionStorage.getItem("data-layout-mode")
      ? bodyElem.setAttribute("data-bs-theme", "light")
      : sessionStorage.getItem("data-layout-mode") &&
        bodyElem.setAttribute(
          "data-bs-theme",
          sessionStorage.getItem("data-layout-mode")
        ),
    document.getElementById("light-dark-mode"));
lightDarkBtn &&
  lightDarkBtn.addEventListener("click", function (t) {
    bodyElem.hasAttribute("data-bs-theme") &&
    "dark" == bodyElem.getAttribute("data-bs-theme")
      ? (bodyElem.setAttribute("data-bs-theme", "light"),
        sessionStorage.setItem("data-layout-mode", "light"))
      : (bodyElem.setAttribute("data-bs-theme", "dark"),
        sessionStorage.setItem("data-layout-mode", "dark"));
  });

  







 


 






